type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs?: number;
};

type Bucket = {
  timestamps: number[];
};

const globalForRateLimit = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalForRateLimit.__rateLimitBuckets ?? new Map<string, Bucket>();
if (!globalForRateLimit.__rateLimitBuckets) globalForRateLimit.__rateLimitBuckets = buckets;

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    buckets.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterMs };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: Math.max(0, limit - bucket.timestamps.length) };
}
