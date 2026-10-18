import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { yearlyHoroscopeEnglish } from "@/lib/yearly-horoscope-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English yearly horoscopes", () => {
  it("provides distinct, complete 2026 content for all signs", () => {
    const taglines = new Set<string>();
    for (const sign of ALL_SLUGS) {
      const content = yearlyHoroscopeEnglish(sign, 2026);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
      expect(content.description.length).toBeGreaterThan(100);
      expect(content.overview.join(" ").length).toBeGreaterThan(350);
      expect(content.sections).toHaveLength(5);
      expect(content.sections.every((section) => section.body.length > 180)).toBe(true);
      expect(content.faq.length).toBeGreaterThanOrEqual(4);
      taglines.add(content.tagline);
    }
    expect(taglines.size).toBe(ALL_SLUGS.length);
  });
});
