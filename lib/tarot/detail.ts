import { TAROT_BY_SLUG, TAROT_CARDS } from "@/lib/tarot/deck";
import { TAROT_CARDS_EN, TAROT_EN_BY_SLUG } from "@/lib/tarot/deck-en";
import { MINOR_BY_SLUG, MINOR_CARDS } from "@/lib/tarot/deck-minor";
import { MINOR_CARDS_EN, MINOR_EN_BY_SLUG } from "@/lib/tarot/deck-minor-en";
import { tarotImageUrl } from "@/lib/tarot/deck-full";

/**
 * The unified card catalog behind `/taro/[card]`, all 78 cards in Georgian
 * and English. Armenian stays on the 22 majors (no Armenian minor content
 * exists, and Armenian is being removed).
 */

export type TarotDetailCard = {
  slug: string;
  name: string;
  nameEn: string;
  glyph: string;
  image: string;
  arcana: "major" | "minor";
  /** 0–21 for majors. */
  number?: number;
  /** Suit id for minors ("swords" | "cups" | "wands" | "pentacles"). */
  suit?: string;
  /** Eyebrow line, e.g. "დიდი არკანა · 5" or "მცირე არკანა · ხმლები". */
  eyebrow: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
};

const SUIT_KA: Record<string, string> = {
  swords: "ხმლები",
  cups: "თასები",
  wands: "კვერთხები",
  pentacles: "მონეტები",
};

const SUIT_EN: Record<string, string> = {
  swords: "Swords",
  cups: "Cups",
  wands: "Wands",
  pentacles: "Pentacles",
};

/** Every detail page slug: 22 majors + 56 minors. */
export function tarotDetailSlugs(): string[] {
  return [
    ...TAROT_CARDS.map((card) => card.slug),
    ...MINOR_CARDS.map((card) => card.slug),
  ];
}

export function tarotDetailCard(
  slug: string,
  locale: "ka" | "en",
): TarotDetailCard | undefined {
  const en = locale === "en";
  const majorKa = TAROT_BY_SLUG[slug];
  const majorEn = TAROT_EN_BY_SLUG[slug];
  if (majorKa && majorEn) {
    return {
      slug,
      name: en ? majorEn.name : majorKa.nameKa,
      nameEn: majorKa.nameEn,
      glyph: majorKa.glyph,
      image: tarotImageUrl(slug),
      arcana: "major",
      number: majorKa.number,
      eyebrow: en
        ? `Major Arcana · ${majorKa.number}`
        : `დიდი არკანა · ${majorKa.number}`,
      keywords: en ? majorEn.keywords : majorKa.keywordsKa,
      reversedKeywords: en ? majorEn.reversedKeywords : majorKa.keywordsRevKa,
      upright: en ? majorEn.upright : majorKa.uprightKa,
      reversed: en ? majorEn.reversed : majorKa.reversedKa,
      love: en ? majorEn.love : majorKa.loveKa,
      career: en ? majorEn.career : majorKa.careerKa,
    };
  }
  const minorKa = MINOR_BY_SLUG[slug];
  const minorEn = MINOR_EN_BY_SLUG[slug];
  if (minorKa && minorEn) {
    return {
      slug,
      name: en ? minorEn.name : minorKa.nameKa,
      nameEn: minorKa.nameEn,
      glyph: minorKa.glyph,
      image: tarotImageUrl(slug),
      arcana: "minor",
      suit: minorKa.suit,
      eyebrow: en
        ? `Minor Arcana · ${SUIT_EN[minorKa.suit]}`
        : `მცირე არკანა · ${SUIT_KA[minorKa.suit]}`,
      keywords: en ? minorEn.keywords : minorKa.keywordsKa,
      reversedKeywords: en ? minorEn.reversedKeywords : minorKa.keywordsRevKa,
      upright: en ? minorEn.upright : minorKa.uprightKa,
      reversed: en ? minorEn.reversed : minorKa.reversedKa,
      love: en ? minorEn.love : minorKa.loveKa,
      career: en ? minorEn.career : minorKa.careerKa,
    };
  }
  return undefined;
}

/** Locale-aware deck for prev/next navigation and card indexes. */
export function tarotDetailDeck(locale: "ka" | "en"): TarotDetailCard[] {
  const cards =
    locale === "en"
      ? [...TAROT_CARDS_EN, ...MINOR_CARDS_EN]
      : [...TAROT_CARDS, ...MINOR_CARDS];
  return cards
    .map((card) => tarotDetailCard(card.slug, locale))
    .filter((card): card is TarotDetailCard => card !== undefined);
}
