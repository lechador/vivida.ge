import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userActivityDays } from "@/db/schema";
import { formatLocalDate } from "@/lib/activity";
import { calculateStreak } from "@/lib/streak";
import { awardRitualMilestone, toStreakProgress, type StreakProgress } from "@/lib/streak-credits";

export const DAILY_RITUAL_VERSION = 2;

async function ritualContext(userId: string) {
  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const timezone = profile?.timezone ?? "UTC";
  return { timezone, today: formatLocalDate(new Date(), timezone) };
}

export async function getDailyRitualProgress(userId: string): Promise<StreakProgress> {
  const { today } = await ritualContext(userId);
  const rows = await db
    .select({ date: userActivityDays.dateLocal })
    .from(userActivityDays)
    .where(
      and(
        eq(userActivityDays.userId, userId),
        eq(userActivityDays.ritualVersion, DAILY_RITUAL_VERSION),
        isNotNull(userActivityDays.ritualCompletedAt),
      ),
    );
  return toStreakProgress(calculateStreak(rows.map((row) => row.date), today));
}

export async function completeDailyRitualFor(userId: string): Promise<{
  ok: true;
  firstCompletion: boolean;
  awardedCredits: number;
  progress: StreakProgress;
}> {
  const { today } = await ritualContext(userId);
  const completedAt = new Date();

  const result = await db.execute<{ first_completion: boolean }>(sql`
    INSERT INTO user_activity_day (user_id, date_local, ritual_completed_at, ritual_version)
    VALUES (${userId}, ${today}, ${completedAt}, ${DAILY_RITUAL_VERSION})
    ON CONFLICT (user_id, date_local) DO UPDATE
    SET ritual_completed_at = EXCLUDED.ritual_completed_at,
        ritual_version = EXCLUDED.ritual_version
    WHERE user_activity_day.ritual_version IS DISTINCT FROM ${DAILY_RITUAL_VERSION}
       OR user_activity_day.ritual_completed_at IS NULL
    RETURNING true AS first_completion
  `);
  const firstCompletion = result.rows.length > 0;
  const progress = await getDailyRitualProgress(userId);
  // Also run on an idempotent retry, repairing a transient reward failure.
  const awardedCredits = await awardRitualMilestone(userId, progress.current);
  return { ok: true, firstCompletion, awardedCredits, progress };
}
