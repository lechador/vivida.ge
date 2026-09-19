import "server-only";

import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  countUnlocks,
  getBalance,
  getUnlockAmount,
  recordFreeUse,
  spendCredits,
  spendOnce,
} from "@/lib/credits";
import { generateTarotReading } from "@/lib/openrouter";
import {
  SPREAD_POSITIONS_KA,
  TAROT_CARDS,
  type DrawnCard,
} from "@/lib/tarot/deck";
import { SPREAD_POSITIONS_EN, TAROT_EN_BY_SLUG } from "@/lib/tarot/deck-en";
import { tarotCardBySlugAm } from "@/lib/tarot/deck-am";
import type { TarotFollowupEntry } from "@/lib/tarot/followup";
import type { UserLocale } from "@/lib/i18n/locale";
import { archiveLibraryEntry, getLibraryEntryBySource } from "@/lib/library";
import { isPremiumUser } from "@/lib/premium";

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
  libraryId?: string;
  /** True when the AI call failed and the static fallback was used. */
  degraded: boolean;
  /** Follow-up questions on the same spread, oldest first. */
  followups: TarotFollowupEntry[];
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
  requestId?: string,
): Promise<TarotResult> {
  const q = question.trim().slice(0, 300);
  if (q.length < 3) return { ok: false, error: "bad_request" };

  // A stable client request id makes retries safe: a completed reading is
  // replayed, and a crashed attempt resumes without charging twice.
  const requestKey = requestId && requestId.length > 0 ? requestId : undefined;
  const unlockRef = requestKey ? `tarot:${requestKey}` : undefined;
  if (requestKey && unlockRef) {
    const existing = await getLibraryEntryBySource(userId, "tarot", requestKey);
    if (existing && existing.content.type === "tarot") {
      const balance = await getBalance(userId);
      const followups: TarotFollowupEntry[] = (
        existing.content.followups ?? []
      ).map((item) => ({
        question: item.question,
        answer: item.answer,
        degraded: item.degraded ?? false,
        charged: item.charged ?? 0,
        free: item.free ?? false,
      }));
      return {
        ok: true,
        reading: {
          headline: existing.title,
          cards: existing.content.cards,
          reading: existing.content.reading,
          advice: existing.content.advice,
          charged: existing.content.charged ?? 0,
          free: existing.content.free ?? false,
          balance,
          libraryId: existing.id,
          degraded: existing.content.degraded ?? false,
          followups,
        },
      };
    }
  }

  // ── Gate: first reading free, then CREDIT_COST.tarot each ────────────────
  let charged = 0;
  let free = false;
  if (unlockRef) {
    if (await isPremiumUser(userId)) {
      charged = CREDIT_COST.tarot;
    } else {
      const prior = await getUnlockAmount(userId, "spend_tarot", unlockRef);
      if (prior !== null) {
        free = prior === 0;
        charged = prior < 0 ? -prior : 0;
      } else {
        const used = await countUnlocks(userId, "spend_tarot");
        if (used < FREE_ALLOWANCE.tarot) {
          await spendOnce(userId, 0, "spend_tarot", unlockRef);
          free = true;
        } else {
          const outcome = await spendOnce(
            userId,
            CREDIT_COST.tarot,
            "spend_tarot",
            unlockRef,
          );
          if (outcome === "insufficient") {
            const balance = await getBalance(userId);
            return {
              ok: false,
              error: "insufficient",
              cost: CREDIT_COST.tarot,
              balance,
            };
          }
          charged = outcome === "unlocked" ? CREDIT_COST.tarot : 0;
        }
      }
    }
  } else {
    const used = await countUnlocks(userId, "spend_tarot");
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
  let degraded = false;
  try {
    ai = await generateTarotReading(aiInput);
    if (!ai) degraded = true;
  } catch (err) {
    degraded = true;
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
  const libraryEntry = await archiveLibraryEntry({
    userId,
    kind: "tarot",
    sourceId: requestKey ?? crypto.randomUUID(),
    title: composed.headline,
    summary: q,
    content: {
      type: "tarot",
      question: q,
      cards,
      reading: composed.reading,
      advice: composed.advice,
      charged,
      free,
      degraded,
      followups: [],
    },
    language: locale,
  }).catch((error) => {
    console.warn("[library] tarot archive failed:", error);
    return null;
  });
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
      libraryId: libraryEntry?.id,
      degraded,
      followups: [],
    },
  };
}
