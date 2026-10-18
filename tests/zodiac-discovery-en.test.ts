import { describe, expect, it } from "vitest";

import {
  ALL_CHINESE_SLUGS,
  CHINESE_ANIMALS,
} from "@/lib/seo/chinese-zodiac";
import { CHINESE_ZODIAC_CONTENT_EN } from "@/lib/seo/chinese-zodiac-en";
import { ALL_RANKING_SLUGS } from "@/lib/seo/rankings";
import { RANKING_TOPICS_EN } from "@/lib/seo/rankings-en";
import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English zodiac discovery clusters", () => {
  it("covers every ranking topic with a complete unique sign order", () => {
    expect(RANKING_TOPICS_EN.map((topic) => topic.slug).sort()).toEqual(
      [...ALL_RANKING_SLUGS].sort(),
    );

    for (const topic of RANKING_TOPICS_EN) {
      expect(topic.order).toHaveLength(ALL_SLUGS.length);
      expect(new Set(topic.order).size).toBe(ALL_SLUGS.length);
      expect([...topic.order].sort()).toEqual([...ALL_SLUGS].sort());
      expect(topic.trait.length).toBeGreaterThan(30);
      expect(JSON.stringify(topic)).not.toMatch(GEORGIAN);
    }
  });

  it("covers all twelve Chinese zodiac animals with complete English copy", () => {
    expect(CHINESE_ZODIAC_CONTENT_EN.map((animal) => animal.slug).sort()).toEqual(
      [...ALL_CHINESE_SLUGS].sort(),
    );
    expect(new Set(CHINESE_ZODIAC_CONTENT_EN.map((animal) => animal.slug)).size).toBe(12);

    for (const content of CHINESE_ZODIAC_CONTENT_EN) {
      expect(content.intro.length).toBeGreaterThan(120);
      expect(content.personality.length).toBeGreaterThan(120);
      expect(content.strengths.length).toBeGreaterThanOrEqual(4);
      expect(content.challenges.length).toBeGreaterThanOrEqual(3);
      expect(content.compatible.length).toBeGreaterThanOrEqual(3);
      expect(content.challenging.length).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
    }
  });

  it("provides English reference labels for every Chinese zodiac animal", () => {
    expect(CHINESE_ANIMALS).toHaveLength(12);
    for (const animal of CHINESE_ANIMALS) {
      expect(animal.nameEn.length).toBeGreaterThan(1);
      expect(animal.elementEn).toMatch(/^(Wood|Fire|Earth|Metal|Water)$/);
      expect(animal.polarityEn).toMatch(/^(Yin|Yang)$/);
      expect(`${animal.nameEn}${animal.elementEn}${animal.polarityEn}`).not.toMatch(
        GEORGIAN,
      );
    }
  });
});
