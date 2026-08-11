import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id;
    const { content, agentName = 'Support Agent' } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const msg = await db.addMessageAsync(conversationId, {
      conversationId,
      sender: 'agent',
      content,
      agentName,
    });

    // PAIN POINT (fixed): previously fired without awaiting, so the
    // response could return before this status change actually persisted.
    try {
      await db.updateConversationStatus(conversationId, 'human_active', agentName);
    } catch (err) {
      console.error(`[conversations/message] PAIN POINT: agent message saved but status update to human_active failed for ${conversationId}`, err);
    }

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    console.error('[conversations/message] PAIN POINT: failed to send agent message', err);
    return NextResponse.json({ error: err.message || 'Error sending agent message' }, { status: 500 });
  }
}
