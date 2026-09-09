import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { crawlSinglePage, crawlSite } from '@/lib/crawler';
import { chunkText } from '@/lib/chunking';
import { embedBatch } from '@/lib/embeddings';
import { normalizeUrl } from '@/lib/url-safety';

/**
 * Chunk + embed a single crawled page and persist both the raw
 * KnowledgeItem (for dashboard display) and its KnowledgeChunk docs (what
 * vector search actually queries against).
 */
async function ingestPage(
  websiteId: string,
  page: { url: string; title: string; content: string },
  crawlJobId?: string
) {
  const item = await db.addKnowledgeItemAsync({
    websiteId,
    type: 'url',
    title: page.title || page.url,
    sourceUrl: page.url,
    content: page.content,
    chunksCount: 0,
    status: 'processing',
    ...(crawlJobId ? { crawlJobId } : {}),
  });

  const chunks = chunkText(page.content, page.title);
  const embedded = await embedBatch(
    chunks.map((c) => c.text),
    'RETRIEVAL_DOCUMENT'
  );

  const successfulChunks = embedded
    .map((e, i) => ({ e, chunk: chunks[i] }))
    .filter(({ e }) => e.embedding !== null);

  await db.addKnowledgeChunksAsync(
    successfulChunks.map(({ e, chunk }) => ({
      knowledgeItemId: item.id,
      websiteId,
      content: e.text,
      sourceUrl: page.url,
      chunkIndex: chunk.index,
      embedding: e.embedding as number[],
    }))
  );

  const failedCount = embedded.length - successfulChunks.length;
  await db.updateKnowledgeItemStatusAsync(
    item.id,
    successfulChunks.length > 0 ? 'indexed' : 'error',
    successfulChunks.length
  );

  return { item, chunksIndexed: successfulChunks.length, chunksFailed: failedCount };
}

export async function POST(req: NextRequest) {
  try {
    const { websiteId, url, mode } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId is required' }, { status: 400 });
    }

    const targetUrl = normalizeUrl(url);

    // mode: 'site' crawls the whole domain (up to page/depth limits);
    // anything else (default) crawls just the one URL, same as before.
    if (mode === 'site') {
      let result;
      try {
        result = await crawlSite(targetUrl);
      } catch (err: any) {
        return NextResponse.json({ error: `Site crawl failed: ${err.message}` }, { status: 400 });
      }

      if (result.pages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No accessible pages could be crawled. Check if URL is public and valid.',
            failed: result.failed,
            skippedByRobots: result.skippedByRobots,
          },
          { status: 400 }
        );
      }

      const crawlJobId = `crawljob_${Date.now()}`;
      const ingested = [];
      for (const page of result.pages) {
        try {
          ingested.push(await ingestPage(websiteId, page, crawlJobId));
        } catch (err: any) {
          result.failed.push({ url: page.url, reason: `Ingestion failed: ${err.message}` });
        }
      }

      return NextResponse.json({
        success: true,
        crawlJobId,
        pagesIndexed: ingested.length,
        pagesFailed: result.failed.length,
        skippedByRobots: result.skippedByRobots,
        failed: result.failed,
      });
    }

    // Single-page mode (default / backward compatible)
    let page;
    try {
      page = await crawlSinglePage(targetUrl);
    } catch (err: any) {
      return NextResponse.json({ error: `Crawl failed: ${err.message}` }, { status: 400 });
    }

    const result = await ingestPage(websiteId, page);
    return NextResponse.json({ success: true, item: result.item, chunksIndexed: result.chunksIndexed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Crawl failed' }, { status: 500 });
  }
}

