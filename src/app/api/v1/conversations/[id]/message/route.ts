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

    db.updateConversationStatus(conversationId, 'human_active', agentName);

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error sending agent message' }, { status: 500 });
  }
}
