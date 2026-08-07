import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || 'site_acme_123';

  const conversations = await db.getConversationsAsync(websiteId);
  return NextResponse.json({ conversations });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, assignedAgent } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Conversation ID and status required' }, { status: 400 });
    }

    const updated = db.updateConversationStatus(id, status, assignedAgent);
    return NextResponse.json({ success: true, conversation: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating conversation' }, { status: 500 });
  }
}
