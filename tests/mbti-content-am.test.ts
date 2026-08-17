import { describe, expect, it } from "vitest";

import { ALL_MBTI_TYPES, buildMbtiSeoAm } from "@/lib/seo/mbti-seo";
import { MBTI_CONTENT_AM, mbtiByCodeAm } from "@/lib/mbti-content-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian MBTI content", () => {
  it("provides editorial profiles for all 16 MBTI types", () => {
    for (const type of ALL_MBTI_TYPES) {
      const profile = mbtiByCodeAm(type);
      expect(profile).toBeDefined();
      expect(profile.archetype.length).toBeGreaterThan(0);
      expect(profile.tagline.length).toBeGreaterThan(15);
      expect(profile.summary.length).toBeGreaterThanOrEqual(1);
      expect(profile.strengths.length).toBeGreaterThanOrEqual(2);
      expect(profile.challenges.length).toBeGreaterThanOrEqual(2);
      expect(profile.relationships.length).toBeGreaterThan(10);
      expect(profile.career.length).toBeGreaterThan(10);
      expect(profile.growth.length).toBeGreaterThan(10);
      expect(JSON.stringify(profile)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(profile)).toMatch(ARMENIAN);
    }
  });

  it("builds valid Armenian SEO objects for all 16 types", () => {
    for (const type of ALL_MBTI_TYPES) {
      const seo = buildMbtiSeoAm(type);
      expect(seo.code).toBe(type);
      expect(seo.slug).toBe(type.toLowerCase());
      expect(seo.pageTitle).toContain(type);
      expect(seo.metaDescription.length).toBeGreaterThan(50);
      expect(seo.faq.length).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(seo)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(seo)).toMatch(ARMENIAN);
    }
  });
});
