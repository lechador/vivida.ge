import { describe, expect, it } from "vitest";

import {
  DEFAULT_REMINDER_PREFERENCES,
  localScheduleParts,
  normalizeReminderPreferences,
} from "@/lib/reminder-config";

describe("personal reminder preferences", () => {
  it("keeps all new astrology email topics opt-in", () => {
    expect(DEFAULT_REMINDER_PREFERENCES.transitEmail).toBe(false);
    expect(DEFAULT_REMINDER_PREFERENCES.forecastEmail).toBe(false);
    expect(DEFAULT_REMINDER_PREFERENCES.relationshipEmail).toBe(false);
    expect(DEFAULT_REMINDER_PREFERENCES.transitPush).toBe(false);
    expect(DEFAULT_REMINDER_PREFERENCES.forecastPush).toBe(false);
  });

  it("normalizes untrusted schedule values", () => {
    expect(normalizeReminderPreferences({
      localHour: 42,
      weeklyDay: -5,
      transitCadence: "daily",
      transitEmail: true,
    })).toEqual(expect.objectContaining({
      localHour: 23,
      weeklyDay: 0,
      transitCadence: "daily",
      transitEmail: true,
    }));
  });

  it("evaluates the schedule in the profile timezone", () => {
    const now = new Date("2026-08-26T05:00:00Z");
    expect(localScheduleParts(now, "Asia/Tbilisi")).toEqual({
      hour: 9,
      weekday: 3,
      date: "2026-08-26",
    });
    expect(localScheduleParts(now, "America/New_York")).toEqual({
      hour: 1,
      weekday: 3,
      date: "2026-08-26",
    });
  });
});
