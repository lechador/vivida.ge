import { describe, expect, it } from "vitest";

import {
  SPREAD_POSITIONS_EN,
  TAROT_CARDS_EN,
  TAROT_EN_BY_SLUG,
} from "@/lib/tarot/deck-en";

const GEORGIAN = /[ა-ჰ]/;

describe("English tarot deck", () => {
  it("contains every Major Arcana exactly once", () => {
    expect(TAROT_CARDS_EN).toHaveLength(22);
    expect(new Set(TAROT_CARDS_EN.map((card) => card.slug)).size).toBe(22);
    expect(TAROT_CARDS_EN.map((card) => card.number)).toEqual(
      Array.from({ length: 22 }, (_, index) => index),
    );
  });

  it("has complete English editorial copy for every card", () => {
    for (const card of TAROT_CARDS_EN) {
      expect(TAROT_EN_BY_SLUG[card.slug]).toBe(card);
      expect(card.keywords.length).toBeGreaterThanOrEqual(3);
      expect(card.reversedKeywords.length).toBeGreaterThanOrEqual(3);
      expect(card.upright.length).toBeGreaterThan(60);
      expect(card.reversed.length).toBeGreaterThan(60);
      expect(card.love.length).toBeGreaterThan(30);
      expect(card.career.length).toBeGreaterThan(30);
      expect(JSON.stringify(card)).not.toMatch(GEORGIAN);
    }
  });

  it("uses English spread positions", () => {
    expect(SPREAD_POSITIONS_EN).toEqual([
      "Past / root",
      "Present / core",
      "Future / path",
    ]);
    expect(JSON.stringify(SPREAD_POSITIONS_EN)).not.toMatch(GEORGIAN);
  });
});
