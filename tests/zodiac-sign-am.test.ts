import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { COMPATIBILITY_AM, ZODIAC_SIGN_AM } from "@/lib/zodiac-sign-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian zodiac sign content", () => {
  it("provides a complete Armenian profile for every zodiac sign", () => {
    expect(Object.keys(ZODIAC_SIGN_AM)).toEqual(ALL_SLUGS);
    for (const sign of ALL_SLUGS) {
      const profile = ZODIAC_SIGN_AM[sign];
      expect(profile.strengths.length).toBeGreaterThanOrEqual(4);
      expect(profile.challenges.length).toBeGreaterThanOrEqual(4);
      expect(profile.core.length).toBeGreaterThan(100);
      expect(COMPATIBILITY_AM[sign]).toHaveLength(4);
      expect(
        JSON.stringify({ profile, compatibility: COMPATIBILITY_AM[sign] }),
      ).not.toMatch(GEORGIAN);
      expect(profile.core).toMatch(ARMENIAN);
    }
  });
});
