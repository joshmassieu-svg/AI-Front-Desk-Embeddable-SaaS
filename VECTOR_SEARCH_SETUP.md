# Vector Search + Multi-Page Crawler — Deployment Notes

## 1. Deploy the Firestore vector index (required, one-time)

Vector indexes cannot be created from the Firebase console UI — only via CLI:

```bash
npm install -g firebase-tools   # if not already installed
firebase login
firebase deploy --only firestore:indexes --project <your-project-id>
```

This reads `firestore.indexes.json` (already added at the repo root) and
provisions the vector index on `knowledgeChunks.embedding`. Until this is
deployed, `queryKnowledgeChunksByVectorAsync` will log an error and return
an empty array — the chat flow still works, it just won't find any
knowledge base context.

## 2. Firestore SDK version

Vector search (`findNearest`, `vector()`) requires `firebase` JS SDK
>= 10.7.0. Check `package.json` and run `npm install firebase@latest` if
you're on an older version.

## 3. A real Gemini API key is required for both chat AND embeddings

Both `src/lib/gemini.ts` (chat) and `src/lib/embeddings.ts` (ingestion +
query embedding) read `GEMINI_API_KEY`. If it's missing or still the
placeholder value from `.env.example`, ingestion (crawling/pasting
knowledge) will fail per-chunk (logged, not fatal) and the chat fallback
will honestly tell visitors the assistant isn't configured yet, instead of
silently running scripted responses.

## 4. Existing knowledge lapses (by design, per decision made during review)

Any `KnowledgeItem` created before this change has no corresponding
`KnowledgeChunk` docs, so it won't be found by vector search. It will
effectively go quiet until someone re-crawls the URL or re-pastes the text
through the dashboard, which now runs through the new chunk+embed pipeline
automatically. No backfill script was built — this was an explicit choice,
not an oversight.

## 5. Multi-page crawl guardrails (src/lib/crawler.ts)

- Max 50 pages per crawl job, max depth 2, 10s timeout per page.
- Every discovered link is checked against `src/lib/url-safety.ts` before
  being fetched — not just the root URL a human typed in.
- `robots.txt` is checked and disallowed paths are skipped.
- A failed page is recorded as failed and surfaced back to the caller —
  it is never replaced with fabricated placeholder content.

Trigger a site-wide crawl by POSTing to `/api/v1/knowledge/crawl` with
`{ websiteId, url: rootUrl, mode: 'site' }`. Omit `mode` (or send anything
else) for the original single-page behavior.
