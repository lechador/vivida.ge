import { describe, expect, it } from "vitest";

import {
  TAROT_CARDS_AM,
  tarotCardBySlugAm,
} from "@/lib/tarot/deck-am";

const GEORGIAN = /[ა-ჰ]/;
const ARMENIAN = /[\u0530-\u058F]/;

describe("Armenian tarot deck", () => {
  it("contains every Major Arcana exactly once", () => {
    expect(TAROT_CARDS_AM).toHaveLength(22);
    expect(new Set(TAROT_CARDS_AM.map((card) => card.slug)).size).toBe(22);
    expect(TAROT_CARDS_AM.map((card) => card.number)).toEqual(
      Array.from({ length: 22 }, (_, index) => index),
    );
  });

  it("has complete Armenian editorial copy for every card", () => {
    for (const card of TAROT_CARDS_AM) {
      expect(tarotCardBySlugAm(card.slug)).toBe(card);
      expect(card.keywords.length).toBeGreaterThanOrEqual(3);
      expect(card.reversedKeywords.length).toBeGreaterThanOrEqual(3);
      expect(card.upright.length).toBeGreaterThan(60);
      expect(card.reversed.length).toBeGreaterThan(60);
      expect(card.love.length).toBeGreaterThan(30);
      expect(card.career.length).toBeGreaterThan(30);
      expect(JSON.stringify(card)).not.toMatch(GEORGIAN);
      expect(JSON.stringify(card)).toMatch(ARMENIAN);
    }
  });
});
