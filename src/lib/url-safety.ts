/**
 * Shared SSRF guard. Every outbound fetch the crawler makes — the root URL
 * a user typed in AND every link discovered while crawling a site — must go
 * through this check first. A single-page crawl only had one attacker-
 * controlled URL to worry about (whatever the dashboard user pasted in).
 * A multi-page crawl follows links found ON the target site, which is not
 * something the dashboard user directly controls — a malicious or
 * misconfigured page could link internally to something like a cloud
 * metadata endpoint and have it auto-followed with no human in the loop.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // cloud metadata endpoint (AWS/GCP/Azure)
  'metadata.google.internal',
]);

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
  let u: URL;
  try {
    u = new URL(urlStr);
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

/**
 * Fetch with a hard timeout — a hung crawl target should never hang the
 * whole crawl job.
 */
export async function safeFetch(url: string, timeoutMs = 10000, init: RequestInit = {}): Promise<Response> {
  if (!isSafeUrl(url)) {
    throw new Error(`Blocked unsafe URL: ${url}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
