import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { ALL_HOROSCOPE_THEMES } from "@/lib/seo/thematic-horoscope";
import { THEME_CONFIG_AM, getThematicHoroscopeAm } from "@/lib/thematic-horoscope-am";

const GEORGIAN = /[\u10A0-\u10FF]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian thematic horoscopes", () => {
  it("covers three themes and all twelve signs with Armenian copy", () => {
    const combinations = new Set<string>();
    for (const theme of ALL_HOROSCOPE_THEMES) {
      expect(JSON.stringify(THEME_CONFIG_AM[theme])).not.toMatch(GEORGIAN);
      expect(JSON.stringify(THEME_CONFIG_AM[theme])).toMatch(ARMENIAN);
      for (const sign of ALL_SLUGS) {
        const content = getThematicHoroscopeAm(theme, sign);
        expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
        expect(JSON.stringify(content)).toMatch(ARMENIAN);
        expect(content.main.length).toBeGreaterThanOrEqual(2);
        expect(content.focus.length).toBeGreaterThan(20);
        expect(content.watch.length).toBeGreaterThan(20);
        combinations.add(`${theme}:${sign}`);
      }
    }
    expect(combinations.size).toBe(36);
  });
});
