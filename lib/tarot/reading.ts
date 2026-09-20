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
  FULL_DECK_KA,
  englishCardBySlug,
  tarotImageUrl,
  type DeckCard,
} from "@/lib/tarot/deck-full";
import { tarotSpreadById, type TarotSpreadId } from "@/lib/tarot/spreads";
import {
  normalizeTarotFollowupSuggestions,
  tarotFollowupFallback,
} from "@/lib/tarot/followup-suggestions";
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
  /** Resolved illustration URL (bundle for majors, R2 for minors). */
  image: string;
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
  /** Contextual questions generated from this reading. */
  followupSuggestions: string[];
  charged: number;
  free: boolean;
  balance: number;
  libraryId?: string;
  /** True when the AI call failed and the static fallback was used. */
  degraded: boolean;
  /** Follow-up questions on the same spread, oldest first. */
  followups: TarotFollowupEntry[];
  /** Which spread framed the draw. */
  spreadId: TarotSpreadId;
  /** The compared options, only for the choice spread. */
  spreadOptions?: { a: string; b: string };
};

export type TarotResult =
  | { ok: true; reading: TarotReading }
  | { ok: false; error: "insufficient"; cost: number; balance: number }
  | { ok: false; error: "bad_request" };

/** Draw 3 distinct cards from the full 78-card deck, each independently upright or reversed. */
function drawSpread(): Array<{ card: DeckCard; reversed: boolean }> {
  const pool = [...FULL_DECK_KA];
  const out: Array<{ card: DeckCard; reversed: boolean }> = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(idx, 1);
    out.push({ card: card!, reversed: Math.random() < 0.35 });
  }
  return out;
}

/** Compose a readable fallback answer purely from the static card meanings. */
function cardCopy(
  drawn: { card: DeckCard; reversed: boolean },
  locale: UserLocale,
) {
  if (locale === "en") {
    return englishCardBySlug(drawn.card.slug, drawn.reversed);
  }
  return {
    name: drawn.card.nameKa,
    meaning: drawn.reversed ? drawn.card.reversedKa : drawn.card.uprightKa,
  };
}

function fallbackReading(
  drawn: Array<{ card: DeckCard; reversed: boolean }>,
  locale: UserLocale,
): {
  headline: string;
  cards: string[];
  reading: string;
  advice: string;
  followupSuggestions: string[];
} {
  const copy = drawn.map((card) => cardCopy(card, locale));
  const perCard = copy.map((card) => card.meaning);
  const [past, present, future] = copy.map((card) => card.name);
  if (locale === "en") {
    return {
      headline: `In the light of ${present}`,
      cards: perCard,
      reading:
        `Three cards speak to your question. ${past} stands at the root, ${present} defines the present, and ${future} opens the path ahead. ` +
        perCard.join(" "),
      advice: perCard[1],
      followupSuggestions: tarotFollowupFallback(locale),
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
    followupSuggestions: tarotFollowupFallback(locale),
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
  spreadId?: unknown,
  spreadOptions?: unknown,
): Promise<TarotResult> {
  const q = question.trim().slice(0, 300);
  if (q.length < 3) return { ok: false, error: "bad_request" };

  // Thematic spreads share the 3-card engine; only the positions and the AI
  // framing differ. Unknown ids are rejected before any charging.
  const spread =
    spreadId === undefined
      ? tarotSpreadById("situation")
      : tarotSpreadById(spreadId);
  if (!spread) return { ok: false, error: "bad_request" };

  let options: { a: string; b: string } | undefined;
  if (
    spread.id === "choice" &&
    typeof spreadOptions === "object" &&
    spreadOptions !== null
  ) {
    const { a, b } = spreadOptions as { a?: unknown; b?: unknown };
    const optionA = typeof a === "string" ? a.trim().slice(0, 100) : "";
    const optionB = typeof b === "string" ? b.trim().slice(0, 100) : "";
    if (optionA && optionB) options = { a: optionA, b: optionB };
  }

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
      const replayedCards = existing.content.cards.map((card) => ({
        ...card,
        image: card.image ?? tarotImageUrl(card.slug),
      }));
      const replayedSpread =
        tarotSpreadById(existing.content.spreadId) ??
        tarotSpreadById("situation")!;
      return {
        ok: true,
        reading: {
          headline: existing.title,
          cards: replayedCards,
          reading: existing.content.reading,
          advice: existing.content.advice,
          followupSuggestions: normalizeTarotFollowupSuggestions(
            existing.content.followupSuggestions,
            locale,
            followups.map((item) => item.question),
          ),
          charged: existing.content.charged ?? 0,
          free: existing.content.free ?? false,
          balance,
          libraryId: existing.id,
          degraded: existing.content.degraded ?? false,
          followups,
          spreadId: replayedSpread.id,
          spreadOptions: existing.content.spreadOptions,
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
  const positions = spread.positions[locale];
  const aiInput = {
    question: q,
    cards: drawn.map((d, i) => ({
      position: positions[i],
      name: cardCopy(d, locale).name,
      orientation:
        locale === "en"
          ? d.reversed
            ? "reversed"
            : "upright"
          : d.reversed
            ? "შებრუნებული"
            : "პირდაპირი",
      meaning: cardCopy(d, locale).meaning,
    })),
    spreadLogic:
      spread.id === "situation" ? undefined : spread.readingLogic[locale],
    spreadOptions: options,
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
  const followupSuggestions = normalizeTarotFollowupSuggestions(
    composed.followupSuggestions,
    locale,
    [q],
  );

  const cards: TarotSpreadCard[] = drawn.map((d, i) => ({
    slug: d.card.slug,
    name: cardCopy(d, locale).name,
    glyph: d.card.glyph,
    image: tarotImageUrl(d.card.slug),
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
      followupSuggestions,
      charged,
      free,
      degraded,
      followups: [],
      spreadId: spread.id,
      spreadOptions: options,
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
      followupSuggestions,
      charged,
      free,
      balance,
      libraryId: libraryEntry?.id,
      degraded,
      followups: [],
      spreadId: spread.id,
      spreadOptions: options,
    },
  };
}
