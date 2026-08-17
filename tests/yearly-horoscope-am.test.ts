import { describe, expect, it } from "vitest";

import sourceDataset from "@/lib/seo/zodiac-content-en.json";
import armenianDataset from "@/lib/seo/yearly-horoscope-am.json";
import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { yearlyHoroscopeArmenian } from "@/lib/yearly-horoscope-am";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

describe("Armenian yearly horoscopes", () => {
  it("preserves the complete English 2026 content shape", () => {
    const source = sourceDataset.yearly["2026"];
    expect(Object.keys(armenianDataset)).toEqual(Object.keys(source));
    expect(shape(armenianDataset)).toEqual(shape(source));
  });

  it("provides clean Armenian content for all 12 signs", () => {
    for (const sign of ALL_SLUGS) {
      const content = yearlyHoroscopeArmenian(sign, 2026);
      expect(content).toBeDefined();
      expect(content!.overview.length).toBeGreaterThanOrEqual(2);
      expect(content!.sections).toHaveLength(5);
      expect(content!.keyDates.length).toBeGreaterThan(0);
      expect(content!.faq.length).toBeGreaterThan(0);

      const text = JSON.stringify(content);
      expect(text).toMatch(/[\u0531-\u058f]/u);
      expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
      expect(text).not.toMatch(/[.:](?:\\n|\s|$)/u);
    }
  });

  it("does not claim unsupported years", () => {
    expect(yearlyHoroscopeArmenian("aries", 2027)).toBeUndefined();
  });
});
