import { isSafeUrl, safeFetch } from './url-safety';

const MAX_PAGES = 50;
const MAX_DEPTH = 2; // root (0) + pages it links to (1) + pages those link to (2)
const PER_PAGE_TIMEOUT_MS = 10000;
const USER_AGENT = 'Flowdexx-Website-AI-Crawler/1.0';

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

export interface FailedPage {
  url: string;
  reason: string;
}

export interface CrawlResult {
  pages: CrawledPage[];
  failed: FailedPage[];
  skippedByRobots: string[];
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&rsquo;': '\u2019',
  '&lsquo;': '\u2018',
  '&rdquo;': '\u201d',
  '&ldquo;': '\u201c',
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&hellip;': '\u2026',
};

function decodeEntities(input: string): string {
  return input
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos|rsquo|lsquo|rdquo|ldquo|mdash|ndash|hellip);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Pull out just the main content region before stripping tags, so we don't
 * drag the site nav/header/footer into every single page's indexed text.
 * Falls back progressively: <main> -> <article> -> <body> -> whole doc.
 * Regex-based (no cheerio dependency) — good enough for the typical
 * marketing-site structure this crawler targets, not a general HTML parser.
 */
function extractMainRegion(html: string): string {
  const tryMatch = (re: RegExp) => {
    const m = html.match(re);
    return m ? m[1] : null;
  };

  return (
    tryMatch(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    tryMatch(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    tryMatch(/<body[^>]*>([\s\S]*?)<\/body>/i) ||
    html
  );
}

function stripHtml(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';

  const mainRegion = extractMainRegion(html);

  let text = mainRegion
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  text = decodeEntities(text).replace(/\s+/g, ' ').trim();

  return { title, text };
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const base = new URL(baseUrl);
  const hrefRegex = /<a\s+[^>]*href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], baseUrl);
      // Same-domain only — we're not building a general-purpose crawler,
      // just following a client's own site.
      if (resolved.hostname !== base.hostname) continue;
      resolved.hash = '';
      links.add(resolved.toString());
    } catch {
      // ignore malformed hrefs (mailto:, javascript:, etc.)
    }
  }

  return Array.from(links);
}

async function fetchRobotsDisallowRules(origin: string): Promise<string[]> {
  try {
    const res = await safeFetch(`${origin}/robots.txt`, 5000, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return [];
    const text = await res.text();

    const disallows: string[] = [];
    let applies = false;
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (/^user-agent:\s*\*/i.test(line)) {
        applies = true;
        continue;
      }
      if (/^user-agent:/i.test(line)) {
        applies = false;
        continue;
      }
      if (applies) {
        const m = line.match(/^disallow:\s*(.*)$/i);
        if (m && m[1]) disallows.push(m[1].trim());
      }
    }
    return disallows;
  } catch {
    // robots.txt missing/unreachable — treat as "no restrictions", same as
    // most crawlers do.
    return [];
  }
}

function isDisallowed(pathname: string, disallowRules: string[]): boolean {
  return disallowRules.some((rule) => rule && pathname.startsWith(rule));
}

async function fetchOnePageRaw(url: string): Promise<{ html: string; contentType: string }> {
  const res = await safeFetch(url, PER_PAGE_TIMEOUT_MS, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text')) {
    throw new Error(`Unsupported content-type: ${contentType}`);
  }
  const html = await res.text();
  return { html, contentType };
}

async function fetchOnePage(url: string): Promise<CrawledPage> {
  const { html } = await fetchOnePageRaw(url);
  const { title, text } = stripHtml(html);
  if (!text) {
    throw new Error('No extractable text content');
  }
  return { url, title: title || url, content: text };
}

/**
 * Crawl a single page only — used by the existing "paste one URL" flow.
 * No fabricated fallback content on failure: a failed crawl throws, and the
 * caller is responsible for surfacing that honestly instead of silently
 * indexing made-up text as if it were real page content.
 */
export async function crawlSinglePage(url: string): Promise<CrawledPage> {
  if (!isSafeUrl(url)) {
    throw new Error('URL not allowed (blocked host or unsupported protocol)');
  }
  return fetchOnePage(url);
}

/**
 * Crawl an entire site starting from `rootUrl`, following same-domain links
 * up to MAX_DEPTH, capped at MAX_PAGES total. Every URL — the root AND every
 * discovered link — goes through isSafeUrl before being fetched.
 */
export async function crawlSite(rootUrl: string): Promise<CrawlResult> {
  if (!isSafeUrl(rootUrl)) {
    throw new Error('URL not allowed (blocked host or unsupported protocol)');
  }

  const origin = new URL(rootUrl).origin;
  const disallowRules = await fetchRobotsDisallowRules(origin);

  const visited = new Set<string>();
  const pages: CrawledPage[] = [];
  const failed: FailedPage[] = [];
  const skippedByRobots: string[] = [];

  let queue: Array<{ url: string; depth: number }> = [{ url: rootUrl, depth: 0 }];

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const batch = queue.splice(0, 5); // small concurrency batch per depth-level

    const results = await Promise.all(
      batch.map(async ({ url, depth }) => {
        if (visited.has(url) || pages.length >= MAX_PAGES) return null;
        visited.add(url);

        const pathname = (() => {
          try {
            return new URL(url).pathname;
          } catch {
            return '/';
          }
        })();
        if (isDisallowed(pathname, disallowRules)) {
          skippedByRobots.push(url);
          return null;
        }

        if (!isSafeUrl(url)) {
          failed.push({ url, reason: 'Blocked unsafe URL' });
          return null;
        }

        try {
          const { html } = await fetchOnePageRaw(url);
          const { title, text } = stripHtml(html);
          if (!text) throw new Error('No extractable text content');
          const page: CrawledPage = { url, title: title || url, content: text };

          let links: string[] = [];
          if (depth < MAX_DEPTH) {
            links = extractLinks(html, url);
          }
          return { page, links, depth };
        } catch (err: any) {
          failed.push({ url, reason: err.message || 'Fetch failed' });
          return null;
        }
      })
    );

    for (const result of results) {
      if (!result) continue;
      pages.push(result.page);
      if (result.depth < MAX_DEPTH) {
        for (const link of result.links) {
          if (!visited.has(link) && pages.length + queue.length < MAX_PAGES) {
            queue.push({ url: link, depth: result.depth + 1 });
          }
        }
      }
    }
  }

  return { pages, failed, skippedByRobots };
}
