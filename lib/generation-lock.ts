import { eq, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { generationLocks } from "@/db/schema";

/** Acquire or steal an expired distributed generation claim. */
export async function claimGeneration(
  key: string,
  ttlMs = 10 * 60 * 1000,
): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);
    const result = await db.execute<{ key: string }>(sql`
      INSERT INTO generation_lock (key, expires_at)
      VALUES (${key}, ${expiresAt})
      ON CONFLICT (key) DO UPDATE
        SET expires_at = EXCLUDED.expires_at
        WHERE generation_lock.expires_at < now()
      RETURNING key
    `);
    const rows = Array.isArray(result)
      ? result
      : (result as unknown as { rows?: Array<{ key: string }> }).rows ?? [];
    return rows.length > 0;
  } catch (err) {
    // Deployment remains backwards-compatible if application code reaches an
    // instance before migration 0069. Generation can proceed without the
    // optimization; the underlying write paths remain idempotent.
    console.warn("[generation-lock] claim failed:", (err as Error).message);
    return true;
  }
}

export async function releaseGeneration(key: string): Promise<void> {
  try {
    await db.delete(generationLocks).where(eq(generationLocks.key, key));
  } catch (err) {
    console.warn("[generation-lock] release failed:", (err as Error).message);
  }
}

/** Remove claims left behind when an invocation was terminated mid-job. */
export async function pruneGenerationLocks(): Promise<void> {
  try {
    await db
      .delete(generationLocks)
      .where(lt(generationLocks.expiresAt, new Date()));
  } catch (err) {
    console.warn("[generation-lock] prune failed:", (err as Error).message);
  }
}
