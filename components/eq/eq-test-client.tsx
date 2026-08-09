"use client";

import { useRouter } from "next/navigation";

import { EqQuiz, type EqSubmitResult } from "@/components/eq/eq-quiz";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { EQ_ANSWERS_STORAGE_KEY, EQ_QUESTIONS } from "@/lib/eq/questions";

/**
 * Hosts the EQ quiz. On finish it stashes the answers + a fresh attemptId to
 * localStorage and routes to the result page — no scoring or AI runs here, so
 * an anonymous taker can complete the test without an account. The result page
 * computes the score client-side and persists it best-effort.
 */
export function EqTestClient() {
  const router = useRouter();

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
      items: EQ_QUESTIONS.length,
    });
    router.push("/eq-testi/shedegi");
    return { ok: true };
  }

  return <EqQuiz questions={EQ_QUESTIONS} onSubmit={onSubmit} />;
}
