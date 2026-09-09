/**
 * Shared SSRF guard and URL normalizer. Every outbound fetch the crawler makes
 * goes through this check first.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // cloud metadata endpoint (AWS/GCP/Azure)
  'metadata.google.internal',
]);

export function normalizeUrl(urlStr: string): string {
  let trimmed = (urlStr || '').trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local)
  if (a === 127) return true; // 127.0.0.0/8
  return false;
}

export function isSafeUrl(urlStr: string): boolean {
  const normalized = normalizeUrl(urlStr);
  let u: URL;
  try {
    u = new URL(normalized);
  } catch {
    return false;
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;

  const hostname = u.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) return false;
  if (isPrivateIpv4(hostname)) return false;

  // Block IPv6 unique-local / link-local ranges too (fc00::/7, fe80::/10)
  if (hostname.startsWith('[fc') || hostname.startsWith('[fd') || hostname.startsWith('[fe80')) {
    return false;
  }

  return true;
}

const DEFAULT_CRAWLER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Fetch with a hard timeout — a hung crawl target should never hang the
 * whole crawl job.
 */
export async function safeFetch(url: string, timeoutMs = 10000, init: RequestInit = {}): Promise<Response> {
  const targetUrl = normalizeUrl(url);
  if (!isSafeUrl(targetUrl)) {
    throw new Error(`Blocked unsafe or invalid URL: ${url}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const mergedHeaders = { ...DEFAULT_CRAWLER_HEADERS, ...(init.headers || {}) };
    return await fetch(targetUrl, { ...init, headers: mergedHeaders, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

