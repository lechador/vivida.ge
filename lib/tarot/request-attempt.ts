import type { TarotSpreadId } from "@/lib/tarot/spreads";

export type TarotAttempt = {
  question: string;
  spreadId: TarotSpreadId;
  requestId: string;
};

export function nextTarotAttempt(
  current: TarotAttempt | null,
  question: string,
  spreadId: TarotSpreadId,
): TarotAttempt {
  if (
    current &&
    current.question === question &&
    current.spreadId === spreadId
  ) {
    return current;
  }
  const randomPart = Math.random().toString(36).slice(2, 12);
  return {
    question,
    spreadId,
    requestId: `req_${Date.now()}_${randomPart}`,
  };
}
