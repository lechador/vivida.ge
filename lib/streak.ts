import { and, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userActivityDays } from "@/db/schema";

/**
 * How many days in a row the user has visited, counting back from today
 * in their profile timezone. Single visit today = streak 1, missed
 * yesterday = streak 0, four days in a row through today = streak 4, etc.
 *
 * Reads from the same `user_activity_day` table populated by
 * `recordVisit()` on every authed page load. We pull a 60-day window so
 * the streak walk never has to query the DB again per iteration.
 */
export async function getUserStreak(userId: string): Promise<{
  streak: number;
  todayLocal: string;
}> {
  const [profile] = await db
    .select({ tz: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const tz = profile?.tz ?? "UTC";

  const todayLocal = formatLocal(new Date(), tz);
  const cutoff = new Date(Date.now() - 60 * 86_400_000);
  const cutoffLocal = formatLocal(cutoff, tz);

  const rows = await db
    .select({ d: userActivityDays.dateLocal })
    .from(userActivityDays)
    .where(
      and(
        eq(userActivityDays.userId, userId),
        gte(userActivityDays.dateLocal, cutoffLocal)
      )
    );
  const visited = new Set(rows.map((r) => r.d));

  let streak = 0;
  // Walk back from today in the user's local timezone. Days are stored
  // as YYYY-MM-DD; subtract 24h iteratively and reformat with the same TZ.
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.now() - i * 86_400_000);
    const iso = formatLocal(d, tz);
    if (visited.has(iso)) streak++;
    else if (i > 0) break; // missing day — streak ends. (Today missing = streak 0.)
    else break;
  }
  return { streak, todayLocal };
}

function formatLocal(d: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
