import { describe, expect, it } from "vitest";

import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { ALL_DREAM_SLUGS } from "@/lib/seo/dreams";
import { DREAM_SYMBOLS_EN } from "@/lib/seo/dreams-en";
import { LIFE_PATH_CONTENT_EN, NUMEROLOGY_FAQ_EN } from "@/lib/seo/numerology-content-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English dream dictionary", () => {
  it("covers every Georgian-cluster URL exactly once", () => {
    expect(DREAM_SYMBOLS_EN.map((item) => item.slug).sort()).toEqual(
      [...ALL_DREAM_SLUGS].sort(),
    );
    expect(new Set(DREAM_SYMBOLS_EN.map((item) => item.slug)).size).toBe(
      ALL_DREAM_SLUGS.length,
    );
  });

  it("has complete English editorial content for every symbol", () => {
    for (const item of DREAM_SYMBOLS_EN) {
      expect(item.summary.length).toBeGreaterThan(75);
      expect(item.meaning.length).toBeGreaterThan(140);
      expect(item.variants).toHaveLength(3);
      expect(item.positive.length).toBeGreaterThan(70);
      expect(item.caution.length).toBeGreaterThan(70);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
    }
  });
});

describe("English life path numerology", () => {
  it("covers all standard and Master Numbers", () => {
    expect(Object.keys(LIFE_PATH_CONTENT_EN)).toEqual([...LIFE_PATH_NUMBERS]);
  });

  it("provides substantial English copy for every number", () => {
    for (const number of LIFE_PATH_NUMBERS) {
      const content = LIFE_PATH_CONTENT_EN[number];
      expect(content.number).toBe(number);
      expect(content.traits).toHaveLength(5);
      expect(content.strengths.length).toBeGreaterThan(140);
      expect(content.challenges.length).toBeGreaterThan(140);
      expect(content.love.length).toBeGreaterThan(120);
      expect(content.career.length).toBeGreaterThan(120);
      expect(content.advice.length).toBeGreaterThan(120);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
    }
    expect(JSON.stringify(NUMEROLOGY_FAQ_EN)).not.toMatch(GEORGIAN);
  });
});
