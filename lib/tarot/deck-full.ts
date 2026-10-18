import { TAROT_CARDS, type TarotCard } from "@/lib/tarot/deck";
import { TAROT_EN_BY_SLUG } from "@/lib/tarot/deck-en";
import {
  MINOR_BY_SLUG,
  MINOR_CARDS,
  type MinorTarotCard,
} from "@/lib/tarot/deck-minor";
import { MINOR_EN_BY_SLUG } from "@/lib/tarot/deck-minor-en";

/** Any card the reader can draw, a major or a minor. */
export type DeckCard = TarotCard | MinorTarotCard;

export function isMinorCard(card: DeckCard): card is MinorTarotCard {
  return (card as MinorTarotCard).suit !== undefined;
}

/** The full 78-card deck in draw order-agnostic form (Georgian copy). */
export const FULL_DECK_KA: DeckCard[] = [...TAROT_CARDS, ...MINOR_CARDS];

export function deckKaBySlug(slug: string): DeckCard | undefined {
  return TAROT_CARDS.find((card) => card.slug === slug) ?? MINOR_BY_SLUG[slug];
}

export function englishCardBySlug(
  slug: string,
  reversed: boolean,
): { name: string; meaning: string } {
  const card = TAROT_EN_BY_SLUG[slug] ?? MINOR_EN_BY_SLUG[slug];
  if (!card) throw new Error(`unknown tarot card: ${slug}`);
  return {
    name: card.name,
    meaning: reversed ? card.reversed : card.upright,
  };
}

/**
 * Where a card's illustration lives. Majors ship with the app bundle;
 * minors are served from R2 (uploaded as `tarot/<slug>.webp`).
 */
export function tarotImageUrl(slug: string): string {
  if (!MINOR_BY_SLUG[slug]) return `/tarot/${slug}.webp`;
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  // ?v=2, minors were re-processed to 2:3 (blur-padded) after the first
  // upload; the query breaks stale CDN/browser caches of the 9:16 originals.
  return base ? `${base}/tarot/${slug}.webp?v=2` : `/tarot/${slug}.webp`;
}
