// lib/rateLimit.ts — Simple in-memory rate limiter for API routes
const IP_STORE = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(IP_STORE.entries()).forEach(([key, val]) => {
      if (val.resetAt <= now) IP_STORE.delete(key);
    });
  }, 5 * 60_000);
}

interface RateLimitOptions {
  /** Max requests per window */
  max?: number;
  /** Window duration in seconds */
  windowSec?: number;
}

export function rateLimit(
  ip: string,
  opts: RateLimitOptions = {}
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const { max = 20, windowSec = 60 } = opts;
  const now = Date.now();
  const key = ip;

  let record = IP_STORE.get(key);
  if (!record || record.resetAt <= now) {
    record = { count: 0, resetAt: now + windowSec * 1000 };
    IP_STORE.set(key, record);
  }

  record.count += 1;

  if (record.count > max) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { ok: false, remaining: 0, retryAfterSec };
  }

  return { ok: true, remaining: max - record.count, retryAfterSec: 0 };
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}
