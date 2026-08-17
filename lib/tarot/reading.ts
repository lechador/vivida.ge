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
import { SPREAD_POSITIONS_EN, TAROT_EN_BY_SLUG } from "@/lib/tarot/deck-en";
import { tarotCardBySlugAm } from "@/lib/tarot/deck-am";
import type { UserLocale } from "@/lib/i18n/locale";

/**
 * The tarot Q&A engine. Draws a 3-card spread, charges credits (first reading
 * free, then CREDIT_COST.tarot each), then asks the AI to weave the cards into
 * a personalized answer — falling back to a reading composed from the static
 * card meanings so a paid reading NEVER returns empty after a charge.
 */

export type TarotSpreadCard = {
  slug: string;
  name: string;
  glyph: string;
  reversed: boolean;
  position: string;
  /** AI's per-card interpretation for this question, or the static fallback. */
  interpretation: string;
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
function cardCopy(drawn: DrawnCard, locale: UserLocale) {
  if (locale === "am") {
    const card = tarotCardBySlugAm(drawn.card.slug)!;
    return {
      name: card.name,
      meaning: drawn.reversed ? card.reversed : card.upright,
    };
  }
  if (locale === "en") {
    const card = TAROT_EN_BY_SLUG[drawn.card.slug];
    return {
      name: card.name,
      meaning: drawn.reversed ? card.reversed : card.upright,
    };
  }
  return {
    name: drawn.card.nameKa,
    meaning: drawn.reversed ? drawn.card.reversedKa : drawn.card.uprightKa,
  };
}

function fallbackReading(
  drawn: DrawnCard[],
  locale: UserLocale,
): {
  headline: string;
  cards: string[];
  reading: string;
  advice: string;
} {
  const copy = drawn.map((card) => cardCopy(card, locale));
  const perCard = copy.map((card) => card.meaning);
  const [past, present, future] = copy.map((card) => card.name);
  if (locale === "am") {
    return {
      headline: `${present}-ի լույսի ներքո`,
      cards: perCard,
      reading:
        `Երեք քարտ պատասխանում են ձեր հարցին: Արմատում ${past}-ն է, ներկան սահմանում է ${present}-ը, իսկ առաջիկա ուղին բացում է ${future}-ը: ` +
        perCard.join(" "),
      advice: perCard[1],
    };
  }
  if (locale === "en") {
    return {
      headline: `In the light of ${present}`,
      cards: perCard,
      reading:
        `Three cards speak to your question. ${past} stands at the root, ${present} defines the present, and ${future} opens the path ahead. ` +
        perCard.join(" "),
      advice: perCard[1],
    };
  }
  return {
    headline: `${present}ის შუქზე`,
    cards: perCard,
    reading:
      `შენს კითხვას სამი კარტი პასუხობს. ფესვში ${past} დგას, აწმყოს ${present} განსაზღვრავს, გზას კი ${future} ხსნის. ` +
      perCard.join(" "),
    advice: drawn[1].reversed
      ? drawn[1].card.reversedKa
      : drawn[1].card.uprightKa,
  };
}

/**
 * Perform a reading for `userId`'s `question`. Charges before generating (the
 * static fallback guarantees value for the charge), so a user can't farm free
 * draws by racing the AI call.
 */
export async function performReading(
  userId: string,
  question: string,
  locale: UserLocale = "ka",
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
      return {
        ok: false,
        error: "insufficient",
        cost: CREDIT_COST.tarot,
        balance,
      };
    }
    charged = CREDIT_COST.tarot;
  }

  // ── Draw + interpret ─────────────────────────────────────────────────────
  const drawn = drawSpread();
  const positions =
    locale === "am"
      ? (["անցյալ / արմատ", "ներկա / առանցք", "ապագա / ուղի"] as const)
      : locale === "en"
        ? SPREAD_POSITIONS_EN
        : SPREAD_POSITIONS_KA;
  const aiInput = {
    question: q,
    cards: drawn.map((d, i) => ({
      position: positions[i],
      name: cardCopy(d, locale).name,
      orientation:
        locale === "am"
          ? d.reversed
            ? "շրջված"
            : "ուղիղ"
          : locale === "en"
            ? d.reversed
              ? "reversed"
              : "upright"
            : d.reversed
              ? "შებრუნებული"
              : "პირდაპირი",
      meaning: cardCopy(d, locale).meaning,
    })),
    locale,
  };

  let ai: Awaited<ReturnType<typeof generateTarotReading>> = null;
  try {
    ai = await generateTarotReading(aiInput);
  } catch (err) {
    console.warn(
      "[tarot] AI reading failed, using fallback:",
      (err as Error).message,
    );
  }
  const composed = ai ?? fallbackReading(drawn, locale);

  const cards: TarotSpreadCard[] = drawn.map((d, i) => ({
    slug: d.card.slug,
    name: cardCopy(d, locale).name,
    glyph: d.card.glyph,
    reversed: d.reversed,
    position: positions[i],
    interpretation: composed.cards[i] ?? cardCopy(d, locale).meaning,
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
