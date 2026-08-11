import { NextRequest, NextResponse } from 'next/server';
import { db, TransientFirestoreError } from '@/lib/db';
import { generateGeminiChatStream } from '@/lib/gemini';
import { retrieveRelevantContextAsync } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      websiteId,
      // PAIN POINT (fixed): previously no visitorId was ever sent by the
      // client, so every caller collapsed onto this 'vis_anon' default and
      // could land in a stranger's conversation. Widget now always sends a
      // real one; the default only protects against a caller that skips it
      // entirely (e.g. a raw API test), and we log loudly when that happens
      // so it's visible in server logs rather than silently corrupting data.
      visitorId = 'vis_anon',
      conversationId,
      message,
      currentUrl,
    } = body;

    if (visitorId === 'vis_anon') {
      console.warn(
        `[chat/stream] PAIN POINT: request arrived with no visitorId (websiteId=${websiteId}). ` +
        `This request will be bucketed with any other caller missing a visitorId — check the caller.`
      );
    }

    if (!message) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }
    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId parameter required' }, { status: 400 });
    }

    let website;
    try {
      website = await db.getWebsiteAsync(websiteId);
    } catch (err) {
      if (err instanceof TransientFirestoreError) {
        console.warn(`[chat/stream] PAIN POINT: transient Firestore error loading website ${websiteId}, telling client to retry`, err);
        return NextResponse.json(
          { error: 'Temporarily unable to load configuration, please retry' },
          { status: 503, headers: { 'Retry-After': '1' } }
        );
      }
      throw err;
    }
    if (!website) {
      console.warn(`[chat/stream] PAIN POINT: no website config found for websiteId=${websiteId}`);
      return NextResponse.json({ error: 'Website configuration not found' }, { status: 404 });
    }

    // 1. Get or create conversation record — now scoped by a real visitorId,
    // so this can no longer merge two different visitors together.
    console.log(`[chat/stream] resolving conversation for websiteId=${websiteId} visitorId=${visitorId} incomingConversationId=${conversationId || 'none'}`);
    const conv = await db.createOrGetConversationAsync(websiteId, visitorId, { currentUrl });
    const activeConvId = conversationId || conv.id;
    console.log(`[chat/stream] using conversationId=${activeConvId}`);

    // Save visitor message — awaited so we know it landed before we spend
    // money generating a response for a message that might not have saved.
    try {
      await db.addMessageAsync(activeConvId, {
        conversationId: activeConvId,
        sender: 'visitor',
        content: message,
      });
    } catch (err) {
      console.error(`[chat/stream] PAIN POINT: failed to persist visitor message for conversation ${activeConvId}`, err);
      // Non-fatal — still try to answer the visitor even if the write failed.
    }

    // 2. Retrieve relevant knowledge base context via vector search
    // (replaces the previous url_context-based approach, which relied on
    // Gemini fetching the live domain per-message and had no connection
    // to the crawled/embedded knowledge base at all).
    console.log(`[chat/stream] retrieving RAG context for query: "${message.slice(0, 80)}"`);
    const retrieved = await retrieveRelevantContextAsync(websiteId, message);
    if (retrieved.sources.length === 0) {
      console.warn(`[chat/stream] PAIN POINT: no knowledge base matches found for websiteId=${websiteId} — answer will be unsupported by any indexed content`);
    } else {
      console.log(`[chat/stream] RAG context found — ${retrieved.sources.length} source page(s): ${retrieved.sources.map((s) => s.url || s.title).join(', ')}`);
    }
    const sources = retrieved.sources;

    // 3. Create ReadableStream for SSE response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata chunk with conversation ID and sources
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ conversationId: activeConvId, sources, status: conv.status })}\n\n`)
        );

        let fullAiText = '';

        const result = await generateGeminiChatStream({
          website,
          userQuery: message,
          history: conv.messages || [],
          retrievedContext: retrieved.contextText,
          onChunk: (chunkText) => {
            fullAiText += chunkText;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
            );
          }
        });

        if (result.degraded) {
          console.warn(`[chat/stream] PAIN POINT: response was degraded-mode for conversation ${activeConvId} (Gemini call failed or no API key)`);
        }

        // If human handoff was triggered, update conversation status —
        // now awaited so the client's status update in this same SSE
        // stream is guaranteed to reflect what's actually in Firestore.
        if (result.shouldHandoff) {
          try {
            await db.updateConversationStatus(activeConvId, 'human_requested');
            console.log(`[chat/stream] conversation ${activeConvId} marked human_requested`);
          } catch (err) {
            console.error(`[chat/stream] PAIN POINT: failed to persist human_requested status for conversation ${activeConvId}`, err);
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: 'human_requested' })}\n\n`)
          );
        }

        // Save AI response message, including the sources actually used —
        // previously always saved as an empty array regardless of what
        // knowledge base content (if any) informed the answer.
        try {
          await db.addMessageAsync(activeConvId, {
            conversationId: activeConvId,
            sender: 'ai',
            content: fullAiText || result.fullResponse,
            ...(sources.length > 0 ? { sources } : {}),
          });
        } catch (err) {
          console.error(`[chat/stream] PAIN POINT: failed to persist AI message for conversation ${activeConvId}`, err);
        }

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
    console.error('[chat/stream] PAIN POINT: unhandled error in chat/stream route', err);
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
