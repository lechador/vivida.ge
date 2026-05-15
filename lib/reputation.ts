import { and, eq, gt, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  reputationEvents,
  userReputation,
  type ReputationEventKind,
} from "@/db/schema";

/**
 * Reputation event rules. Each kind has a point value and an optional
 * daily cap (per-user, per-kind). The cap is enforced by SUM-ing
 * today's earnings for that kind before inserting — over the cap, the
 * insert is a no-op.
 *
 * `dailyCap: null` means "one-shot or rate-managed by uniqueness alone"
 * (e.g. joined / profile_completed / first_post / daily_visit are
 * deduplicated by their subjectId, so no cap math needed).
 */
export const REPUTATION_RULES: Record<
  ReputationEventKind,
  { points: number; dailyCap: number | null }
> = {
  // What you do
  post_created: { points: 3, dailyCap: 9 },
  comment_created: { points: 1, dailyCap: 5 },
  friend_added: { points: 5, dailyCap: 20 },
  daily_visit: { points: 1, dailyCap: null }, // dedupe by date
  // What others do to you
  reaction_received: { points: 2, dailyCap: 30 },
  comment_received: { points: 3, dailyCap: 30 },
  // One-shot milestones (dedupe by user)
  profile_completed: { points: 10, dailyCap: null },
  first_post: { points: 5, dailyCap: null },
  joined: { points: 5, dailyCap: null },
};

/**
 * Credit a user with reputation for a specific event. Idempotent on
 * `(kind, subjectId)` — calling twice with the same identifiers is a
 * no-op. Returns the number of points actually awarded (0 if deduped
 * or daily-capped).
 *
 * Errors are swallowed and logged — reputation is opportunistic,
 * never the reason a user-facing action fails.
 */
export async function awardReputation(opts: {
  userId: string;
  kind: ReputationEventKind;
  subjectId: string;
}): Promise<number> {
  const rule = REPUTATION_RULES[opts.kind];
  if (!rule) return 0;
  const points = rule.points;

  try {
    // Daily-cap check. Skipped for one-shot kinds (cap=null) since the
    // unique dedupe index already guarantees they fire at most once.
    if (rule.dailyCap !== null) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const [row] = await db
        .select({
          earned: sql<number>`COALESCE(SUM(${reputationEvents.points})::int, 0)`,
        })
        .from(reputationEvents)
        .where(
          and(
            eq(reputationEvents.userId, opts.userId),
            eq(reputationEvents.kind, opts.kind),
            gt(reputationEvents.createdAt, startOfDay)
          )
        );
      if (Number(row?.earned ?? 0) >= rule.dailyCap) return 0;
    }

    // Try the insert; the unique dedupe index will reject duplicates.
    const inserted = await db
      .insert(reputationEvents)
      .values({
        userId: opts.userId,
        kind: opts.kind,
        subjectId: opts.subjectId,
        points,
      })
      .onConflictDoNothing()
      .returning({ id: reputationEvents.id });

    if (inserted.length === 0) return 0;

    // Bump the running total. Race-safe: the SQL increment is atomic
    // even if two awards land at the same millisecond.
    await db
      .insert(userReputation)
      .values({ userId: opts.userId, total: points, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userReputation.userId,
        set: {
          total: sql`${userReputation.total} + ${points}`,
          updatedAt: new Date(),
        },
      });

    return points;
  } catch (err) {
    console.warn(
      "[reputation.award] failed",
      opts.kind,
      opts.subjectId,
      ":",
      (err as Error).message
    );
    return 0;
  }
}

/** Total reputation for one user. Returns 0 when the user has never
 *  earned anything (no row in user_reputation). */
export async function getReputation(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: userReputation.total })
    .from(userReputation)
    .where(eq(userReputation.userId, userId))
    .limit(1);
  return Number(row?.total ?? 0);
}

