import { describe, expect, it } from "vitest";

import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { LIFE_PATH_CONTENT_AM, NUMEROLOGY_FAQ_AM } from "@/lib/seo/numerology-content-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian Numerology content", () => {
  it("provides complete Armenian profiles for all life-path numbers", () => {
    for (const number of LIFE_PATH_NUMBERS) {
      const content = LIFE_PATH_CONTENT_AM[number];
      expect(content, `Missing content for number: ${number}`).toBeDefined();
      expect(content.title.length).toBeGreaterThan(0);
      expect(content.archetype.length).toBeGreaterThan(0);
      expect(content.essence.length).toBeGreaterThan(15);
      expect(content.traits.length).toBeGreaterThanOrEqual(4);
      expect(content.strengths.length).toBeGreaterThan(20);
      expect(content.challenges.length).toBeGreaterThan(20);
      expect(content.love.length).toBeGreaterThan(20);
      expect(content.career.length).toBeGreaterThan(20);
      expect(content.advice.length).toBeGreaterThan(20);
      expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(content)).toMatch(ARMENIAN);
    }
  });

  it("provides complete Armenian FAQ", () => {
    expect(NUMEROLOGY_FAQ_AM.length).toBeGreaterThanOrEqual(4);
    for (const item of NUMEROLOGY_FAQ_AM) {
      expect(item.q.length).toBeGreaterThan(10);
      expect(item.a.length).toBeGreaterThan(20);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(item)).toMatch(ARMENIAN);
    }
  });
});
