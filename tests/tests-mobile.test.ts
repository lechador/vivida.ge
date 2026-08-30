import { describe, expect, it, vi } from "vitest";

// The mobile tests core reads the DB only for "what has this user completed";
// question serving, adaptive selection and scoring are pure, so a bare stub is
// enough to import it.
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/mbti-submit-core", () => ({ submitMbtiFor: vi.fn() }));
vi.mock("@/lib/mbti-questions-db", async () => {
  const statics = await vi.importActual<typeof import("@/lib/mbti-questions")>(
    "@/lib/mbti-questions"
  );
  return { getMbtiQuestions: async () => statics.MBTI_QUESTIONS };
});
vi.mock("@/lib/r2", () => ({
  isR2Configured: () => false,
  objectExists: async () => false,
  publicUrlFor: (key: string) => `https://cdn.example/${key}`,
}));

import { IQ_ITEMS } from "@/lib/iq/items";
import { EQ_QUESTIONS } from "@/lib/eq/questions";
import { ROSENBERG_QUESTIONS } from "@/lib/rosenberg/questions";
import { TS_QUESTIONS } from "@/lib/true-sign/quiz";
import {
  MOBILE_TEST_SLUGS,
  isMobileTestSlug,
  mobileTestQuestions,
  nextIqItem,
  submitMobileTest,
} from "@/lib/tests-mobile";

/**
 * The app runs every test natively now, which only stays safe as long as the
 * *content and the scoring* stay on this side of the wire. These lock the two
 * properties that make that true: the IQ answer key never ships, and the app
 * receives an already-rendered result instead of the raw material to build one.
 */
describe("mobile tests API", () => {
  it("serves every catalogued slug", () => {
    expect(MOBILE_TEST_SLUGS).toHaveLength(7);
    expect(isMobileTestSlug("iq")).toBe(true);
    expect(isMobileTestSlug("nope")).toBe(false);
  });

  it("never puts the IQ answer key on the wire", async () => {
    const payload = await mobileTestQuestions("iq");
    expect(payload.format).toBe("adaptive");
    if (payload.format !== "adaptive") throw new Error("unreachable");

    // The item shape carries options but no `answer` index...
    expect(payload.first.options.length).toBeGreaterThan(1);
    expect(payload.first).not.toHaveProperty("answer");
    // ...and nothing anywhere in the serialized payload does either.
    expect(JSON.stringify(payload)).not.toContain('"answer"');
  });

  it("advances the adaptive IQ run server-side and stops at the fixed length", async () => {
    const first = (await mobileTestQuestions("iq")) as Extract<
      Awaited<ReturnType<typeof mobileTestQuestions>>,
      { format: "adaptive" }
    >;

    const answers: Record<string, number> = {};
    const seen = new Set<string>();
    let item = first.first;
    for (let i = 0; i < first.length; i++) {
      expect(seen.has(item.id)).toBe(false); // no item is administered twice
      seen.add(item.id);
      // Answer correctly, using the key that only this process can see.
      const key = IQ_ITEMS.find((it) => it.id === item.id)!;
      answers[item.id] = key.answer;
      const step = nextIqItem(answers);
      expect(step.index).toBe(i + 1);
      if (i + 1 < first.length) {
        expect(step.item).not.toBeNull();
        item = step.item!;
      } else {
        expect(step.item).toBeNull(); // the run is complete
      }
    }
    expect(seen.size).toBe(first.length);
  });

  it("hands a Likert runner its shared scale and every question", async () => {
    const payload = await mobileTestQuestions("eq");
    expect(payload.format).toBe("likert");
    if (payload.format !== "likert") throw new Error("unreachable");
    expect(payload.scale.map((o) => o.value)).toEqual([1, 2, 3, 4, 5]);
    expect(payload.questions).toHaveLength(EQ_QUESTIONS.length);
    expect(payload.questions[0].text).toBe(EQ_QUESTIONS[0].textKa);
  });

  it("scores the self-esteem scale without persisting anything", async () => {
    const answers = Object.fromEntries(
      ROSENBERG_QUESTIONS.map((q) => [q.id, 4])
    );
    const view = await submitMobileTest({
      slug: "self-esteem",
      userId: "user-1",
      attemptId: "attempt-0000001",
      answers,
    });
    expect(view.savedId).toBeNull();
    expect(view.visibilityKind).toBeNull();
    expect(view.gauge?.max).toBe(30);
    expect(view.bullets[0].items.length).toBeGreaterThan(0);
  });

  it("rejects a partially answered self-esteem scale", async () => {
    await expect(
      submitMobileTest({
        slug: "self-esteem",
        userId: "user-1",
        attemptId: "attempt-0000002",
        answers: { 1: 4 },
      })
    ).rejects.toMatchObject({ code: "incomplete_answers" });
  });

  it("resolves a true sign from option indexes", async () => {
    // Pick the first option everywhere; the result must still be a real sign.
    const answers = Object.fromEntries(TS_QUESTIONS.map((q) => [q.id, 0]));
    const view = await submitMobileTest({
      slug: "true-sign",
      userId: "user-1",
      attemptId: "attempt-0000003",
      answers,
    });
    expect(view.headline.label).not.toBe("");
    expect(view.sections[0].body.length).toBeGreaterThan(20);
  });

  it("grades the celebrity quiz against the server-side key", async () => {
    const round = await mobileTestQuestions("famous-zodiac");
    if (round.format !== "image-choice") throw new Error("unreachable");
    const answers = Object.fromEntries(
      round.questions.map((q, i) => [
        q.id,
        // Every other one deliberately wrong.
        i % 2 === 0 ? q.answer : q.options.find((o) => o.value !== q.answer)!.value,
      ])
    );
    const view = await submitMobileTest({
      slug: "famous-zodiac",
      userId: "user-1",
      attemptId: "attempt-0000004",
      answers,
    });
    const expected = Math.ceil(round.questions.length / 2);
    expect(view.headline.value).toBe(`${expected}/${round.questions.length}`);
    expect(view.review).toHaveLength(round.questions.length);
    expect(view.review.filter((r) => r.correct)).toHaveLength(expected);
  });

  it("rejects an empty submission rather than scoring a blank attempt", async () => {
    await expect(
      submitMobileTest({
        slug: "true-sign",
        userId: "user-1",
        attemptId: "attempt-0000005",
        answers: {},
      })
    ).rejects.toMatchObject({ code: "empty_answers" });
  });
});
