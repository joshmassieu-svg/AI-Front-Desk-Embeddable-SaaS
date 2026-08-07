import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retrieveRelevantContextAsync } from '@/lib/rag';
import { generateGeminiChatStream } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId = 'site_acme_123', visitorId = 'vis_anon', conversationId, message, currentUrl } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    const website = await db.getWebsiteAsync(websiteId);
    if (!website) {
      return NextResponse.json({ error: 'Website configuration not found' }, { status: 404 });
    }

    // 1. Get or create conversation record in Firestore database
    const conv = await db.createOrGetConversationAsync(websiteId, visitorId, { currentUrl });
    const activeConvId = conversationId || conv.id;

    // Save visitor message to Firestore database
    await db.addMessageAsync(activeConvId, {
      conversationId: activeConvId,
      sender: 'visitor',
      content: message,
    });

    // 2. Perform RAG context retrieval from Firestore database
    const { contextText, sources } = await retrieveRelevantContextAsync(websiteId, message);

    // 3. Create ReadableStream for SSE response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata chunk with conversation ID and sources
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ conversationId: activeConvId, sources, status: conv.status })}\n\n`)
        );

        let fullAiText = '';

        // Execute Gemini Stream
        const result = await generateGeminiChatStream({
          website,
          userQuery: message,
          history: conv.messages || [],
          knowledgeContext: contextText,
          onChunk: (chunkText) => {
            fullAiText += chunkText;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
            );
          }
        });

        // If human handoff was triggered, update conversation status in Firestore database
        if (result.shouldHandoff) {
          db.updateConversationStatus(activeConvId, 'human_requested');
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: 'human_requested' })}\n\n`)
          );
        }

        // Save AI response message to Firestore database
        await db.addMessageAsync(activeConvId, {
          conversationId: activeConvId,
          sender: 'ai',
          content: fullAiText || result.fullResponse,
          sources: sources.length > 0 ? sources : undefined,
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
