import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chunkText } from '@/lib/chunking';
import { embedBatch } from '@/lib/embeddings';

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
      chunksCount: 0,
      status: 'processing',
    });

    const chunks = chunkText(content, title);
    const embedded = await embedBatch(
      chunks.map((c) => c.text),
      'RETRIEVAL_DOCUMENT'
    );
    const successful = embedded
      .map((e, i) => ({ e, chunk: chunks[i] }))
      .filter(({ e }) => e.embedding !== null);

    await db.addKnowledgeChunksAsync(
      successful.map(({ e, chunk }) => ({
        knowledgeItemId: item.id,
        websiteId,
        content: e.text,
        sourceUrl,
        chunkIndex: chunk.index,
        embedding: e.embedding as number[],
      }))
    );

    await db.updateKnowledgeItemStatusAsync(item.id, successful.length > 0 ? 'indexed' : 'error', successful.length);

    return NextResponse.json({
      success: true,
      item: { ...item, status: successful.length > 0 ? 'indexed' : 'error', chunksCount: successful.length },
    });
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
