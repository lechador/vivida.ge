import { describe, expect, it } from "vitest";

import { ALL_ANGEL_SLUGS, ANGEL_NUMBERS } from "@/lib/seo/angel-numbers";
import { ANGEL_AM_BY_SLUG, ANGEL_FAQ_AM, ANGEL_NUMBERS_AM } from "@/lib/seo/angel-numbers-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian Angel Numbers content", () => {
  it("provides complete Armenian content for all 14 angel numbers", () => {
    expect(ANGEL_NUMBERS_AM.length).toBe(14);
    for (const slug of ALL_ANGEL_SLUGS) {
      const angel = ANGEL_AM_BY_SLUG[slug];
      expect(angel, `Missing Armenian angel number for slug: ${slug}`).toBeDefined();
      expect(angel.title.length).toBeGreaterThan(0);
      expect(angel.essence.length).toBeGreaterThan(15);
      expect(angel.meaning.length).toBeGreaterThan(25);
      expect(angel.love.length).toBeGreaterThan(20);
      expect(angel.career.length).toBeGreaterThan(20);
      expect(angel.action.length).toBeGreaterThan(15);
      expect(JSON.stringify(angel)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(angel)).toMatch(ARMENIAN);
    }
  });

  it("provides complete Armenian FAQ", () => {
    expect(ANGEL_FAQ_AM.length).toBeGreaterThanOrEqual(4);
    for (const item of ANGEL_FAQ_AM) {
      expect(item.q.length).toBeGreaterThan(10);
      expect(item.a.length).toBeGreaterThan(20);
      expect(JSON.stringify(item)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(item)).toMatch(ARMENIAN);
    }
  });
});
