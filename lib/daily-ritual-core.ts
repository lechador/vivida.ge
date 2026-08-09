import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userActivityDays } from "@/db/schema";
import { formatLocalDate } from "@/lib/activity";
import { awardReputation, RepSubject } from "@/lib/reputation";
import {
  awardRitualStreakReward,
  getStreakProgress,
  type StreakProgress,
} from "@/lib/streak-credits";

export type CompleteDailyRitualResult = {
  ok: true;
  firstCompletion: boolean;
  awardedCredits: number;
  progress: StreakProgress;
};

/** Idempotently complete today's ritual in the user's profile timezone. */
export async function completeDailyRitualFor(
  userId: string
): Promise<CompleteDailyRitualResult> {
  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const dateLocal = formatLocalDate(new Date(), profile?.timezone ?? "UTC");
  const completedAt = new Date();

  const inserted = await db
    .insert(userActivityDays)
    .values({
      userId,
      dateLocal,
      ritualCompletedAt: completedAt,
      ritualVersion: 1,
    })
    .onConflictDoNothing()
    .returning({ dateLocal: userActivityDays.dateLocal });

  const updated =
    inserted.length > 0
      ? []
      : await db
          .update(userActivityDays)
          .set({ ritualCompletedAt: completedAt, ritualVersion: 1 })
          .where(
            and(
              eq(userActivityDays.userId, userId),
              eq(userActivityDays.dateLocal, dateLocal),
              isNull(userActivityDays.ritualCompletedAt)
            )
          )
          .returning({ dateLocal: userActivityDays.dateLocal });

  const firstCompletion = inserted.length > 0 || updated.length > 0;
  const progress = await getStreakProgress(userId);
  let awardedCredits = 0;
  if (firstCompletion) {
    await awardReputation({
      userId,
      kind: "daily_visit",
      subjectId: RepSubject.dailyRitual(userId, dateLocal),
    });
  }
  // Run on every idempotent retry: the atomic ref-keyed grant returns zero if
  // already paid and repairs a prior transient reward failure safely.
  awardedCredits = await awardRitualStreakReward(
    userId,
    progress.current,
    dateLocal
  );

  return {
    ok: true,
    firstCompletion,
    awardedCredits,
    progress,
  };
}
