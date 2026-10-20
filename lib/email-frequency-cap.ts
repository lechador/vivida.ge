/**
 * Company-wide lifecycle email frequency cap.
 *
 * Rule: no user receives more than `LIFECYCLE_EMAIL_CAP` lifecycle emails in
 * any rolling `LIFECYCLE_CAP_WINDOW_DAYS` days, across ALL lifecycle
 * campaigns. The 3-step dormant win-back sequence alone can use all three
 * slots, so `profile_incomplete` / `verify_reminder` prose that targets the
 * same window is deliberately starved by this shared guard: the lifecycle cron
 * runs winback first, then the re-nudges, and whichever sequence the user has
 * already heard from wins. That ordering is intentional and documented here
 * rather than duplicated in each sender.
 *
 * `email_send_log` is the source of truth. A claim row is written before the
 * send, so `pending` claims count too: a crashed run must not let the next
 * sequence overfill the window. `failed` and `skipped` rows are terminal
 * non-deliveries and do not count.
 *
 * Pure helpers live at the top so the rule can be unit tested without a
 * database; the async wrappers are the enforcement used by senders.
 */

import { and, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";

export const LIFECYCLE_EMAIL_CAP = 3;

export const LIFECYCLE_CAP_WINDOW_DAYS = 14;

/**
 * Kinds that count toward the lifecycle cap.
 *
 * Transactional mail (welcome, verification, password_reset, receipts) and
 * marketing broadcasts are not lifecycle nudges and are intentionally absent.
 * `birthday` is a lifecycle send even though it is sparse: it still occupies an
 * inbox slot in the same 14-day window.
 *
 * `winback` is the retired single-email kind. It stays listed so historical
 * rows from the pre-sequence era still count inside the rolling window.
 */
export const LIFECYCLE_KINDS = [
  "winback",
  "winback_v1_s1",
  "winback_v1_s2",
  "winback_v1_s3",
  "profile_incomplete",
  "verify_reminder",
  "birthday",
] as const;

export type LifecycleKind = (typeof LIFECYCLE_KINDS)[number];

const LIFECYCLE_KIND_SET = new Set<string>(LIFECYCLE_KINDS);

/** Statuses that represent an inbox slot the user either received or is owed. */
const COUNTED_STATUSES = new Set(["sent", "pending"]);

export function isLifecycleKind(kind: string): kind is LifecycleKind {
  return LIFECYCLE_KIND_SET.has(kind);
}

type SendLogLike = { kind: string; status?: string | null };

/** Number of counted lifecycle sends in an already-windowed set of log rows. */
export function countRecentLifecycleSends(
  rows: readonly SendLogLike[],
): number {
  let count = 0;
  for (const row of rows) {
    if (!isLifecycleKind(row.kind)) continue;
    // Historical rows predate the status column; null means delivered.
    const status = row.status ?? "sent";
    if (!COUNTED_STATUSES.has(status)) continue;
    count++;
  }
  return count;
}

/** True when the rolling cap has already been reached for these rows. */
export function isLifecycleCapReached(
  rows: readonly SendLogLike[],
  cap: number = LIFECYCLE_EMAIL_CAP,
): boolean {
  return countRecentLifecycleSends(rows) >= cap;
}

/**
 * Count lifecycle sends for one user in the rolling window.
 *
 * Deliberately counts every lifecycle kind, not just the caller's own, so
 * sequences cannot collectively exceed the company cap.
 */
export async function lifecycleSendsInWindow(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  // Imported lazily so the pure helpers above can be unit tested (and imported
  // by client-safe code) without a DATABASE_URL.
  const [{ db }, { emailSendLog }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
  ]);
  const cutoff = new Date(
    now.getTime() - LIFECYCLE_CAP_WINDOW_DAYS * 86_400_000,
  );
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        inArray(emailSendLog.kind, [...LIFECYCLE_KINDS]),
        gte(emailSendLog.sentAt, cutoff),
        or(
          isNull(emailSendLog.status),
          eq(emailSendLog.status, "sent"),
          eq(emailSendLog.status, "pending"),
        ),
      ),
    );
  return row?.count ?? 0;
}

/** Pre-send guard shared by every lifecycle sender. */
export async function isLifecycleFrequencyCapped(
  userId: string,
  now: Date = new Date(),
): Promise<boolean> {
  return (await lifecycleSendsInWindow(userId, now)) >= LIFECYCLE_EMAIL_CAP;
}

/** Stable reason string written to a `skipped` claim row. */
export function lifecycleCapSkipReason(): string {
  return `lifecycle frequency cap (${LIFECYCLE_EMAIL_CAP} per ${LIFECYCLE_CAP_WINDOW_DAYS}d)`;
}
