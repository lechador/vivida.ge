"use server";

import { requireUser } from "@/lib/auth-helpers";
import {
  completeDailyRitualFor,
  type CompleteDailyRitualResult,
} from "@/lib/daily-ritual-core";

export async function completeDailyRitual(): Promise<CompleteDailyRitualResult> {
  const user = await requireUser();
  return completeDailyRitualFor(user.id);
}
