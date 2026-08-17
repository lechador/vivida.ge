import { describe, expect, it } from "vitest";

import { PHASE_KEYS, PHASE_LABEL_AM } from "@/lib/moon-phase";
import { ECLIPSES } from "@/lib/seo/moon-events";
import { ECLIPSES_AM, eclipseAmBySlug } from "@/lib/seo/eclipse-am";
import {
  TONE_AM,
  aspectAm,
  dayAdviceAm,
  dayLeadAm,
  planetAm,
  weekdayAm,
} from "@/lib/seo/astrology-calendar-am";
import { astrologyDay } from "@/lib/seo/astrology-calendar";
import {
  isMercuryRetrogradeNow,
  mercuryRetrogradePeriods,
} from "@/lib/retrograde";
import { MOON_CALENDAR_AM } from "@/components/seo/moon-calendar-am";
import {
  ECLIPSE_META_AM,
  MOON_PHASE_META_AM,
} from "@/components/seo/moon-event-pages-am";
import { CALENDAR_META_AM } from "@/components/seo/astrology-calendar-pages-am";
import { MERCURY_RETROGRADE_AM } from "@/components/seo/mercury-retrograde-am";

describe("Armenian Moon and Calendar localization", () => {
  it("translates all 8 lunar phases into Armenian", () => {
    for (const key of PHASE_KEYS) {
      expect(PHASE_LABEL_AM[key]).toBeDefined();
      expect(PHASE_LABEL_AM[key].length).toBeGreaterThan(0);
    }
  });

  it("provides Armenian eclipse data for all 12 canonical eclipses", () => {
    expect(ECLIPSES_AM.length).toBe(ECLIPSES.length);
    for (const e of ECLIPSES) {
      const am = eclipseAmBySlug(e.slug);
      expect(am).toBeDefined();
      expect(am?.title).toBeDefined();
      expect(am?.visibility.length).toBeGreaterThan(10);
      expect(am?.description.length).toBeGreaterThan(10);
    }
  });

  it("formats Armenian astrology calendar helpers correctly", () => {
    expect(TONE_AM.lucky.label).toBe("Բարենպաստ");
    expect(TONE_AM.careful.label).toBe("Զգուշության օր");
    expect(TONE_AM.balanced.label).toBe("Հավասարակշռված");

    expect(planetAm("მზე")).toBe("Արև");
    expect(planetAm("მთვარე")).toBe("Լուսին");
    expect(planetAm("მერკური")).toBe("Մերկուրի");
    expect(planetAm("ვენერა")).toBe("Վեներա");
    expect(planetAm("მარსი")).toBe("Մարս");
    expect(planetAm("იუპიტერი")).toBe("Յուպիտեր");
    expect(planetAm("სატურნი")).toBe("Սատուրն");

    expect(aspectAm("შეერთება")).toBe("միացում");
    expect(aspectAm("სექსტილი")).toBe("սեքստիլ");
    expect(aspectAm("კვადრატი")).toBe("քառակուսի");
    expect(aspectAm("ტრიგონი")).toBe("տրին");
    expect(aspectAm("ოპოზიცია")).toBe("օպոզիցիա");

    const sunday = new Date("2026-08-16T12:00:00Z");
    expect(weekdayAm(sunday)).toBe("Կիրակի");

    const sampleDay = astrologyDay(new Date("2026-08-15T12:00:00Z"));
    const lead = dayLeadAm(sampleDay);
    expect(lead.length).toBeGreaterThan(10);
    const advice = dayAdviceAm(sampleDay);
    expect(advice.title.length).toBeGreaterThan(0);
    expect(advice.summary.length).toBeGreaterThan(10);
    expect(advice.do.length).toBeGreaterThan(0);
    expect(advice.avoid.length).toBeGreaterThan(0);
  });

  it("calculates Mercury retrograde periods with Armenian sign labels", () => {
    const periods2026 = mercuryRetrogradePeriods(2026);
    expect(periods2026.length).toBeGreaterThan(0);
    for (const p of periods2026) {
      expect(p.startSignAm.length).toBeGreaterThan(0);
      expect(p.endSignAm.length).toBeGreaterThan(0);
    }
  });

  it("has metadata objects configured for all hub pages", () => {
    expect(MOON_CALENDAR_AM.title).toContain("Լուսնային օրացույց");
    expect(MOON_PHASE_META_AM.full.title).toContain("Լիալուսնի");
    expect(MOON_PHASE_META_AM.new.title).toContain("Նորալուսնի");
    expect(ECLIPSE_META_AM.title).toContain("խավարումներ");
    expect(CALENDAR_META_AM.all.title).toContain("Աստղաբանական օրացույց");
    expect(CALENDAR_META_AM.lucky.title).toContain("Բարենպաստ");
    expect(CALENDAR_META_AM.careful.title).toContain("Զգուշության");
    expect(MERCURY_RETROGRADE_AM.title).toContain("Մերկուրիի ռետրոգրադ");
  });
});
