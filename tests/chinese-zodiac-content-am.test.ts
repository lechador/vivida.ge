import { describe, expect, it } from "vitest";

import { ALL_CHINESE_SLUGS, CHINESE_ANIMALS } from "@/lib/seo/chinese-zodiac";
import {
  CHINESE_ANIMALS_AM,
  CHINESE_ZODIAC_AM_BY_SLUG,
  CHINESE_ZODIAC_CONTENT_AM,
  CHINESE_ZODIAC_FAQ_AM,
} from "@/lib/seo/chinese-zodiac-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian Chinese Zodiac content", () => {
  it("provides complete Armenian content for all 12 Chinese animals", () => {
    expect(CHINESE_ZODIAC_CONTENT_AM.length).toBe(12);
    for (const slug of ALL_CHINESE_SLUGS) {
      const animal = CHINESE_ZODIAC_AM_BY_SLUG[slug];
      expect(animal, `Missing Armenian content for Chinese animal: ${slug}`).toBeDefined();
      expect(animal.name.length).toBeGreaterThan(0);
      expect(animal.element.length).toBeGreaterThan(0);
      expect(animal.polarity.length).toBeGreaterThan(0);
      expect(animal.headline.length).toBeGreaterThan(10);
      expect(animal.intro.length).toBeGreaterThan(25);
      expect(animal.personality.length).toBeGreaterThan(25);
      expect(animal.strengths.length).toBeGreaterThanOrEqual(3);
      expect(animal.challenges.length).toBeGreaterThanOrEqual(2);
      expect(animal.love.length).toBeGreaterThan(20);
      expect(animal.career.length).toBeGreaterThan(20);
      expect(animal.compatible.length).toBeGreaterThanOrEqual(2);
      expect(animal.challenging.length).toBeGreaterThanOrEqual(1);

      expect(JSON.stringify(animal)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(animal)).toMatch(ARMENIAN);
    }
  });

  it("provides translations for all animal dictionary entries", () => {
    for (const animal of CHINESE_ANIMALS) {
      const am = CHINESE_ANIMALS_AM[animal.slug];
      expect(am, `Missing CHINESE_ANIMALS_AM entry for ${animal.slug}`).toBeDefined();
      expect(am.name.length).toBeGreaterThan(0);
      expect(am.element.length).toBeGreaterThan(0);
      expect(am.polarity.length).toBeGreaterThan(0);
      expect(JSON.stringify(am)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(am)).toMatch(ARMENIAN);
    }
  });

  it("provides complete Armenian FAQ", () => {
    expect(CHINESE_ZODIAC_FAQ_AM.length).toBeGreaterThanOrEqual(3);
    for (const item of CHINESE_ZODIAC_FAQ_AM) {
      expect(item.q.length).toBeGreaterThan(10);
      expect(item.a.length).toBeGreaterThan(20);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(item)).toMatch(ARMENIAN);
    }
  });
});
