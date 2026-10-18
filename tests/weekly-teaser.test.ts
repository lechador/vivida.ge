import { describe, expect, it } from "vitest";

import type { WeeklyForecastDay } from "@/db/schema";
import { stripWeeklyTeaser } from "@/lib/weekly-teaser";

function day(overrides: Partial<WeeklyForecastDay> = {}): WeeklyForecastDay {
  return {
    dateIso: "2026-09-30",
    weekdayKa: "სამშაბათი",
    harmonyScore: 60,
    challengeScore: 30,
    moonSignKa: "ლომი",
    moonSignEn: "Leo",
    headline: "დღის სათაური",
    harmonicReason: "რატომ კარგი",
    challengingReason: "რატომ რთული",
    advice: "რჩევა",
    drivers: [
      {
        transit: "moon",
        natal: "venus",
        kind: "trine",
        family: "harmonic",
        orb: 1.2,
      },
    ],
    ...overrides,
  };
}

describe("stripWeeklyTeaser", () => {
  it("keeps day 1 fully intact", () => {
    const [first] = stripWeeklyTeaser([day(), day()]);
    expect(first.headline).toBe("დღის სათაური");
    expect(first.harmonicReason).toBe("რატომ კარგი");
    expect(first.challengingReason).toBe("რატომ რთული");
    expect(first.advice).toBe("რჩევა");
    expect(first.drivers).toHaveLength(1);
  });

  it("strips narrative + drivers from later days but keeps scores and dates", () => {
    const [, second] = stripWeeklyTeaser([day(), day()]);
    expect(second.headline).toBe("");
    expect(second.harmonicReason).toBe("");
    expect(second.challengingReason).toBe("");
    expect(second.advice).toBe("");
    expect(second.drivers).toEqual([]);
    // The tease fuel survives.
    expect(second.harmonyScore).toBe(60);
    expect(second.challengeScore).toBe(30);
    expect(second.dateIso).toBe("2026-09-30");
    expect(second.weekdayKa).toBe("სამშაბათი");
    expect(second.moonSignKa).toBe("ლომი");
  });

  it("handles empty input", () => {
    expect(stripWeeklyTeaser([])).toEqual([]);
  });
});
