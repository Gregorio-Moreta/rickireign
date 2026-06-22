/**
 * Best-effort in-memory rate limiter (sliding window), keyed by IP + route.
 *
 * This is a lightweight safeguard layered on top of Turnstile + the honeypot —
 * NOT a distributed guarantee: each serverless instance has its own memory (and
 * Cloudflare isolates are short-lived), so limits are per-instance. For hard,
 * global limits, use Cloudflare WAF rate-limiting rules / Vercel Firewall, or an
 * external store (e.g. Upstash). For a low-traffic marketing site this stops
 * casual hammering with no added infrastructure.
 */

type Timestamps = number[];
const buckets = new Map<string, Timestamps>();

// Cap the map so a flood of unique keys can't grow memory unbounded.
const MAX_KEYS = 5000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - hits[0])) / 1000);
    buckets.set(key, hits);
    return { ok: false, retryAfterSeconds };
  }

  hits.push(now);
  if (buckets.size > MAX_KEYS) buckets.clear();
  buckets.set(key, hits);
  return { ok: true, retryAfterSeconds: 0 };
}
