import type { ReminderPreferences } from "@/lib/reminder-config";

const REMINDER_CHANNELS = [
  ["transit", "push", "transitPush"],
  ["transit", "email", "transitEmail"],
  ["forecast", "push", "forecastPush"],
  ["forecast", "email", "forecastEmail"],
  ["relationship", "push", "relationshipPush"],
  ["relationship", "email", "relationshipEmail"],
  ["calendar", "calendar", "calendarEnabled"],
] as const satisfies readonly [string, string, keyof ReminderPreferences][];

export function reminderPreferenceChanges(
  before: ReminderPreferences,
  after: ReminderPreferences,
): Array<{ topic: string; channel: string; eventType: "opt_in" | "opt_out" }> {
  return REMINDER_CHANNELS.flatMap(([topic, channel, key]) => {
    const wasEnabled = Boolean(before[key]);
    const isEnabled = Boolean(after[key]);
    return wasEnabled === isEnabled
      ? []
      : [{ topic, channel, eventType: isEnabled ? "opt_in" as const : "opt_out" as const }];
  });
}

