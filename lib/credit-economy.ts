import { RITUAL_STREAK_MILESTONES } from "@/lib/credits-config";

export type RitualMilestone = (typeof RITUAL_STREAK_MILESTONES)[number];

/** Monday-based UTC week key, stable across retries and server regions. */
export function rewardWeekKey(now = new Date()): string {
  const day = now.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset),
  );
  return monday.toISOString().slice(0, 10);
}

export function nextRitualMilestone(streak: number): RitualMilestone | null {
  return RITUAL_STREAK_MILESTONES.find((milestone) => milestone.days > streak) ?? null;
}

export function ritualMilestoneAt(streak: number): RitualMilestone | null {
  return RITUAL_STREAK_MILESTONES.find((milestone) => milestone.days === streak) ?? null;
}

export function maxLifetimeRitualReward(): number {
  return RITUAL_STREAK_MILESTONES.reduce((sum, milestone) => sum + milestone.credits, 0);
}
