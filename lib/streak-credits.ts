import type { StreakCalculation } from "@/lib/streak";

export type StreakProgress = {
  current: number;
  todayComplete: boolean;
  next: {
    targetDays: number;
    daysLeft: number;
    credits: number;
  } | null;
};

const MILESTONES = [
  { days: 3, credits: 5 },
  { days: 7, credits: 10 },
  { days: 14, credits: 20 },
  { days: 30, credits: 50 },
];

export function toStreakProgress(calc: StreakCalculation): StreakProgress {
  const nextMilestone = MILESTONES.find((m) => m.days > calc.current);
  return {
    current: calc.current,
    todayComplete: calc.todayComplete,
    next: nextMilestone
      ? {
          targetDays: nextMilestone.days,
          daysLeft: nextMilestone.days - calc.current,
          credits: nextMilestone.credits,
        }
      : null,
  };
}

export async function awardRitualMilestone(
  _userId: string,
  streak: number,
): Promise<number> {
  const hit = MILESTONES.find((m) => m.days === streak);
  return hit ? hit.credits : 0;
}
