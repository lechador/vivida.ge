import { describe, expect, it } from "vitest";

import {
  HOUSE_GUIDES_AM,
  PLANET_GUIDES_AM,
} from "@/lib/seo/astrology-guides-am";
import {
  HOUSE_GUIDES_EN,
  PLANET_GUIDES_EN,
} from "@/lib/seo/astrology-guides-en";

describe("Armenian astrology guides", () => {
  it("preserves the complete English house-guide shape", () => {
    expect(HOUSE_GUIDES_AM.map((house) => house.number)).toEqual(
      HOUSE_GUIDES_EN.map((house) => house.number),
    );

    for (const house of HOUSE_GUIDES_AM) {
      const source = HOUSE_GUIDES_EN.find(
        (item) => item.number === house.number,
      );
      expect(source).toBeDefined();
      expect(house.keywords).toHaveLength(source!.keywords.length);
      const text = JSON.stringify(house);
      expect(text).toMatch(/[\u0531-\u058f]/u);
      expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
    }
  });

  it("preserves the complete English planet-guide shape", () => {
    expect(PLANET_GUIDES_AM.map((planet) => planet.slug)).toEqual(
      PLANET_GUIDES_EN.map((planet) => planet.slug),
    );

    for (const planet of PLANET_GUIDES_AM) {
      const source = PLANET_GUIDES_EN.find(
        (item) => item.slug === planet.slug,
      );
      expect(source).toBeDefined();
      expect(planet.keywords).toHaveLength(source!.keywords.length);
      const text = JSON.stringify(planet);
      expect(text).toMatch(/[\u0531-\u058f]/u);
      expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
    }
  });
});
