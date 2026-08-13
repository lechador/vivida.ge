"use server";

import { requireUser } from "@/lib/auth-helpers";
import {
  completeDailyRitualFor,
  type CompleteDailyRitualResult,
} from "@/lib/daily-ritual-core";
import { getStreakProgress, type StreakProgress } from "@/lib/streak-credits";

/** Return the account-backed ritual status so another device can restore it. */
export async function getDailyRitualProgress(): Promise<StreakProgress> {
  const user = await requireUser();
  return getStreakProgress(user.id);
}

export async function completeDailyRitual(): Promise<CompleteDailyRitualResult> {
  const user = await requireUser();
  return completeDailyRitualFor(user.id);
}
