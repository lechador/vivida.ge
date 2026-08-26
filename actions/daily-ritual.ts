"use server";

import { requireUser } from "@/lib/auth-helpers";
import { completeDailyRitualFor } from "@/lib/daily-ritual-core";

export async function completeDailyRitual() {
  const user = await requireUser();
  return completeDailyRitualFor(user.id);
}
