import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { reminderSettings, users } from "@/db/schema";
import {
  DEFAULT_REMINDER_PREFERENCES,
  normalizeReminderPreferences,
  type ReminderPreferences,
} from "@/lib/reminder-config";

function newCalendarToken(): string {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function getReminderPreferences(userId: string): Promise<{
  preferences: ReminderPreferences;
  calendarToken: string | null;
}> {
  const [row] = await db.select().from(reminderSettings).where(eq(reminderSettings.userId, userId)).limit(1);
  if (!row) return { preferences: DEFAULT_REMINDER_PREFERENCES, calendarToken: null };
  return {
    preferences: normalizeReminderPreferences({
      ...row,
      transitCadence: row.transitCadence === "daily" ? "daily" : "weekly",
    }),
    calendarToken: row.calendarToken,
  };
}

export async function saveReminderPreferences(
  userId: string,
  input: Partial<ReminderPreferences>,
): Promise<{ preferences: ReminderPreferences; calendarToken: string | null }> {
  const preferences = normalizeReminderPreferences(input);
  const [existing] = await db.select({ calendarToken: reminderSettings.calendarToken })
    .from(reminderSettings).where(eq(reminderSettings.userId, userId)).limit(1);
  const calendarToken = preferences.calendarEnabled
    ? existing?.calendarToken ?? newCalendarToken()
    : existing?.calendarToken ?? null;

  await db.insert(reminderSettings).values({ userId, ...preferences, calendarToken })
    .onConflictDoUpdate({
      target: reminderSettings.userId,
      set: { ...preferences, calendarToken, updatedAt: new Date() },
    });

  // `emailNudges` remains the account-wide email kill switch. Explicitly
  // enabling a personal email reminder opts it back in; disabling all reminder
  // emails does not touch unrelated friend/message nudge choices.
  if (preferences.transitEmail || preferences.forecastEmail || preferences.relationshipEmail) {
    await db.update(users).set({ emailNudges: true }).where(eq(users.id, userId));
  }
  return { preferences, calendarToken };
}

export async function regenerateReminderCalendarToken(userId: string): Promise<string> {
  const token = newCalendarToken();
  await db.insert(reminderSettings).values({
    userId,
    ...DEFAULT_REMINDER_PREFERENCES,
    calendarEnabled: true,
    calendarToken: token,
  }).onConflictDoUpdate({
    target: reminderSettings.userId,
    set: { calendarEnabled: true, calendarToken: token, updatedAt: new Date() },
  });
  return token;
}
