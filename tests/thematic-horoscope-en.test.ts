import { describe, expect, it } from "vitest";

import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { ALL_HOROSCOPE_THEMES } from "@/lib/seo/thematic-horoscope";
import { THEME_CONFIG_EN, thematicHoroscopeEnglish } from "@/lib/thematic-horoscope-en";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English thematic horoscopes", () => {
  it("covers three themes and all twelve signs without Georgian copy", () => {
    const combinations = new Set<string>();
    for (const theme of ALL_HOROSCOPE_THEMES) {
      expect(JSON.stringify(THEME_CONFIG_EN[theme])).not.toMatch(GEORGIAN);
      for (const sign of ALL_SLUGS) {
        const content = thematicHoroscopeEnglish(theme, sign);
        expect(JSON.stringify(content)).not.toMatch(GEORGIAN);
        expect(content.main).toHaveLength(2);
        expect(content.main.join(" ").length).toBeGreaterThan(300);
        expect(content.focus.length).toBeGreaterThan(80);
        expect(content.watch.length).toBeGreaterThan(80);
        combinations.add(`${theme}:${sign}`);
      }
    }
    expect(combinations.size).toBe(36);
  });
});
