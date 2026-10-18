import { describe, expect, it } from "vitest";

import { HOUSE_GUIDES_EN, PLANET_GUIDES_EN } from "@/lib/seo/astrology-guides-en";
import { HOUSE_NUMBERS, PLANET_SLUGS } from "@/lib/seo/astrology-guides";

const GEORGIAN = /[\u10A0-\u10FF]/;

describe("English astrology guide content", () => {
  it("covers all 12 houses in order", () => {
    expect(HOUSE_GUIDES_EN.map((house) => String(house.number))).toEqual(HOUSE_NUMBERS);
    expect(HOUSE_GUIDES_EN).toHaveLength(12);
  });

  it("covers every planet without changing public slugs", () => {
    expect(PLANET_GUIDES_EN.map((planet) => planet.slug)).toEqual(PLANET_SLUGS);
    expect(PLANET_GUIDES_EN).toHaveLength(10);
  });

  it("contains no Georgian text and has complete house copy", () => {
    for (const house of HOUSE_GUIDES_EN) {
      expect(JSON.stringify(house)).not.toMatch(GEORGIAN);
      expect(house.name.length).toBeGreaterThan(5);
      expect(house.meaning.length).toBeGreaterThan(100);
      expect(house.strong.length).toBeGreaterThan(85);
      expect(house.reading.length).toBeGreaterThan(100);
      expect(house.keywords.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("contains no Georgian text and has complete planet copy", () => {
    for (const planet of PLANET_GUIDES_EN) {
      expect(JSON.stringify(planet)).not.toMatch(GEORGIAN);
      expect(planet.meaning.length).toBeGreaterThan(100);
      expect(planet.balanced.length).toBeGreaterThan(55);
      expect(planet.challenge.length).toBeGreaterThan(55);
      expect(planet.question.endsWith("?")).toBe(true);
      expect(planet.keywords.length).toBeGreaterThanOrEqual(4);
    }
  });
});
