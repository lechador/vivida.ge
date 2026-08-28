import { describe, expect, it } from "vitest";

import {
  DOMAIN_LABELS_EN,
  IQ_ITEMS,
  STEM_PROMPT_EN,
} from "@/lib/iq/items";
import { TESTS } from "@/lib/tests-catalog";
import {
  EQ_DOMAINS,
  EQ_LIKERT,
  EQ_QUESTIONS_EN,
} from "@/lib/eq/questions";
import {
  EQ_BAND_META,
  EQ_DOMAIN_INTERP_EN,
  EQ_DOMAIN_TIP_EN,
} from "@/lib/eq/scoring";
import { BIG5_LIKERT, BIG5_QUESTIONS_EN, BIG5_TRAITS } from "@/lib/big-five/questions";
import { BIG5_LEVEL_LABEL_EN, BIG5_TRAIT_INTERP_EN } from "@/lib/big-five/scoring";
import {
  AXIS_LABEL_EN,
  MBTI_ARCHETYPE_EN,
  MBTI_LIKERT,
  MBTI_QUESTIONS_EN,
} from "@/lib/mbti-questions";
import { MBTI_CONTENT_EN } from "@/lib/mbti-content-en";
import { TS_QUESTIONS_EN, TS_SIGN_BLURB_EN } from "@/lib/true-sign/quiz";
import { FAMOUS_ZODIAC_QUESTIONS, ZODIAC_SIGNS, professionEn } from "@/lib/zodiac-famous-quiz";

const GEORGIAN = /[ა-ჰ]/;

describe("English test content", () => {
  it("provides complete English IQ prompts and text answers", () => {
    const logicItems = IQ_ITEMS.filter((item) => item.stem.type === "logic");
    expect(logicItems.length).toBeGreaterThan(0);

    for (const item of logicItems) {
      if (item.stem.type !== "logic") continue;
      expect(item.stem.textEn).not.toMatch(GEORGIAN);
      expect(item.stem.textEn.length).toBeGreaterThan(12);
      for (const option of item.options) {
        if (option.kind !== "text") continue;
        expect(option.textEn).toBeTruthy();
        expect(option.textEn).not.toMatch(GEORGIAN);
      }
    }
  });

  it("keeps English IQ labels free of Georgian copy", () => {
    expect(JSON.stringify(DOMAIN_LABELS_EN)).not.toMatch(GEORGIAN);
    expect(JSON.stringify(STEM_PROMPT_EN)).not.toMatch(GEORGIAN);
  });

  it("provides English catalog copy for every test", () => {
    expect(TESTS.length).toBeGreaterThan(0);
    for (const test of TESTS) {
      const copy = [test.titleEn, test.taglineEn, test.descEn, test.metaEn];
      expect(copy.every(Boolean)).toBe(true);
      expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
    }
  });

  it("provides all forty EQ statements in English without changing scoring keys", () => {
    expect(EQ_QUESTIONS_EN).toHaveLength(40);
    expect(EQ_QUESTIONS_EN.map((question) => question.id)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1),
    );
    for (const question of EQ_QUESTIONS_EN) {
      expect(question.textEn).toBeTruthy();
      expect(question.textEn).not.toMatch(GEORGIAN);
    }
  });

  it("provides complete English EQ result copy", () => {
    const copy = {
      domains: EQ_DOMAINS.map(({ nameEn, taglineEn }) => ({ nameEn, taglineEn })),
      likert: EQ_LIKERT.map(({ labelEn }) => labelEn),
      bands: Object.values(EQ_BAND_META).map(({ labelEn, summaryEn }) => ({ labelEn, summaryEn })),
      interpretations: EQ_DOMAIN_INTERP_EN,
      tips: EQ_DOMAIN_TIP_EN,
    };
    expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
  });

  it("provides complete English Big Five assessment and result copy", () => {
    expect(BIG5_QUESTIONS_EN).toHaveLength(40);
    for (const question of BIG5_QUESTIONS_EN) {
      expect(question.textEn).toBeTruthy();
      expect(question.textEn).not.toMatch(GEORGIAN);
    }
    const copy = {
      traits: BIG5_TRAITS.map(({ nameEn, taglineEn }) => ({ nameEn, taglineEn })),
      scale: BIG5_LIKERT.map(({ labelEn }) => labelEn),
      levels: BIG5_LEVEL_LABEL_EN,
      interpretations: BIG5_TRAIT_INTERP_EN,
    };
    expect(JSON.stringify(copy)).not.toMatch(GEORGIAN);
  });

  it("provides all sixty Astro-MBTI statements and result labels in English", () => {
    expect(MBTI_QUESTIONS_EN).toHaveLength(60);
    expect(MBTI_QUESTIONS_EN.map((question) => question.id)).toEqual(
      Array.from({ length: 60 }, (_, index) => index + 1),
    );
    for (const question of MBTI_QUESTIONS_EN) {
      expect(question.textEn).toBeTruthy();
      expect(question.textEn).not.toMatch(GEORGIAN);
    }
    expect(Object.keys(MBTI_ARCHETYPE_EN)).toHaveLength(16);
    expect(JSON.stringify({
      axes: AXIS_LABEL_EN,
      archetypes: MBTI_ARCHETYPE_EN,
      scale: MBTI_LIKERT.map(({ labelEn }) => labelEn),
    })).not.toMatch(GEORGIAN);
  });

  it("provides a complete English guide for all sixteen personality types", () => {
    expect(Object.keys(MBTI_CONTENT_EN)).toHaveLength(16);
    for (const [type, profile] of Object.entries(MBTI_CONTENT_EN)) {
      expect(profile.summary).toHaveLength(2);
      expect(profile.strengths).toHaveLength(4);
      expect(profile.challenges).toHaveLength(4);
      expect(type).toMatch(/^[EI][NS][TF][JP]$/);
      expect(JSON.stringify(profile)).not.toMatch(GEORGIAN);
    }
  });

  it("provides complete English copy for both zodiac quizzes", () => {
    expect(TS_QUESTIONS_EN).toHaveLength(12);
    for (const question of TS_QUESTIONS_EN) {
      expect(question.textEn).toBeTruthy();
      expect(question.options.every((option) => Boolean(option.textEn))).toBe(true);
      expect(JSON.stringify({ text: question.textEn, options: question.options.map((option) => option.textEn) })).not.toMatch(GEORGIAN);
    }
    expect(JSON.stringify(TS_SIGN_BLURB_EN)).not.toMatch(GEORGIAN);
    expect(ZODIAC_SIGNS).toHaveLength(12);
    expect(JSON.stringify(ZODIAC_SIGNS.map(({ nameEn }) => nameEn))).not.toMatch(GEORGIAN);
    expect(FAMOUS_ZODIAC_QUESTIONS).toHaveLength(20);
    expect(JSON.stringify(FAMOUS_ZODIAC_QUESTIONS.map((question) => professionEn(question)))).not.toMatch(GEORGIAN);
  });
});
