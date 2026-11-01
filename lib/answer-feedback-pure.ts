import type { UserLocale } from "@/lib/i18n/locale";

/**
 * Pure validation + copy for per-answer feedback (👍/👎 + a short reason).
 * No DB imports, so unit tests load this without DATABASE_URL; persistence
 * lives in app/api/answer-feedback/route.ts.
 *
 * Targets identify ONE answer the signed-in user received:
 * - ask: the chart_chat_message id of the assistant turn
 * - tarot: the library_entry id of the reading
 * - tarot_followup: `${libraryEntryId}:${followupIndex}`
 */

export const ANSWER_FEEDBACK_SURFACES = [
  "ask",
  "tarot",
  "tarot_followup",
] as const;
export type AnswerFeedbackSurface = (typeof ANSWER_FEEDBACK_SURFACES)[number];

export const ANSWER_FEEDBACK_RATINGS = ["up", "down"] as const;
export type AnswerFeedbackRating = (typeof ANSWER_FEEDBACK_RATINGS)[number];

export const ANSWER_FEEDBACK_REASONS = [
  "no_answer",
  "incorrect",
  "unclear",
  "cut_off",
] as const;
export type AnswerFeedbackReason = (typeof ANSWER_FEEDBACK_REASONS)[number];

export const ANSWER_FEEDBACK_REASON_LABELS: Record<
  AnswerFeedbackReason,
  Record<UserLocale, string>
> = {
  no_answer: {
    ka: "კითხვას არ პასუხობს",
    en: "Doesn't answer my question",
  },
  incorrect: { ka: "არასწორია", en: "Incorrect" },
  unclear: { ka: "ბუნდოვანია", en: "Unclear" },
  cut_off: { ka: "შეწყდა", en: "Cut off" },
};

export type NormalizedAnswerFeedback = {
  surface: AnswerFeedbackSurface;
  targetKey: string;
  rating: AnswerFeedbackRating;
  /** Only meaningful for a down vote; an up vote always stores null. */
  reason: AnswerFeedbackReason | null;
};

const TARGET_KEY_MAX = 80;
/** uuid-ish ids plus the `id:index` follow-up form; nothing else is a target. */
const TARGET_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*(?::\d{1,4})?$/;

export function normalizeAnswerFeedback(
  input: unknown,
): NormalizedAnswerFeedback | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;

  if (
    typeof r.surface !== "string" ||
    !(ANSWER_FEEDBACK_SURFACES as readonly string[]).includes(r.surface)
  ) {
    return null;
  }
  if (
    typeof r.rating !== "string" ||
    !(ANSWER_FEEDBACK_RATINGS as readonly string[]).includes(r.rating)
  ) {
    return null;
  }
  if (typeof r.targetKey !== "string") return null;
  const targetKey = r.targetKey.trim();
  if (
    targetKey.length === 0 ||
    targetKey.length > TARGET_KEY_MAX ||
    !TARGET_KEY_RE.test(targetKey)
  ) {
    return null;
  }

  const rating = r.rating as AnswerFeedbackRating;
  let reason: AnswerFeedbackReason | null = null;
  if (r.reason !== undefined && r.reason !== null) {
    if (
      typeof r.reason !== "string" ||
      !(ANSWER_FEEDBACK_REASONS as readonly string[]).includes(r.reason)
    ) {
      return null;
    }
    reason = r.reason as AnswerFeedbackReason;
  }
  // A reason explains a down vote only; changing to 👍 clears it.
  if (rating === "up") reason = null;

  return {
    surface: r.surface as AnswerFeedbackSurface,
    targetKey,
    rating,
    reason,
  };
}

/** Split a `tarot_followup` target into its library entry + follow-up index. */
export function parseTarotFollowupTarget(
  targetKey: string,
): { libraryId: string; index: number } | null {
  const match = /^([A-Za-z0-9][A-Za-z0-9_-]*):(\d{1,4})$/.exec(
    targetKey.trim(),
  );
  if (!match) return null;
  const index = Number(match[2]);
  if (!Number.isInteger(index) || index < 0) return null;
  return { libraryId: match[1]!, index };
}
