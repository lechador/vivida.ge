"use client";

import { useRouter } from "next/navigation";

import { EqQuiz, type EqSubmitResult } from "@/components/eq/eq-quiz";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { EQ_ANSWERS_STORAGE_KEY, EQ_QUESTIONS, EQ_QUESTIONS_EN } from "@/lib/eq/questions";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { localeHref } from "@/lib/i18n/armenian-routes";
import { EQ_QUESTIONS_AM } from "@/lib/tests-content-am";

/**
 * Hosts the EQ quiz. On finish it stashes the answers + a fresh attemptId to
 * localStorage and routes to the result page — no scoring or AI runs here, so
 * an anonymous taker can complete the test without an account. The result page
 * computes the score client-side and persists it best-effort.
 */
export function EqTestClient({ locale = "ka" }: { locale?: UserLocale }) {
  const router = useRouter();
  const en = locale === "en";
  const am = locale === "am";
  const questions = am ? EQ_QUESTIONS_AM : en ? EQ_QUESTIONS_EN : EQ_QUESTIONS;

  async function onSubmit(
    answers: Record<number, number>
  ): Promise<EqSubmitResult> {
    try {
      const attemptId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      localStorage.setItem(
        EQ_ANSWERS_STORAGE_KEY,
        JSON.stringify({ answers, attemptId })
      );
    } catch {
      /* ignore — the result page falls back to a "retake" prompt */
    }
    trackEvent(ANALYTICS_EVENT.testCompleted, {
      test: "eq",
      items: questions.length,
    });
    router.push(localeHref("/eq-testi/shedegi", locale));
    return { ok: true };
  }

  return (
    <EqQuiz
      questions={questions}
      onSubmit={onSubmit}
      locale={locale}
      submitLabel={am ? "Տեսնել արդյունքը" : en ? "See my result" : "ნახე შედეგი"}
      workingLabel={am ? "Հաշվում ենք ձեր պրոֆիլը…" : en ? "Calculating your profile…" : "ვთვლი შენს პროფილს…"}
    />
  );
}
