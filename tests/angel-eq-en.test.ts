import { describe, expect, it } from "vitest";

import { ALL_ANGEL_SLUGS } from "@/lib/seo/angel-numbers";
import { ANGEL_FAQ_EN, ANGEL_NUMBERS_EN } from "@/lib/seo/angel-numbers-en";
import { EQ_ARTICLE_SLUGS } from "@/lib/seo/eq-articles";
import { EQ_ARTICLES_EN } from "@/lib/seo/eq-articles-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English angel number cluster", () => {
  it("covers every angel-number URL exactly once", () => {
    expect(ANGEL_NUMBERS_EN.map((item) => item.slug).sort()).toEqual(
      [...ALL_ANGEL_SLUGS].sort(),
    );
    expect(new Set(ANGEL_NUMBERS_EN.map((item) => item.slug)).size).toBe(
      ALL_ANGEL_SLUGS.length,
    );
  });

  it("provides complete English reflective copy and disclaimers", () => {
    for (const item of ANGEL_NUMBERS_EN) {
      expect(item.meaning.length).toBeGreaterThan(150);
      expect(item.love.length).toBeGreaterThan(100);
      expect(item.career.length).toBeGreaterThan(100);
      expect(item.action.length).toBeGreaterThan(90);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
    }
    expect(JSON.stringify(ANGEL_FAQ_EN)).not.toMatch(GEORGIAN);
  });
});

describe("English emotional-intelligence library", () => {
  it("covers all fifteen article URLs exactly once", () => {
    expect(EQ_ARTICLES_EN.map((item) => item.slug).sort()).toEqual(
      [...EQ_ARTICLE_SLUGS].sort(),
    );
    expect(new Set(EQ_ARTICLES_EN.map((item) => item.slug)).size).toBe(
      EQ_ARTICLE_SLUGS.length,
    );
  });

  it("has substantial, actionable English content for every guide", () => {
    for (const item of EQ_ARTICLES_EN) {
      expect(item.intro.length).toBeGreaterThan(130);
      expect(item.sections).toHaveLength(2);
      expect(item.sections.every((section) => section.paragraphs.length >= 2)).toBe(true);
      expect(item.steps).toHaveLength(5);
      expect(item.faq).toHaveLength(2);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
    }
  });
});
