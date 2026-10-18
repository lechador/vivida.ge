import { describe, expect, it } from "vitest";

import { TAROT_CARDS } from "@/lib/tarot/deck";
import { MINOR_CARDS } from "@/lib/tarot/deck-minor";
import { MINOR_CARDS_EN } from "@/lib/tarot/deck-minor-en";
import {
  FULL_DECK_KA,
  deckKaBySlug,
  englishCardBySlug,
  isMinorCard,
  tarotImageUrl,
} from "@/lib/tarot/deck-full";

const GEORGIAN = /[ა-ჰ]/;

process.env.R2_PUBLIC_URL = "https://example-r2.test";

describe("minor arcana content", () => {
  it("covers every suit and rank exactly once per locale", () => {
    const expected = [
      "ace",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "page",
      "knight",
      "queen",
      "king",
    ];
    for (const suit of ["swords", "cups", "wands", "pentacles"] as const) {
      expect(
        MINOR_CARDS.filter((card) => card.suit === suit).map(
          (card) => card.rank,
        ),
      ).toEqual(expected);
      expect(
        MINOR_CARDS_EN.filter((card) => card.suit === suit).map(
          (card) => card.rank,
        ),
      ).toEqual(expected);
    }
  });

  it("keeps slugs unique across majors and minors", () => {
    const slugs = [
      ...TAROT_CARDS.map((card) => card.slug),
      ...MINOR_CARDS.map((card) => card.slug),
    ];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has complete Georgian and English copy for every minor card", () => {
    expect(MINOR_CARDS.length).toBe(MINOR_CARDS_EN.length);
    for (const card of MINOR_CARDS) {
      expect(card.nameKa).toMatch(GEORGIAN);
      expect(card.keywordsKa.length).toBeGreaterThanOrEqual(3);
      expect(card.keywordsRevKa.length).toBeGreaterThanOrEqual(2);
      expect(card.uprightKa.length).toBeGreaterThan(60);
      expect(card.reversedKa.length).toBeGreaterThan(40);
      expect(card.loveKa.length).toBeGreaterThan(20);
      expect(card.careerKa.length).toBeGreaterThan(20);
      const en = MINOR_CARDS_EN.find((item) => item.slug === card.slug);
      expect(en?.name).not.toMatch(GEORGIAN);
      expect(en?.keywords.length).toBeGreaterThanOrEqual(3);
      expect(en?.upright.length).toBeGreaterThan(60);
      expect(JSON.stringify(en)).not.toMatch(GEORGIAN);
    }
  });
});

describe("full 78-card deck", () => {
  it("draws from majors and minors together", () => {
    expect(FULL_DECK_KA.length).toBe(TAROT_CARDS.length + MINOR_CARDS.length);
    expect(FULL_DECK_KA.filter(isMinorCard).length).toBe(MINOR_CARDS.length);
  });

  it("resolves any card by slug in Georgian", () => {
    expect(deckKaBySlug("the-fool")?.nameKa).toBe("ბრიყვი");
    expect(deckKaBySlug("ace-of-swords")?.nameKa).toBe("ხმლების ტუზი");
    expect(deckKaBySlug("nope")).toBeUndefined();
  });

  it("resolves English meanings for majors and minors", () => {
    expect(englishCardBySlug("the-fool", false).name).toBe("The Fool");
    expect(englishCardBySlug("ace-of-swords", false).name).toBe(
      "Ace of Swords",
    );
    expect(englishCardBySlug("ace-of-swords", true).meaning).toMatch(
      /reversed/i,
    );
  });

  it("serves major art locally and minor art from R2", () => {
    expect(tarotImageUrl("the-fool")).toBe("/tarot/the-fool.webp");
    expect(tarotImageUrl("ace-of-swords")).toBe(
      "https://example-r2.test/tarot/ace-of-swords.webp?v=2",
    );
  });

  it("keeps Georgian copy free of Latin and Cyrillic slips", () => {
    const latinOrCyrillic = /[A-Za-z\u0400-\u04FF]/;
    for (const card of MINOR_CARDS) {
      const fields = [
        card.nameKa,
        card.uprightKa,
        card.reversedKa,
        card.loveKa,
        card.careerKa,
        ...card.keywordsKa,
        ...card.keywordsRevKa,
      ];
      for (const field of fields) {
        expect(field, `card ${card.slug}`).not.toMatch(latinOrCyrillic);
      }
    }
  });
});
