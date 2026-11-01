import { describe, expect, it } from "vitest";

import {
  ANSWER_FEEDBACK_REASONS,
  ANSWER_FEEDBACK_REASON_LABELS,
  normalizeAnswerFeedback,
  parseTarotFollowupTarget,
} from "@/lib/answer-feedback-pure";

const ASK_ID = "7c9b2f1e-4a5d-4e8f-9a0b-1c2d3e4f5a6b";

describe("normalizeAnswerFeedback", () => {
  it("accepts an up vote and clears any reason", () => {
    expect(
      normalizeAnswerFeedback({
        surface: "ask",
        targetKey: ASK_ID,
        rating: "up",
        reason: "unclear",
      }),
    ).toEqual({
      surface: "ask",
      targetKey: ASK_ID,
      rating: "up",
      reason: null,
    });
  });

  it("accepts a down vote with or without a reason", () => {
    for (const reason of ANSWER_FEEDBACK_REASONS) {
      expect(
        normalizeAnswerFeedback({
          surface: "tarot",
          targetKey: ASK_ID,
          rating: "down",
          reason,
        })?.reason,
      ).toBe(reason);
    }
    expect(
      normalizeAnswerFeedback({
        surface: "tarot_followup",
        targetKey: `${ASK_ID}:2`,
        rating: "down",
      }),
    ).toEqual({
      surface: "tarot_followup",
      targetKey: `${ASK_ID}:2`,
      rating: "down",
      reason: null,
    });
  });

  it("rejects unknown surfaces, ratings, reasons and malformed targets", () => {
    const base = { surface: "ask", targetKey: ASK_ID, rating: "up" };
    expect(normalizeAnswerFeedback(null)).toBeNull();
    expect(normalizeAnswerFeedback({ ...base, surface: "dream" })).toBeNull();
    expect(normalizeAnswerFeedback({ ...base, rating: "meh" })).toBeNull();
    expect(
      normalizeAnswerFeedback({ ...base, rating: "down", reason: "rude" }),
    ).toBeNull();
    expect(normalizeAnswerFeedback({ ...base, targetKey: "" })).toBeNull();
    expect(
      normalizeAnswerFeedback({ ...base, targetKey: "has spaces" }),
    ).toBeNull();
    expect(normalizeAnswerFeedback({ ...base, targetKey: "a/b" })).toBeNull();
    expect(
      normalizeAnswerFeedback({ ...base, targetKey: "x".repeat(81) }),
    ).toBeNull();
  });

  it("carries the four KA reason labels verbatim", () => {
    expect(
      ANSWER_FEEDBACK_REASONS.map((r) => ANSWER_FEEDBACK_REASON_LABELS[r].ka),
    ).toEqual(["კითხვას არ პასუხობს", "არასწორია", "ბუნდოვანია", "შეწყდა"]);
  });
});

describe("parseTarotFollowupTarget", () => {
  it("splits library id and follow-up index", () => {
    expect(parseTarotFollowupTarget(`${ASK_ID}:0`)).toEqual({
      libraryId: ASK_ID,
      index: 0,
    });
    expect(parseTarotFollowupTarget(`${ASK_ID}:12`)).toEqual({
      libraryId: ASK_ID,
      index: 12,
    });
  });

  it("rejects non follow-up targets", () => {
    expect(parseTarotFollowupTarget(ASK_ID)).toBeNull();
    expect(parseTarotFollowupTarget(`${ASK_ID}:x`)).toBeNull();
    expect(parseTarotFollowupTarget(":1")).toBeNull();
  });
});
