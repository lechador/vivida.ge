import { getStreak } from "@/lib/activity";
import {
  RITUAL_STREAK_REWARD,
  ritualCycleProgress,
} from "@/lib/credits-config";
import { grantCreditsOnce } from "@/lib/credits";

export type StreakProgress = {
  current: number;
  longest: number;
  todayComplete: boolean;
  cycle: {
    days: number;
    completedDays: number;
    rewardEarnedToday: boolean;
  };
  next: {
    days: number;
    daysLeft: number;
    credits: number;
  };
};

/**
 * Award one repeatable weekly reward. The caller invokes this only for the
 * `dateLocal` makes the ledger reference unique across cycles. The atomic
 * grant-once helper makes retries and concurrent refreshes safe.
 */
export async function awardRitualStreakReward(
  userId: string,
  currentStreak: number,
  dateLocal: string
): Promise<number> {
  if (
    currentStreak <= 0 ||
    currentStreak % RITUAL_STREAK_REWARD.days !== 0
  ) {
    return 0;
  }

  const granted = await grantCreditsOnce(
    userId,
    RITUAL_STREAK_REWARD.credits,
    "streak_bonus",
    `ritual-week:${dateLocal}`
  );
  return granted ? RITUAL_STREAK_REWARD.credits : 0;
}

export async function getStreakProgress(userId: string): Promise<StreakProgress> {
  const streak = await getStreak(userId);
  const cycle = ritualCycleProgress(streak.current, streak.todayComplete);

  return {
    ...streak,
    cycle: {
      days: RITUAL_STREAK_REWARD.days,
      completedDays: cycle.completedDays,
      rewardEarnedToday: cycle.rewardEarnedToday,
    },
    next: {
      days: cycle.targetDays,
      daysLeft: cycle.daysLeft,
      credits: RITUAL_STREAK_REWARD.credits,
    },
  };
}
