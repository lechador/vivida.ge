import "server-only";

import { CREDIT_COST, getBalance, spendOnce } from "@/lib/credits";
import { generateTarotFollowup } from "@/lib/openrouter";
import { archiveLibraryEntry, getLibraryEntry } from "@/lib/library";
import { isPremiumUser } from "@/lib/premium";
import type { UserLocale } from "@/lib/i18n/locale";

/**
 * A follow-up question on an already-drawn spread. The first follow-up per
 * reading is free; each next one costs CREDIT_COST.tarotFollowup. No new
 * cards are drawn — the answer stays inside the original spread.
 */

export type TarotFollowupEntry = {
  question: string;
  answer: string;
  degraded: boolean;
  charged: number;
  free: boolean;
};

export type FollowupResult =
  | {
      ok: true;
      followup: TarotFollowupEntry & {
        balance: number;
        libraryId: string;
        followups: TarotFollowupEntry[];
      };
    }
  | { ok: false; error: "bad_request" | "not_found" }
  | { ok: false; error: "insufficient"; cost: number; balance: number };

function orientationFor(reversed: boolean, locale: UserLocale): string {
  if (locale === "am") return reversed ? "շրջված" : "ուղիղ";
  if (locale === "en") return reversed ? "reversed" : "upright";
  return reversed ? "შებრუნებული" : "პირდაპირი";
}

/** Static answer used when the AI call fails — a paid follow-up never returns empty. */
function fallbackAnswer(interpretations: string[], locale: UserLocale): string {
  const joined = interpretations.join(" ");
  if (locale === "am") {
    return (
      `AI մեկնաբանությունը ժամանակավորապես անհասանելի է: Ձեր լրացուցիչ հարցի ` +
      `առնչությամբ քարտերը նշում են. ${joined}`
    );
  }
  if (locale === "en") {
    return (
      `The AI interpretation is temporarily unavailable. On your follow-up ` +
      `question, the cards point to this: ${joined}`
    );
  }
  return (
    `AI განმარტება დროებით მიუწვდომელია. შენს დამატებით კითხვაზე კარტები ` +
    `ამას მიუთითებენ: ${joined}`
  );
}

export async function performFollowup(
  userId: string,
  libraryId: string,
  followupQuestion: string,
  locale: UserLocale = "ka",
): Promise<FollowupResult> {
  const q = followupQuestion.trim().slice(0, 300);
  if (!libraryId || q.length < 3) return { ok: false, error: "bad_request" };

  // Ownership is enforced by the user-scoped lookup: another user's id never
  // resolves here.
  const entry = await getLibraryEntry(userId, libraryId);
  if (!entry || entry.kind !== "tarot" || entry.content.type !== "tarot") {
    return { ok: false, error: "not_found" };
  }
  const content = entry.content;
  const previous: TarotFollowupEntry[] = (content.followups ?? []).map(
    (item) => ({
      question: item.question,
      answer: item.answer,
      degraded: item.degraded ?? false,
      charged: item.charged ?? 0,
      free: item.free ?? false,
    }),
  );
  const first = previous.length === 0;

  // ── Gate: first follow-up free, then CREDIT_COST.tarotFollowup each ──────
  const cost = CREDIT_COST.tarotFollowup;
  const ref = `tarot-followup:${entry.sourceId}:${previous.length + 1}`;
  let charged = 0;
  if (await isPremiumUser(userId)) {
    charged = first ? 0 : cost;
  } else if (first) {
    await spendOnce(userId, 0, "spend_tarot_followup", ref);
  } else {
    const outcome = await spendOnce(userId, cost, "spend_tarot_followup", ref);
    if (outcome === "insufficient") {
      const balance = await getBalance(userId);
      return { ok: false, error: "insufficient", cost, balance };
    }
    charged = outcome === "unlocked" ? cost : 0;
  }

  const cards = content.cards.map((card) => ({
    position: card.position,
    name: card.name,
    orientation: orientationFor(card.reversed, locale),
    meaning: card.interpretation,
  }));

  let answer: string | null = null;
  let degraded = false;
  try {
    const ai = await generateTarotFollowup({
      question: content.question,
      cards,
      reading: content.reading,
      advice: content.advice,
      followupQuestion: q,
      locale,
    });
    answer = ai?.answer ?? null;
    if (!answer) degraded = true;
  } catch (err) {
    degraded = true;
    console.warn(
      "[tarot] AI follow-up failed, using fallback:",
      (err as Error).message,
    );
  }
  answer ??= fallbackAnswer(
    content.cards.map((card) => card.interpretation),
    locale,
  );

  const next: TarotFollowupEntry = {
    question: q,
    answer,
    degraded,
    charged,
    free: first,
  };
  const followups = [...previous, next];

  await archiveLibraryEntry({
    userId,
    kind: "tarot",
    sourceId: entry.sourceId,
    title: entry.title,
    summary: entry.summary,
    content: { ...content, followups },
    href: entry.href,
    language: entry.language,
    occurredAt: entry.occurredAt,
  }).catch((error) => {
    console.warn("[library] tarot follow-up archive failed:", error);
  });

  const balance = await getBalance(userId);
  return {
    ok: true,
    followup: { ...next, balance, libraryId: entry.id, followups },
  };
}
