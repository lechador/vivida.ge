import { describe, expect, it } from "vitest";

import { MBTI_QUESTIONS_EN } from "@/lib/mbti-questions";
import { EQ_QUESTIONS_EN } from "@/lib/eq/questions";
import { BIG5_QUESTIONS_EN } from "@/lib/big-five/questions";
import { IQ_ITEMS } from "@/lib/iq/items";
import {
  BIG5_QUESTIONS_AM,
  EQ_QUESTIONS_AM,
  IQ_TEXT_AM,
  MBTI_QUESTIONS_AM,
} from "@/lib/tests-content-am";

const ARMENIAN = /[Ա-֏]/u;
const GEORGIAN = /[Ⴀ-ჿ]/u;

describe("Armenian assessment banks", () => {
  it.each([
    ["MBTI", MBTI_QUESTIONS_EN, MBTI_QUESTIONS_AM],
    ["EQ", EQ_QUESTIONS_EN, EQ_QUESTIONS_AM],
    ["Big Five", BIG5_QUESTIONS_EN, BIG5_QUESTIONS_AM],
  ])("preserves %s item identity and scoring fields", (_name, source, translated) => {
    expect(translated).toHaveLength(source.length);
    translated.forEach((question, index) => {
      expect(question.id).toBe(source[index]!.id);
      expect(question.textEn).toMatch(ARMENIAN);
      expect(question.textEn).not.toMatch(GEORGIAN);
    });
  });

  it("covers every verbal IQ item without changing option counts", () => {
    const verbal = IQ_ITEMS.filter((item) => item.stem.type === "logic");
    expect(IQ_TEXT_AM.size).toBe(verbal.length);
    for (const item of verbal) {
      const translated = IQ_TEXT_AM.get(item.id)!;
      expect(translated.text).toMatch(ARMENIAN);
      expect(translated.text).not.toMatch(GEORGIAN);
      expect(translated.options).toHaveLength(item.options.length);
    }
  });
});
