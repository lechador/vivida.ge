import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { rateLimitHits } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";

/**
 * Fixed-window rate limiter backed by Postgres — no Redis/KV dependency.
 *
 * Each call atomically increments a per-(bucket, identifier, window) counter
 * via an INSERT … ON CONFLICT DO UPDATE … RETURNING, which is race-safe even
 * under concurrent serverless invocations (the DB serializes the upsert). If
 * the post-increment count exceeds the limit, it throws a 429 with a
 * Retry-After header.
 *
 * Identifiers are hashed before storage, so this table never holds raw IPs
 * or email addresses.
 */
function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function enforceRateLimit(opts: {
  /** Logical limiter name, e.g. "login_ip". */
  bucket: string;
  /** Raw IP or email — hashed before it touches the DB. */
  identifier: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}): Promise<void> {
  const { bucket, limit, windowMs } = opts;
  const identifier = hashIdentifier(opts.identifier);

  // Align to a fixed window boundary so every request in the same window
  // maps to the same row.
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimitHits)
    .values({ bucket, identifier, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [
        rateLimitHits.bucket,
        rateLimitHits.identifier,
        rateLimitHits.windowStart,
      ],
      set: { count: sql`${rateLimitHits.count} + 1` },
    })
    .returning({ count: rateLimitHits.count });

  const count = row?.count ?? 1;
  if (count > limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowStart.getTime() + windowMs - now) / 1000)
    );
    throw new ApiError(
      429,
      "rate_limited",
      "Too many requests. Please slow down and try again later.",
      { "Retry-After": String(retryAfterSec) }
    );
  }
}

/**
 * Convenience wrapper: enforce both a per-IP and a per-email limit for an
 * endpoint in one call. Either limit tripping throws 429.
 */
export async function enforceAuthRateLimit(opts: {
  action: string;
  ip: string;
  email?: string | null;
  ipLimit: number;
  emailLimit: number;
  windowMs: number;
}): Promise<void> {
  await enforceRateLimit({
    bucket: `${opts.action}_ip`,
    identifier: opts.ip,
    limit: opts.ipLimit,
    windowMs: opts.windowMs,
  });
  if (opts.email) {
    await enforceRateLimit({
      bucket: `${opts.action}_email`,
      identifier: opts.email.trim().toLowerCase(),
      limit: opts.emailLimit,
      windowMs: opts.windowMs,
    });
  }
}

/**
 * Delete rate-limit rows whose window is well in the past. Called from the
 * daily cron — keeps the table from accumulating dead counters. Failures
 * are swallowed; pruning is housekeeping, never request-critical.
 */
export async function pruneRateLimits(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.delete(rateLimitHits).where(lt(rateLimitHits.windowStart, cutoff));
  } catch (err) {
    console.warn("[rate-limit] prune failed:", (err as Error).message);
  }
}
