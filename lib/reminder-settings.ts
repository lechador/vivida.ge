import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { reminderPreferenceEvents, reminderSettings, users } from "@/db/schema";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { recordExperimentOutcomesBestEffort } from "@/lib/experiment-outcomes";
import { reminderPreferenceChanges } from "@/lib/reminder-funnel";
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
  const [existing] = await db.select()
    .from(reminderSettings).where(eq(reminderSettings.userId, userId)).limit(1);
  const before = existing
    ? normalizeReminderPreferences({
        ...existing,
        transitCadence: existing.transitCadence === "daily" ? "daily" : "weekly",
      })
    : DEFAULT_REMINDER_PREFERENCES;
  const calendarToken = preferences.calendarEnabled
    ? existing?.calendarToken ?? newCalendarToken()
    : existing?.calendarToken ?? null;

  await db.insert(reminderSettings).values({ userId, ...preferences, calendarToken })
    .onConflictDoUpdate({
      target: reminderSettings.userId,
      set: { ...preferences, calendarToken, updatedAt: new Date() },
    });

  const preferenceChanges = reminderPreferenceChanges(before, preferences);
  if (preferenceChanges.length) {
    await db.insert(reminderPreferenceEvents).values(preferenceChanges.map((change) => ({
      userId,
      ...change,
    })));
  }

  // `emailNudges` remains the account-wide email kill switch. Explicitly
  // enabling a personal email reminder opts it back in; disabling all reminder
  // emails does not touch unrelated friend/message nudge choices.
  if (preferences.transitEmail || preferences.forecastEmail || preferences.relationshipEmail) {
    await db.update(users).set({ emailNudges: true }).where(eq(users.id, userId));
  }
  const eventKey = crypto.randomUUID();
  await recordExperimentOutcomesBestEffort(
    userId,
    [EXPERIMENTS.reminderPrompt],
    "preferences_saved",
    "account_reminder_settings",
    `save:${eventKey}`,
  );
  if (preferenceChanges.some((change) => change.eventType === "opt_in")) {
    await recordExperimentOutcomesBestEffort(
      userId,
      [EXPERIMENTS.reminderPrompt],
      "opt_in",
      "account_reminder_settings",
      `opt-in:${eventKey}`,
    );
  }
  return { preferences, calendarToken };
}

export async function regenerateReminderCalendarToken(userId: string): Promise<string> {
  const token = newCalendarToken();
  const [existing] = await db.select({ calendarEnabled: reminderSettings.calendarEnabled })
    .from(reminderSettings).where(eq(reminderSettings.userId, userId)).limit(1);
  await db.insert(reminderSettings).values({
    userId,
    ...DEFAULT_REMINDER_PREFERENCES,
    calendarEnabled: true,
    calendarToken: token,
  }).onConflictDoUpdate({
    target: reminderSettings.userId,
    set: { calendarEnabled: true, calendarToken: token, updatedAt: new Date() },
  });
  if (!existing?.calendarEnabled) {
    await db.insert(reminderPreferenceEvents).values({
      userId,
      topic: "calendar",
      channel: "calendar",
      eventType: "opt_in",
    });
  }
  return token;
}
