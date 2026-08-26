"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import type { ReminderPreferences } from "@/lib/reminder-config";
import {
  regenerateReminderCalendarToken,
  saveReminderPreferences,
} from "@/lib/reminder-settings";

export async function updateReminderPreferences(values: ReminderPreferences) {
  const user = await requireUser();
  const result = await saveReminderPreferences(user.id, values);
  revalidatePath("/account");
  return result;
}

export async function regenerateReminderCalendar() {
  const user = await requireUser();
  const calendarToken = await regenerateReminderCalendarToken(user.id);
  revalidatePath("/account");
  return { calendarToken };
}
