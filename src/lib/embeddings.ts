/**
 * Wraps Gemini's text-embedding-004 model. Same API key already used for
 * chat (GEMINI_API_KEY) — no new provider, no new credential.
 */

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const EMBEDDING_DIM = 768;

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  return key;
}

/**
 * Embed a single piece of text. Throws if the API key is missing/invalid or
 * the request fails — callers decide how to handle that (skip the chunk,
 * fail the whole ingestion job, etc.) rather than this silently returning
 * a zero vector, which would poison retrieval quality invisibly.
 */
export async function embedText(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing or a placeholder — cannot generate embeddings.');
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_DIM,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Embedding request failed (${res.status}) using model "${EMBEDDING_MODEL}": ${body}\n` +
      `If this is a 404, the model was likely deprecated — check ` +
      `https://ai.google.dev/gemini-api/docs/deprecations and set ` +
      `GEMINI_EMBEDDING_MODEL to the current recommended replacement.`
    );
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
    throw new Error('Embedding response missing or wrong dimension');
  }
  return values as number[];
}

/**
 * Embed many chunks with basic concurrency control and per-item error
 * isolation — one failing chunk shouldn't fail the whole batch.
 */
export async function embedBatch(
  texts: string[],
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY',
  concurrency = 3
): Promise<Array<{ text: string; embedding: number[] | null; error?: string }>> {
  const results: Array<{ text: string; embedding: number[] | null; error?: string }> = new Array(texts.length);
  let cursor = 0;

  async function worker() {
    while (cursor < texts.length) {
      const i = cursor++;
      try {
        const embedding = await embedText(texts[i], taskType);
        results[i] = { text: texts[i], embedding };
      } catch (err: any) {
        results[i] = { text: texts[i], embedding: null, error: err.message };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, worker));
  return results;
}

export { EMBEDDING_DIM };
