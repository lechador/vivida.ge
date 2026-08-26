import { nextRitualMilestone, ritualMilestoneAt } from "@/lib/credit-economy";
import { grantCreditsOnce } from "@/lib/credits";
import type { StreakInfo } from "@/lib/streak";

export type StreakProgress = StreakInfo & {
  next: { days: number; daysLeft: number; credits: number } | null;
};

export function toStreakProgress(streak: StreakInfo): StreakProgress {
  const next = nextRitualMilestone(streak.current);
  return {
    ...streak,
    next: next
      ? { days: next.days, daysLeft: Math.max(0, next.days - streak.current), credits: next.credits }
      : null,
  };
}

export async function awardRitualMilestone(userId: string, streak: number): Promise<number> {
  const milestone = ritualMilestoneAt(streak);
  if (!milestone) return 0;
  const granted = await grantCreditsOnce(
    userId,
    milestone.credits,
    "streak_bonus",
    `ritual-milestone:${milestone.days}`,
  );
  return granted ? milestone.credits : 0;
}