/** Batched lookup — returns a Map of userId → total for the supplied
 *  ids. Missing ids get 0 (no row in user_reputation yet). Used by
 *  feed/profile views to avoid N+1 reputation queries. */
export async function getReputationFor(
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await db
    .select({
      userId: userReputation.userId,
      total: userReputation.total,
    })
    .from(userReputation)
    .where(inArray(userReputation.userId, userIds));
  const map = new Map<string, number>();
  for (const id of userIds) map.set(id, 0);
  for (const r of rows) map.set(r.userId, Number(r.total));
  return map;
}

/**
 * Reverse previously-awarded reputation when the underlying thing is
 * deleted (e.g., a post or comment). Reads the matching events from
 * the audit table, totals the points per user, decrements the
 * running totals, then removes the audit rows so the same subject
 * can't be deducted twice.
 *
 * The unique `(kind, subject_id)` index guarantees at most one event
 * row per pair, so the SELECT is bounded by the number of pairs
 * passed in.
 *
 * Clamped at 0 — bookkeeping bugs (e.g. an event that was awarded
 * but the running total later got reset) shouldn't be able to push a
 * user into negative reputation.
 *
 * Errors are swallowed and logged. Reputation is opportunistic — a
 * failed revocation shouldn't roll back a successful delete.
 */
export async function revokeReputationForSubjects(
  pairs: Array<{ kind: ReputationEventKind; subjectId: string }>
): Promise<void> {
  if (pairs.length === 0) return;
  try {
    // OR-combine the (kind, subjectId) pairs into a single WHERE.
    // Building per-pair AND clauses keeps the dedupe semantics tight
    // — we never accidentally match a different event with the same
    // subjectId but a different kind.
    const conditions = pairs.map((p) =>
      and(
        eq(reputationEvents.kind, p.kind),
        eq(reputationEvents.subjectId, p.subjectId)
      )
    );
    const where = conditions.length === 1 ? conditions[0] : or(...conditions);
    const rows = await db
      .select({
        id: reputationEvents.id,
        userId: reputationEvents.userId,
        points: reputationEvents.points,
      })
      .from(reputationEvents)
      .where(where);

    if (rows.length === 0) return;

    // Sum points per recipient so we can do one UPDATE per user.
    const debitsByUser = new Map<string, number>();
    for (const r of rows) {
      debitsByUser.set(r.userId, (debitsByUser.get(r.userId) ?? 0) + r.points);
    }

    // Apply the decrements. GREATEST(0, …) clamps at zero so we never
    // end up with a negative total from any quirk in the audit log.
    await Promise.all(
      Array.from(debitsByUser.entries()).map(([userId, debit]) =>
        db
          .update(userReputation)
          .set({
            total: sql`GREATEST(0, ${userReputation.total} - ${debit})`,
            updatedAt: new Date(),
          })
          .where(eq(userReputation.userId, userId))
      )
    );

    // Remove the audit rows last so a re-fire of the same subject
    // (shouldn't happen, but be defensive) doesn't double-deduct.
    await db
      .delete(reputationEvents)
      .where(
        inArray(
          reputationEvents.id,
          rows.map((r) => r.id)
        )
      );
  } catch (err) {
    console.warn(
      "[reputation.revoke] failed",
      pairs.length,
      "pairs:",
      (err as Error).message
    );
  }
}

/** Stable dedup keys used as `subjectId`. Keep them here so the call
 *  sites stay readable and the format is reused at the same call site
 *  for both the award and any future re-award. */
export const RepSubject = {
  post: (postId: string) => postId,
  comment: (commentId: string) => commentId,
  reactionReceived: (postId: string, reactorId: string) =>
    `${postId}:${reactorId}`,
  commentReceived: (commentId: string) => commentId,
  friendPair: (a: string, b: string) => {
    const [x, y] = [a, b].sort();
    return `${x}:${y}`;
  },
  dailyVisit: (userId: string, dateLocal: string) =>
    `${userId}:${dateLocal}`,
  oneShot: (userId: string) => userId,
};
