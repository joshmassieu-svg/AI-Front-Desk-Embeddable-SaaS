import { db } from './db';
import { embedText } from './embeddings';

export interface RetrievedContext {
  contextText: string;
  sources: { title: string; url?: string }[];
}

/**
 * Retrieves relevant knowledge via vector similarity search, not keyword
 * matching. The visitor's question is embedded, then compared against
 * pre-embedded chunks (created at ingestion time — see
 * src/lib/crawler.ts + src/app/api/v1/knowledge/*) using Firestore's
 * native nearest-neighbor search.
 *
 * If embedding the query fails (e.g. no valid Gemini key configured) this
 * returns an empty context rather than throwing — the chat flow degrades
 * to "no knowledge base context" rather than failing the whole request.
 * The caller (gemini.ts) is responsible for being honest with the visitor
 * when that happens, rather than papering over it.
 */
export async function retrieveRelevantContextAsync(
  websiteId: string,
  userQuery: string
): Promise<RetrievedContext> {
  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(userQuery, 'RETRIEVAL_QUERY');
  } catch (err) {
    console.error('retrieveRelevantContextAsync: failed to embed query:', err);
    return { contextText: '', sources: [] };
  }

  const chunks = await db.queryKnowledgeChunksByVectorAsync(websiteId, queryEmbedding, 5);
  if (chunks.length === 0) {
    return { contextText: '', sources: [] };
  }

  const contextText = chunks
    .map((c) => `--- SOURCE${c.sourceUrl ? `: ${c.sourceUrl}` : ''} ---\n${c.content}`)
    .join('\n\n');

  // De-duplicate sources (multiple chunks can come from the same page)
  const seen = new Set<string>();
  const sources: { title: string; url?: string }[] = [];
  for (const c of chunks) {
    const key = c.sourceUrl || c.knowledgeItemId;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ title: c.sourceUrl || 'Knowledge base', url: c.sourceUrl });
  }

  return { contextText, sources };
}
