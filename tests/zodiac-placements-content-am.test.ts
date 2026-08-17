import { describe, expect, it } from "vitest";

import sourceDataset from "@/lib/seo/zodiac-content-en.json";
import armenianDataset from "@/lib/seo/zodiac-placements-am.json";
import { ALL_ELEMENT_SLUGS, ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { elementArmenian, placementArmenian } from "@/lib/zodiac-placements-am";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

describe("Armenian zodiac placements and elements", () => {
  it("preserves every translated source shape", () => {
    for (const key of [
      "moons",
      "risings",
      "elements",
      "moonHub",
      "risingHub",
      "elementsHub",
      "byDate",
    ] as const) {
      expect(shape(armenianDataset[key])).toEqual(shape(sourceDataset[key]));
    }
  });

  it("provides complete Armenian Moon and rising content for all signs", () => {
    for (const sign of ALL_SLUGS) {
      for (const kind of ["moon", "rising"] as const) {
        const content = placementArmenian(kind, sign);
        expect(content.sections).toHaveLength(4);
        expect(content.faq.length).toBeGreaterThan(0);
        const text = JSON.stringify(content);
        expect(text).toMatch(/[\u0531-\u058f]/u);
        expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
        expect(text).not.toMatch(/[.:](?:\\n|\s|$)/u);
      }
    }
  });

  it("provides complete Armenian content for all four elements", () => {
    for (const element of ALL_ELEMENT_SLUGS) {
      const content = elementArmenian(element);
      expect(content.strengths.length).toBeGreaterThan(0);
      expect(content.challenges.length).toBeGreaterThan(0);
      expect(content.faq.length).toBeGreaterThan(0);
      const text = JSON.stringify(content);
      expect(text).toMatch(/[\u0531-\u058f]/u);
      expect(text).not.toMatch(/[\u10a0-\u10ff]/u);
      expect(text).not.toMatch(/[.:](?:\\n|\s|$)/u);
    }
  });
});
