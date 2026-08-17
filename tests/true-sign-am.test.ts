import { describe, expect, it } from "vitest";

import { TS_QUESTIONS_EN, TS_SIGN_BLURB_EN } from "@/lib/true-sign/quiz";
import { TS_QUESTIONS_AM, TS_SIGN_BLURB_AM } from "@/lib/true-sign/quiz-am";

const ARMENIAN = /[Ա-֏]/u;
const GEORGIAN = /[Ⴀ-ჿ]/u;

describe("Armenian true-sign quiz", () => {
  it("preserves the English question and scoring shape", () => {
    expect(TS_QUESTIONS_AM).toHaveLength(TS_QUESTIONS_EN.length);
    TS_QUESTIONS_AM.forEach((question, index) => {
      const source = TS_QUESTIONS_EN[index]!;
      expect(question.id).toBe(source.id);
      expect(question.options).toHaveLength(source.options.length);
      question.options.forEach((option, optionIndex) => {
        expect(option.element).toBe(source.options[optionIndex]!.element);
        expect(option.modality).toBe(source.options[optionIndex]!.modality);
      });
    });
  });

  it("contains Armenian-facing text without Georgian leakage", () => {
    const content = JSON.stringify({ questions: TS_QUESTIONS_AM, blurbs: TS_SIGN_BLURB_AM });
    expect(content).toMatch(ARMENIAN);
    const facingText = JSON.stringify({
      questions: TS_QUESTIONS_AM.map((question) => ({
        text: question.textEn,
        options: question.options.map((option) => option.textEn),
      })),
      blurbs: TS_SIGN_BLURB_AM,
    });
    expect(facingText).not.toMatch(GEORGIAN);
    expect(Object.keys(TS_SIGN_BLURB_AM)).toEqual(Object.keys(TS_SIGN_BLURB_EN));
  });
});
