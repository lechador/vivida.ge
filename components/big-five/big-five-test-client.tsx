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
} from "@/lib/big-five/questions";

/**
 * Hosts the Big Five quiz. On finish it stashes the answers + a fresh attemptId
 * to localStorage and routes to the result page — no scoring runs here, so an
 * anonymous taker can complete the test without an account.
 */
export function BigFiveTestClient() {
  const router = useRouter();

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
      items: BIG5_QUESTIONS.length,
    });
    router.push("/big-five/shedegi");
    return { ok: true };
  }

  return (
    <LikertQuiz questions={BIG5_QUESTIONS} scale={BIG5_LIKERT} onSubmit={onSubmit} />
  );
}
