import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { COMPATIBILITY_EN, ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";

const GEORGIAN = /[ა-ჰ]/;

describe("English zodiac sign content", () => {
  it("provides a complete English profile for every zodiac sign", () => {
    expect(Object.keys(ZODIAC_SIGN_EN)).toEqual(ALL_SLUGS);
    for (const sign of ALL_SLUGS) {
      const profile = ZODIAC_SIGN_EN[sign];
      expect(profile.strengths).toHaveLength(4);
      expect(profile.challenges).toHaveLength(4);
      expect(profile.core.length).toBeGreaterThan(180);
      expect(COMPATIBILITY_EN[sign]).toHaveLength(4);
      expect(
        JSON.stringify({ profile, compatibility: COMPATIBILITY_EN[sign] }),
      ).not.toMatch(GEORGIAN);
    }
  });
});
