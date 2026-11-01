"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import {
  ANSWER_FEEDBACK_REASONS,
  ANSWER_FEEDBACK_REASON_LABELS,
  type AnswerFeedbackRating,
  type AnswerFeedbackReason,
  type AnswerFeedbackSurface,
} from "@/lib/answer-feedback-pure";
import type { UserLocale } from "@/lib/i18n/locale";

const STORAGE_PREFIX = "vivida_answer_feedback_v1:";

type StoredVote = {
  rating: AnswerFeedbackRating;
  reason: AnswerFeedbackReason | null;
};

function readStoredVote(
  surface: AnswerFeedbackSurface,
  targetKey: string,
): StoredVote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${STORAGE_PREFIX}${surface}:${targetKey}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredVote>;
    if (parsed.rating !== "up" && parsed.rating !== "down") return null;
    return {
      rating: parsed.rating,
      reason:
        parsed.rating === "down" &&
        (ANSWER_FEEDBACK_REASONS as readonly string[]).includes(
          parsed.reason ?? "",
        )
          ? (parsed.reason as AnswerFeedbackReason)
          : null,
    };
  } catch {
    return null;
  }
}

/**
 * 👍/👎 + one short reason under a single AI answer. The vote persists to
 * /api/answer-feedback (one row per user+surface+target, re-voting updates
 * it) and mirrors to localStorage so the choice survives a reload on this
 * device. No answer text ever leaves the page with the vote.
 */
export function AnswerFeedback({
  surface,
  targetKey,
  locale = "ka",
}: {
  surface: AnswerFeedbackSurface;
  targetKey: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [stored] = useState(() => readStoredVote(surface, targetKey));
  const [rating, setRating] = useState<AnswerFeedbackRating | null>(
    stored?.rating ?? null,
  );
  const [reason, setReason] = useState<AnswerFeedbackReason | null>(
    stored?.reason ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function vote(
    nextRating: AnswerFeedbackRating,
    nextReason: AnswerFeedbackReason | null,
  ) {
    setRating(nextRating);
    setReason(nextReason);
    setFailed(false);
    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${surface}:${targetKey}`,
        JSON.stringify({ rating: nextRating, reason: nextReason }),
      );
    } catch {
      /* private mode, the server copy still lands */
    }
    setSaving(true);
    try {
      const res = await fetch("/api/answer-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surface,
          targetKey,
          rating: nextRating,
          reason: nextReason,
        }),
      });
      if (!res.ok) throw new Error("feedback failed");
      trackEvent(ANALYTICS_EVENT.answerFeedback, {
        ...productEventBase(
          surface === "ask" ? "ai_chat" : "tarot",
          surface,
          locale,
        ),
        rating: nextRating,
        reason: nextReason ?? undefined,
      });
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  const thumbClass = (active: boolean) =>
    `grid size-7 place-items-center rounded-sm border transition-colors disabled:opacity-50 ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    }`;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">
          {en ? "Was this answer helpful?" : "პასუხი სასარგებლო იყო?"}
        </span>
        <button
          type="button"
          aria-label={en ? "Helpful" : "სასარგებლო"}
          aria-pressed={rating === "up"}
          disabled={saving}
          onClick={() => void vote("up", null)}
          className={thumbClass(rating === "up")}
        >
          <ThumbsUp className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={en ? "Not helpful" : "არასასარგებლო"}
          aria-pressed={rating === "down"}
          disabled={saving}
          onClick={() => void vote("down", reason)}
          className={thumbClass(rating === "down")}
        >
          <ThumbsDown className="size-3.5" />
        </button>
        {(rating === "up" || (rating === "down" && reason)) && !failed && (
          <span role="status" className="text-xs text-muted-foreground">
            {en ? "Thanks for your feedback." : "მადლობა გამოხმაურებისთვის."}
          </span>
        )}
      </div>

      {rating === "down" && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            {en ? "What went wrong?" : "რა არ იყო სწორი?"}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ANSWER_FEEDBACK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                disabled={saving}
                onClick={() => void vote("down", r)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
                  reason === r
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {ANSWER_FEEDBACK_REASON_LABELS[r][locale]}
              </button>
            ))}
          </div>
        </div>
      )}

      {failed && (
        <p role="status" className="mt-1.5 text-xs text-destructive">
          {en
            ? "Your feedback could not be sent. Please try again."
            : "შეფასების გაგზავნა ვერ მოხერხდა. სცადე ხელახლა."}
        </p>
      )}
    </div>
  );
}
