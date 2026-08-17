"use client";

import { useRouter } from "next/navigation";

import {
  LikertQuiz,
  type LikertSubmitResult,
} from "@/components/tests/likert-quiz";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import {
  BIG5_ANSWERS_STORAGE_KEY,
  BIG5_LIKERT,
  BIG5_QUESTIONS,
  BIG5_QUESTIONS_EN,
} from "@/lib/big-five/questions";

import type { UserLocale } from "@/lib/i18n/user-locale";
import { localeHref } from "@/lib/i18n/armenian-routes";
import { BIG5_QUESTIONS_AM, FIVE_POINT_LIKERT_AM } from "@/lib/tests-content-am";

/**
 * Hosts the Big Five quiz. On finish it stashes the answers + a fresh attemptId
 * to localStorage and routes to the result page — no scoring runs here, so an
 * anonymous taker can complete the test without an account.
 */
export function BigFiveTestClient({ locale = "ka" }: { locale?: UserLocale }) {
  const router = useRouter();
  const en = locale === "en";
  const am = locale === "am";
  const questions = am ? BIG5_QUESTIONS_AM : en ? BIG5_QUESTIONS_EN : BIG5_QUESTIONS;
  const scale = am ? FIVE_POINT_LIKERT_AM : BIG5_LIKERT;

  async function onSubmit(
    answers: Record<number, number>
  ): Promise<LikertSubmitResult> {
    try {
      const attemptId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      localStorage.setItem(
        BIG5_ANSWERS_STORAGE_KEY,
        JSON.stringify({ answers, attemptId })
      );
    } catch {
      /* ignore — the result page falls back to a "retake" prompt */
    }
    trackEvent(ANALYTICS_EVENT.testCompleted, {
      test: "big_five",
      items: questions.length,
    });
    router.push(localeHref("/big-five/shedegi", locale));
    return { ok: true };
  }

  return (
    <LikertQuiz questions={questions} scale={scale} onSubmit={onSubmit} locale={locale} submitLabel={am ? "Տեսնել արդյունքը" : en ? "See my result" : "ნახე შედეგი"} workingLabel={am ? "Հաշվում ենք ձեր պրոֆիլը…" : en ? "Calculating your profile…" : "ვთვლი შენს პროფილს…"} />
  );
}
