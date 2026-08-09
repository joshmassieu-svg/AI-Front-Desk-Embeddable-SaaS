import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId');

  if (!websiteId) {
    return NextResponse.json({ items: [] });
  }

  const items = await db.getKnowledgeItemsAsync(websiteId);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, type = 'text', title, content, fileName, sourceUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId is required' }, { status: 400 });
    }

    const item = await db.addKnowledgeItemAsync({
      websiteId,
      type,
      title,
      content,
      fileName,
      sourceUrl,
      chunksCount: Math.ceil(content.length / 400),
      status: 'indexed',
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error adding item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const success = await db.deleteKnowledgeItemAsync(id);
  return NextResponse.json({ success });
}
