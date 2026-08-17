import { describe, expect, it } from "vitest";

import { EQ_ARTICLES_EN } from "@/lib/seo/eq-articles-en";
import {
  EQ_ARTICLES_AM,
  EQ_HUB_AM,
  eqArticleAmBySlug,
} from "@/lib/seo/eq-articles-am";

describe("Armenian EQ Articles localization", () => {
  it("translates all 15 EQ articles into Armenian", () => {
    expect(EQ_ARTICLES_AM.length).toBe(EQ_ARTICLES_EN.length);
    expect(EQ_ARTICLES_AM.map((article) => article.slug)).toEqual(
      EQ_ARTICLES_EN.map((article) => article.slug),
    );

    for (const enArticle of EQ_ARTICLES_EN) {
      const armArticle = eqArticleAmBySlug(enArticle.slug);
      expect(armArticle).toBeDefined();
      expect(armArticle?.readingMinutes).toBe(enArticle.readingMinutes);
      expect(armArticle?.domains).toEqual(enArticle.domains);
      expect(armArticle?.title.length).toBeGreaterThan(10);
      expect(armArticle?.description.length).toBeGreaterThan(20);
      expect(armArticle?.category.length).toBeGreaterThan(2);
      expect(armArticle?.intro.length).toBeGreaterThan(30);
      expect(armArticle?.sections).toHaveLength(enArticle.sections.length);
      enArticle.sections.forEach((section, sectionIndex) => {
        expect(armArticle?.sections[sectionIndex]?.paragraphs).toHaveLength(
          section.paragraphs.length,
        );
      });
      expect(armArticle?.steps).toHaveLength(enArticle.steps.length);
      expect(armArticle?.faq).toHaveLength(enArticle.faq.length);

      const text = JSON.stringify(armArticle);
      expect(text).toMatch(/[\u0531-\u058f]/u);
      expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
    }
  });

  it("has valid hub metadata in Armenian", () => {
    expect(EQ_HUB_AM.title).toContain("Էմոցիոնալ ինտելեկտ");
    expect(EQ_HUB_AM.description.length).toBeGreaterThan(20);
  });
});
