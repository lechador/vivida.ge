import { describe, expect, it } from "vitest";

import { ALL_DREAM_SLUGS, DREAM_SYMBOLS } from "@/lib/seo/dreams";
import { DREAM_AM_BY_SLUG, DREAM_SYMBOLS_AM } from "@/lib/seo/dreams-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian Dream content", () => {
  it("provides complete Armenian translations for all 38 dream symbols", () => {
    expect(DREAM_SYMBOLS_AM.length).toBe(38);
    for (const slug of ALL_DREAM_SLUGS) {
      const dream = DREAM_AM_BY_SLUG[slug];
      expect(dream, `Missing Armenian dream for slug: ${slug}`).toBeDefined();
      expect(dream.title.length).toBeGreaterThan(0);
      expect(dream.summary.length).toBeGreaterThan(15);
      expect(dream.meaning.length).toBeGreaterThan(25);
      expect(dream.variants.length).toBeGreaterThanOrEqual(2);
      expect(dream.positive.length).toBeGreaterThan(10);
      expect(dream.caution.length).toBeGreaterThan(10);
      expect(dream.glyph.length).toBeGreaterThan(0);
      expect(JSON.stringify(dream)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(dream)).toMatch(ARMENIAN);
    }
  });

  it("mirrors the 38 symbols in the Georgian base list", () => {
    const geoSlugs = new Set(DREAM_SYMBOLS.map((s) => s.slug));
    const amSlugs = new Set(DREAM_SYMBOLS_AM.map((s) => s.slug));
    expect(amSlugs.size).toBe(geoSlugs.size);
    for (const slug of geoSlugs) {
      expect(amSlugs.has(slug)).toBe(true);
    }
  });
});
