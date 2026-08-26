export type TransitCadence = "daily" | "weekly";

export type ReminderPreferences = {
  transitPush: boolean;
  transitEmail: boolean;
  transitCadence: TransitCadence;
  forecastPush: boolean;
  forecastEmail: boolean;
  relationshipPush: boolean;
  relationshipEmail: boolean;
  localHour: number;
  weeklyDay: number;
  calendarEnabled: boolean;
};

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  transitPush: false,
  transitEmail: false,
  transitCadence: "weekly",
  forecastPush: false,
  forecastEmail: false,
  // Preserve the existing per-partner push behavior once a settings row exists.
  relationshipPush: true,
  relationshipEmail: false,
  localHour: 9,
  weeklyDay: 1,
  calendarEnabled: false,
};

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localScheduleParts(now: Date, timezone: string): { hour: number; weekday: number; date: string } {
  try {
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) => dateParts.find((part) => part.type === type)?.value ?? "";
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    }).formatToParts(now);
    return {
      hour: Number(parts.find((part) => part.type === "hour")?.value ?? -1),
      weekday: WEEKDAY_INDEX[parts.find((part) => part.type === "weekday")?.value ?? ""] ?? -1,
      date: `${get("year")}-${get("month")}-${get("day")}`,
    };
  } catch {
    return { hour: now.getUTCHours(), weekday: now.getUTCDay(), date: now.toISOString().slice(0, 10) };
  }
}

export function normalizeReminderPreferences(input: Partial<ReminderPreferences>): ReminderPreferences {
  const hour = Number.isInteger(input.localHour) ? Number(input.localHour) : 9;
  const weekday = Number.isInteger(input.weeklyDay) ? Number(input.weeklyDay) : 1;
  return {
    transitPush: Boolean(input.transitPush),
    transitEmail: Boolean(input.transitEmail),
    transitCadence: input.transitCadence === "daily" ? "daily" : "weekly",
    forecastPush: Boolean(input.forecastPush),
    forecastEmail: Boolean(input.forecastEmail),
    relationshipPush: Boolean(input.relationshipPush),
    relationshipEmail: Boolean(input.relationshipEmail),
    localHour: Math.max(0, Math.min(23, hour)),
    weeklyDay: Math.max(0, Math.min(6, weekday)),
    calendarEnabled: Boolean(input.calendarEnabled),
  };
}
