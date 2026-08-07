import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { crawlWebpageUrl } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const { websiteId = 'site_acme_123', url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { title, content } = await crawlWebpageUrl(url);

    const item = await db.addKnowledgeItemAsync({
      websiteId,
      type: 'url',
      title: title || url,
      sourceUrl: url,
      content,
      chunksCount: Math.ceil(content.length / 400),
      status: 'indexed',
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Crawl failed' }, { status: 500 });
  }
}
