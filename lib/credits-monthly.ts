import { db } from "@/db";
import { users } from "@/db/schema";
import { MONTHLY_BONUS, grantCreditsOnce } from "@/lib/credits";
import { monthlyBonusEligible } from "@/lib/monthly-bonus-eligibility";
import { activityCutoffKey, usersActiveSince } from "@/lib/payer";
import { localDateString } from "@/lib/transits";

/**
 * Monthly free-credit drop. On the first of each month every *recently active*
 * eligible user is gifted MONTHLY_BONUS credits (see
 * `monthlyBonusEligible`). Idempotent per month: the grant is keyed by the
 * `YYYY-MM` ref under the `monthly_bonus` reason, so re-running the cron (or a
 * safety-retry tick) never double-grants, grantCreditsOnce checks the ledger
 * and increments the balance inside one advisory-locked statement, so even two
 * overlapping runs cannot both grant. Each grant still emits a "credit" bell
 * notification.
 *
 * The month key is computed in Asia/Tbilisi so "first of the month" lines up
 * with the audience's local calendar, independent of the UTC cron time.
 */

const TZ = "Asia/Tbilisi";

/** Current `YYYY-MM` in Tbilisi local time. */
export function currentMonthKey(now: Date = new Date()): string {
  return localDateString(now, TZ).slice(0, 7);
}

export async function grantMonthlyCredits(
  monthKey?: string,
): Promise<{ month: string; granted: number; skipped: number }> {
  const key = monthKey ?? currentMonthKey();
  const rows = await db.select({ id: users.id }).from(users);
  const allIds = rows.map((r) => r.id);
  // Free-economy gate: a habit reward for accounts that are actually in use.
  // One batch lookup, not per-user queries. Resolving this from a single query
  // also keeps the job inside the cron timeout as the table grows.
  const activeUsers = await usersActiveSince(allIds, activityCutoffKey());
  const eligible = rows.filter((u) =>
    monthlyBonusEligible({ activeRecently: activeUsers.has(u.id) }),
  );
  let skipped = rows.length - eligible.length;

  let granted = 0;
  // Small concurrency pool, keeps the job well within the cron timeout while
  // not hammering the pooled connection.
  const CHUNK = 20;
  for (let i = 0; i < eligible.length; i += CHUNK) {
    const batch = eligible.slice(i, i + CHUNK);
    const results = await Promise.all(
      batch.map(async (u) =>
        (await grantCreditsOnce(u.id, MONTHLY_BONUS, "monthly_bonus", key))
          ? "grant"
          : "skip",
      ),
    );
    for (const r of results) {
      if (r === "grant") granted++;
      else skipped++;
    }
  }

  return { month: key, granted, skipped };
}
