import { describe, expect, it } from "vitest";

import { astrologyDay } from "@/lib/seo/astrology-calendar";
import { calendarDateLabelEn, dayAdviceEn, dayLeadEn } from "@/lib/seo/astrology-calendar-en";
import { ECLIPSES_EN } from "@/lib/seo/eclipse-en";
import { ECLIPSES } from "@/lib/seo/moon-events";
import { mercuryRetrogradePeriods } from "@/lib/retrograde";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English astrology calendar content", () => {
  it("formats calendar dates and generated guidance in English", () => {
    const day = astrologyDay(new Date("2026-08-13T12:00:00Z"));
    expect(calendarDateLabelEn(day.date)).toBe("August 13, 2026");
    expect(JSON.stringify(dayAdviceEn(day))).not.toMatch(GEORGIAN);
    expect(dayLeadEn(day)).not.toMatch(GEORGIAN);
  });

  it("covers every eclipse without changing public slugs", () => {
    expect(ECLIPSES_EN.map((eclipse) => eclipse.slug)).toEqual(ECLIPSES.map((eclipse) => eclipse.slug));
    expect(ECLIPSES_EN).toHaveLength(12);
    for (const eclipse of ECLIPSES_EN) {
      expect(JSON.stringify(eclipse)).not.toMatch(GEORGIAN);
      expect(eclipse.description.length).toBeGreaterThan(40);
      expect(eclipse.visibility.length).toBeGreaterThan(35);
    }
  });

  it("provides English sign names for generated Mercury periods", () => {
    const periods = mercuryRetrogradePeriods(2026);
    expect(periods.length).toBeGreaterThan(0);
    for (const period of periods) {
      expect(period.startSignEn).not.toMatch(GEORGIAN);
      expect(period.endSignEn).not.toMatch(GEORGIAN);
    }
  });
});
