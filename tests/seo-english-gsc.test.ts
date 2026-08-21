import { describe, expect, it } from "vitest";

import { signHoroscopeSeoEn } from "@/components/seo/sign-horoscope-page-en";
import { calendarDaySeoEn } from "@/lib/seo/astrology-calendar-en";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[Ա-Ֆա-ֆ]/;

describe("English SEO copy informed by Search Console queries", () => {
  it("targets date astrology, ephemeris, and planetary-position intent", () => {
    const seo = calendarDaySeoEn(new Date("2026-08-18T12:00:00Z"));

    expect(seo.title).toBe(
      "August 18, 2026 Astrology: Planetary Positions & Aspects",
    );
    expect(seo.description).toContain("astrology and ephemeris");
    expect(seo.description).toContain("planetary positions");
    expect(JSON.stringify(seo)).not.toMatch(GEORGIAN);
    expect(JSON.stringify(seo)).not.toMatch(ARMENIAN);
  });

  it("uses the exact next-month query shape and the correct calendar month", () => {
    const seo = signHoroscopeSeoEn(
      "Aquarius",
      "nextMonth",
      new Date("2026-01-31T12:00:00Z"),
    );

    expect(seo.title).toBe(
      "Aquarius Horoscope Next Month — February 2026",
    );
    expect(seo.heading).toBe("Aquarius Horoscope Next Month");
    expect(seo.description).toContain("Aquarius horoscope next month");
  });
});
