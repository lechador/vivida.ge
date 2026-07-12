import { db } from "@/db";
import { users } from "@/db/schema";
import { MONTHLY_BONUS, grantCredits, isUnlocked } from "@/lib/credits";
import { localDateString } from "@/lib/transits";

/**
 * Monthly free-credit drop. On the first of each month every user is gifted
 * MONTHLY_BONUS credits. Idempotent per month: the grant is keyed by the
 * `YYYY-MM` ref under the `monthly_bonus` reason, so re-running the cron (or a
 * safety-retry tick) never double-grants. Each grant flows through
 * grantCredits, so the user also gets a "credit" bell notification.
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
  monthKey?: string
): Promise<{ month: string; granted: number; skipped: number }> {
  const key = monthKey ?? currentMonthKey();
  const rows = await db.select({ id: users.id }).from(users);

  let granted = 0;
  let skipped = 0;
  // Small concurrency pool — keeps the job well within the cron timeout while
  // not hammering the pooled connection.
  const CHUNK = 20;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const results = await Promise.all(
      batch.map(async (u) => {
        if (await isUnlocked(u.id, key, "monthly_bonus")) return "skip";
        await grantCredits(u.id, MONTHLY_BONUS, "monthly_bonus", key);
        return "grant";
      })
    );
    for (const r of results) {
      if (r === "grant") granted++;
      else skipped++;
    }
  }

  return { month: key, granted, skipped };
}
