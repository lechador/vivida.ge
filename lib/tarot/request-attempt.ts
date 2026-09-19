export type TarotAttempt = {
  question: string;
  requestId: string;
};

/**
 * Keep one stable request id per logical tarot question. Network retries of
 * the same question reuse the id (so the server replays instead of charging
 * again); editing the question starts a new logical attempt.
 */
export function nextTarotAttempt(
  previous: TarotAttempt | null,
  question: string,
  createId: () => string = () => crypto.randomUUID(),
): TarotAttempt {
  const normalized = question.trim();
  if (previous && previous.question === normalized) return previous;
  return { question: normalized, requestId: createId() };
}
