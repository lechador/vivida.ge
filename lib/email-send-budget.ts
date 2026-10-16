/**
 * Per-run send budget for the lifecycle cron.
 *
 * Why this exists: `verify_reminder`, `profile_incomplete` and `winback` all
 * drain their whole cohort in a single `for` loop. That was harmless while the
 * crons were starved and sent nothing. It becomes a problem the moment they are
 * restored, which this change does.
 *
 * Measured against production on 2026-10-16, a first run would have tried to send
 * **861 emails**: 642 `profile_incomplete` plus 219 `winback`. Every lifecycle
 * send goes through `acquireResendSlot()` at one request per 1.1s, so that is
 * **~947 seconds of work against a 300s `maxDuration`**. The invocation would be
 * killed part-way, and — because progress is persisted per recipient in
 * `email_send_log` — the next run would simply resume. It self-heals, but it is
 * an uncontrolled, unpredictable burst of hundreds of emails to users who have
 * received nothing for nine weeks.
 *
 * So the budget is explicit and shared:
 *
 *   - `PER_JOB_SEND_CAP` bounds each sequence, so no single job can starve the
 *     others. This is the same failure mode as the original cron collision,
 *     reproduced at a smaller scale: whichever job runs first would otherwise
 *     consume the whole budget.
 *   - `TOTAL_SEND_BUDGET` reserves headroom inside `maxDuration` for the array of
 *     other work in the same invocation (push blast, birthday gifts, lead
 *     horoscopes, housekeeping, the health check).
 *
 * Runs are idempotent and cohorts are recomputed each time, so capping simply
 * spreads the drain over more runs. That is also gentler on sender reputation
 * than a single 861-message burst.
 */

/**
 * Max emails one lifecycle sequence sends per invocation.
 *
 * 60 x 1.1s = 66s per job, so even all three at their cap is ~200s, inside the
 * 300s budget with room for the rest of the work.
 */
export const PER_JOB_SEND_CAP = 60;

/** Total lifecycle emails per invocation, across all sequences. */
export const TOTAL_SEND_BUDGET = 180;

/**
 * A shared counter so jobs cannot collectively exceed the invocation budget.
 *
 * Deliberately simple and synchronous: the lifecycle jobs run sequentially in a
 * single invocation, so no locking is needed. `reserve()` returns how many sends
 * the caller may still make, which is the smaller of its own cap and what is left
 * of the shared budget.
 */
export class SendBudget {
  private remaining: number;

  constructor(total: number = TOTAL_SEND_BUDGET) {
    this.remaining = Math.max(0, total);
  }

  /** How many of `desired` sends this job may actually make right now. */
  reserve(desired: number, cap: number = PER_JOB_SEND_CAP): number {
    const allowed = Math.max(0, Math.min(desired, cap, this.remaining));
    this.remaining -= allowed;
    return allowed;
  }

  get left(): number {
    return this.remaining;
  }
}
