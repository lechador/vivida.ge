import { describe, expect, it } from "vitest";

import { ALL_PAIR_SLUGS, parsePairSlug } from "@/lib/seo/zodiac-dates";
import { zodiacPairArmenian } from "@/lib/zodiac-pair-am";

const GEORGIAN = /[\u10A0-\u10FF]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian zodiac compatibility pairs", () => {
  it("provides complete Armenian content for all 78 canonical pairs", () => {
    const titles = new Set<string>();
    for (const pair of ALL_PAIR_SLUGS) {
      const parsed = parsePairSlug(pair);
      expect(parsed).not.toBeNull();
      const content = zodiacPairArmenian(...parsed!);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(content)).toMatch(ARMENIAN);
      expect(content.description.length).toBeGreaterThan(60);
      expect(content.overall.length).toBeGreaterThan(150);
      expect(content.love.length).toBeGreaterThan(100);
      expect(content.strengths.length).toBeGreaterThanOrEqual(3);
      expect(content.challenges.length).toBeGreaterThanOrEqual(3);
      expect(content.faq.length).toBeGreaterThanOrEqual(3);
      titles.add(content.title);
    }
    expect(titles.size).toBe(78);
  });
});
