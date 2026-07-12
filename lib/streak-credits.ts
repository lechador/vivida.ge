import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { creditTransactions } from "@/db/schema";
import { STREAK_MILESTONES, grantCredits, isUnlocked } from "@/lib/credits";
import { getStreak, type StreakInfo } from "@/lib/activity";

/**
 * Streak-milestone credit rewards. Each tier in STREAK_MILESTONES pays out once
 * per lifetime, the first time a user's consecutive-visit streak reaches it —
 * keyed by `streak:<days>` under the `streak_bonus` reason so it can never be
 * farmed by breaking and rebuilding a streak. grantCredits fires the usual
 * "credit" bell notification for each award.
 */

const refFor = (days: number) => `streak:${days}`;

/**
 * Grant any milestone the user has newly reached. Call after a visit is
 * recorded, passing the freshly-computed current streak. Best-effort — a
 * failure here must never break the visit-recording path.
 */
export async function awardStreakMilestones(
  userId: string,
  currentStreak: number
): Promise<number[]> {
  const due = STREAK_MILESTONES.filter((m) => currentStreak >= m.days);
  if (due.length === 0) return [];

  const awarded: number[] = [];
  for (const m of due) {
    const ref = refFor(m.days);
    if (await isUnlocked(userId, ref, "streak_bonus")) continue;
    await grantCredits(userId, m.credits, "streak_bonus", ref);
    awarded.push(m.days);
  }
  return awarded;
}

export type StreakProgress = {
  current: number;
  longest: number;
  milestones: { days: number; credits: number; claimed: boolean }[];
  /** The next unclaimed milestone, or null once all are earned. */
  next: { days: number; credits: number } | null;
};

/**
 * Streak + milestone-claim state for the /credits streak widget. One scan of
 * the user's `streak_bonus` ledger rows tells us which tiers are already
 * claimed.
 */
export async function getStreakProgress(userId: string): Promise<StreakProgress> {
  const [streak, claimedRows]: [StreakInfo, { ref: string | null }[]] =
    await Promise.all([
      getStreak(userId),
      db
        .select({ ref: creditTransactions.ref })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.userId, userId),
            eq(creditTransactions.reason, "streak_bonus"),
            inArray(
              creditTransactions.ref,
              STREAK_MILESTONES.map((m) => refFor(m.days))
            )
          )
        ),
    ]);

  const claimed = new Set(claimedRows.map((r) => r.ref));
  const milestones = STREAK_MILESTONES.map((m) => ({
    days: m.days,
    credits: m.credits,
    claimed: claimed.has(refFor(m.days)),
  }));
  const next = milestones.find((m) => !m.claimed) ?? null;

  return {
    current: streak.current,
    longest: streak.longest,
    milestones,
    next: next ? { days: next.days, credits: next.credits } : null,
  };
}
