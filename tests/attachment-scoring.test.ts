import { describe, expect, it } from "vitest";

import {
  ATTACHMENT_QUESTIONS,
  type AttachmentQuestion,
} from "@/lib/attachment/questions";
import {
  attachmentStyleFor,
  calculateAttachment,
  scoreAttachmentItem,
} from "@/lib/attachment/scoring";

const straight = { reverse: false } as Pick<AttachmentQuestion, "reverse">;
const reversed = { reverse: true } as Pick<AttachmentQuestion, "reverse">;

function answersFor(value: number): Record<number, number> {
  return Object.fromEntries(ATTACHMENT_QUESTIONS.map((q) => [q.id, value]));
}

describe("attachment scoring", () => {
  it("has 24 questions, 12 per axis", () => {
    expect(ATTACHMENT_QUESTIONS).toHaveLength(24);
    expect(
      ATTACHMENT_QUESTIONS.filter((q) => q.axis === "anxiety"),
    ).toHaveLength(12);
    expect(
      ATTACHMENT_QUESTIONS.filter((q) => q.axis === "avoidance"),
    ).toHaveLength(12);
  });

  it("each axis has reverse-keyed items", () => {
    for (const axis of ["anxiety", "avoidance"] as const) {
      const items = ATTACHMENT_QUESTIONS.filter((q) => q.axis === axis);
      expect(items.some((q) => q.reverse)).toBe(true);
      expect(items.some((q) => !q.reverse)).toBe(true);
    }
  });

  it("scores straight and reverse items", () => {
    expect(scoreAttachmentItem(straight, 5)).toBe(5);
    expect(scoreAttachmentItem(straight, 1)).toBe(1);
    expect(scoreAttachmentItem(reversed, 5)).toBe(1);
    expect(scoreAttachmentItem(reversed, 1)).toBe(5);
  });

  it("rejects out-of-range answers", () => {
    expect(() => scoreAttachmentItem(straight, 0)).toThrow(RangeError);
    expect(() => scoreAttachmentItem(straight, 6)).toThrow(RangeError);
  });

  it("maps quadrants to the four styles", () => {
    expect(attachmentStyleFor(20, 20)).toBe("secure");
    expect(attachmentStyleFor(80, 20)).toBe("anxious");
    expect(attachmentStyleFor(20, 80)).toBe("avoidant");
    expect(attachmentStyleFor(80, 80)).toBe("fearful");
  });

  it("all-neutral answers land near the middle with lean", () => {
    const result = calculateAttachment(answersFor(3));
    expect(result.anxiety).toBe(50);
    expect(result.avoidance).toBe(50);
    expect(result.style).toBe("fearful");
    expect(result.lean).toBe(true);
  });

  it("extreme secure pattern scores low on both axes", () => {
    // Minimal anxiety/avoidance: 1 on straight items, 5 on reversed
    const answers: Record<number, number> = {};
    for (const q of ATTACHMENT_QUESTIONS) {
      answers[q.id] = q.reverse ? 5 : 1;
    }
    const result = calculateAttachment(answers);
    expect(result.anxiety).toBe(0);
    expect(result.avoidance).toBe(0);
    expect(result.style).toBe("secure");
    expect(result.lean).toBe(false);
  });

  it("extreme insecure pattern scores high on both axes", () => {
    const answers: Record<number, number> = {};
    for (const q of ATTACHMENT_QUESTIONS) {
      answers[q.id] = q.reverse ? 1 : 5;
    }
    const result = calculateAttachment(answers);
    expect(result.anxiety).toBe(100);
    expect(result.avoidance).toBe(100);
    expect(result.style).toBe("fearful");
  });

  it("throws on missing answers", () => {
    expect(() => calculateAttachment({})).toThrow(RangeError);
  });

  it("returns full Georgian content for every style", () => {
    const result = calculateAttachment(answersFor(3));
    expect(result.labelKa.length).toBeGreaterThan(3);
    expect(result.summaryKa.length).toBeGreaterThan(50);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.growth.length).toBeGreaterThan(0);
    expect(result.partnerTipsKa.length).toBeGreaterThan(0);
    expect(result.nextStepsKa.length).toBeGreaterThan(0);
  });
});
