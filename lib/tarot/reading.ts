import "server-only";

import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  countUnlocks,
  getBalance,
  recordFreeUse,
  spendCredits,
} from "@/lib/credits";
import { generateTarotReading } from "@/lib/openrouter";
import {
  SPREAD_POSITIONS_KA,
  TAROT_CARDS,
  type DrawnCard,
} from "@/lib/tarot/deck";

/**
 * The tarot Q&A engine. Draws a 3-card spread, charges credits (first reading
 * free, then CREDIT_COST.tarot each), then asks the AI to weave the cards into
 * a personalized answer — falling back to a reading composed from the static
 * card meanings so a paid reading NEVER returns empty after a charge.
 */

export type TarotSpreadCard = {
  slug: string;
  nameKa: string;
  glyph: string;
  reversed: boolean;
  positionKa: string;
  /** AI's per-card interpretation for this question, or the static fallback. */
  interpretationKa: string;
};

export type TarotReading = {
  headline: string;
  cards: TarotSpreadCard[];
  reading: string;
  advice: string;
  charged: number;
  free: boolean;
  balance: number;
};

export type TarotResult =
  | { ok: true; reading: TarotReading }
  | { ok: false; error: "insufficient"; cost: number; balance: number }
  | { ok: false; error: "bad_request" };

/** Draw 3 distinct Major Arcana, each independently upright or reversed. */
function drawSpread(): DrawnCard[] {
  const pool = [...TAROT_CARDS];
  const out: DrawnCard[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(idx, 1);
    out.push({ card, reversed: Math.random() < 0.35 });
  }
  return out;
}

/** Compose a readable fallback answer purely from the static card meanings. */
function fallbackReading(drawn: DrawnCard[]): {
  headline: string;
  cards: string[];
  reading: string;
  advice: string;
} {
  const perCard = drawn.map((d) =>
    d.reversed ? d.card.reversedKa : d.card.uprightKa
  );
  const [past, present, future] = drawn.map((d) => d.card.nameKa);
  return {
    headline: `${present}ის შუქზე`,
    cards: perCard,
    reading:
      `შენს კითხვას სამი კარტი პასუხობს. ფესვში ${past} დგას, აწმყოს ${present} განსაზღვრავს, გზას კი ${future} ხსნის. ` +
      perCard.join(" "),
    advice: drawn[1].reversed ? drawn[1].card.reversedKa : drawn[1].card.uprightKa,
  };
}

/**
 * Perform a reading for `userId`'s `question`. Charges before generating (the
 * static fallback guarantees value for the charge), so a user can't farm free
 * draws by racing the AI call.
 */
export async function performReading(
  userId: string,
  question: string
): Promise<TarotResult> {
  const q = question.trim().slice(0, 300);
  if (q.length < 3) return { ok: false, error: "bad_request" };

  // ── Gate: first reading free, then CREDIT_COST.tarot each ────────────────
  const used = await countUnlocks(userId, "spend_tarot");
  let charged = 0;
  let free = false;
  if (used < FREE_ALLOWANCE.tarot) {
    await recordFreeUse(userId, "spend_tarot");
    free = true;
  } else {
    const paid = await spendCredits(userId, CREDIT_COST.tarot, "spend_tarot");
    if (!paid) {
      const balance = await getBalance(userId);
      return { ok: false, error: "insufficient", cost: CREDIT_COST.tarot, balance };
    }
    charged = CREDIT_COST.tarot;
  }

  // ── Draw + interpret ─────────────────────────────────────────────────────
  const drawn = drawSpread();
  const aiInput = {
    question: q,
    cards: drawn.map((d, i) => ({
      positionKa: SPREAD_POSITIONS_KA[i],
      nameKa: d.card.nameKa,
      orientationKa: d.reversed ? "შებრუნებული" : "პირდაპირი",
      meaningKa: d.reversed ? d.card.reversedKa : d.card.uprightKa,
    })),
  };

  let ai: Awaited<ReturnType<typeof generateTarotReading>> = null;
  try {
    ai = await generateTarotReading(aiInput);
  } catch (err) {
    console.warn("[tarot] AI reading failed, using fallback:", (err as Error).message);
  }
  const composed = ai ?? fallbackReading(drawn);

  const cards: TarotSpreadCard[] = drawn.map((d, i) => ({
    slug: d.card.slug,
    nameKa: d.card.nameKa,
    glyph: d.card.glyph,
    reversed: d.reversed,
    positionKa: SPREAD_POSITIONS_KA[i],
    interpretationKa:
      composed.cards[i] ??
      (d.reversed ? d.card.reversedKa : d.card.uprightKa),
  }));

  const balance = await getBalance(userId);
  return {
    ok: true,
    reading: {
      headline: composed.headline,
      cards,
      reading: composed.reading,
      advice: composed.advice,
      charged,
      free,
      balance,
    },
  };
}
