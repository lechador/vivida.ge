import { describe, expect, it } from "vitest";

import { ALL_PAIR_SLUGS, parsePairSlug } from "@/lib/seo/zodiac-dates";
import { zodiacPairEnglish } from "@/lib/zodiac-pair-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English zodiac compatibility pairs", () => {
  it("provides complete English content for all 78 canonical pairs", () => {
    const titles = new Set<string>();
    for (const pair of ALL_PAIR_SLUGS) {
      const parsed = parsePairSlug(pair);
      expect(parsed).not.toBeNull();
      const content = zodiacPairEnglish(...parsed!);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
      expect(content.description.length).toBeGreaterThan(100);
      expect(content.overall.length).toBeGreaterThan(250);
      expect(content.love.length).toBeGreaterThan(220);
      expect(content.strengths.length).toBeGreaterThanOrEqual(3);
      expect(content.challenges.length).toBeGreaterThanOrEqual(3);
      expect(content.faq.length).toBeGreaterThanOrEqual(3);
      titles.add(content.title);
    }
    expect(titles.size).toBe(78);
  });
});
