/**
 * Which undelivered daily-horoscope rows may be retired, and how many at a time.
 *
 * Pure and DB-free so the rule can be unit tested. `expireStaleDailyRows` in
 * `lib/email-marketing.ts` applies it.
 *
 * Why the backlog exists: the drain only ever reads the current `sendDate`, so
 * any day's shortfall was orphaned in `pending` rather than retried. Production
 * held **28,449 such rows** on 2026-10-16, dating back to 2026-08-09.
 *
 * Why this must be capped: the first deploy performs a one-off sweep of that
 * whole backlog. Unbounded, that is a single ~28,000-row UPDATE inside a cron
 * invocation that also has to send the day's email, which risks the statement
 * timing out mid-way. A bounded sweep drains it over a few ticks instead, and is
 * idempotent, so repeating it is always safe.
 */

/** Undelivered rows older than this are retired rather than sent late. */
export const DAILY_ROW_GRACE_HOURS = 48;

/**
 * Maximum rows retired per invocation.
 *
 * Sized so the statement stays short even on the deploy-day backlog, while
 * clearing 28k rows in a handful of cron ticks (the retry tick sweeps too).
 */
export const EXPIRY_BATCH_SIZE = 5000;

export type ExpiryCutoffs = {
  /** Today's YYYY-MM-DD key. Rows on or after this date are never retired. */
  today: string;
  /** Rows enqueued before this instant are old enough to retire. */
  cutoff: Date;
  limit: number;
};

/**
 * Build the cutoffs for a sweep.
 *
 * `now` is injectable so the rule is testable without freezing the clock.
 */
export function expiryCutoffs(
  now: Date = new Date(),
  limit: number = EXPIRY_BATCH_SIZE,
): ExpiryCutoffs {
  return {
    today: now.toISOString().slice(0, 10),
    cutoff: new Date(now.getTime() - DAILY_ROW_GRACE_HOURS * 60 * 60 * 1000),
    limit: Math.max(1, limit),
  };
}

/**
 * Row-level predicate, mirroring the SQL in `expireStaleDailyRows`.
 *
 * Exported so the boundary behaviour is explicit and testable:
 *  - today's rows are never retired, because the retry tick can still deliver
 *    them;
 *  - only `pending` and `failed` are retirable — `sent`, `skipped` and
 *    `expired` are already terminal;
 *  - `sendDate` is compared as a plain `YYYY-MM-DD` string because the column is
 *    text, and lexicographic order is chronological order in that format.
 */
export function isRetirable(
  row: { status: string; sendDate: string; createdAt: Date },
  cutoffs: Pick<ExpiryCutoffs, "today" | "cutoff">,
): boolean {
  if (row.status !== "pending" && row.status !== "failed") return false;
  if (row.sendDate >= cutoffs.today) return false;
  return row.createdAt.getTime() < cutoffs.cutoff.getTime();
}
