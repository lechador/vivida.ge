export type TarotAttempt = {
  question: string;
  spreadId: string;
  requestId: string;
};

/**
 * Keep one stable request id per logical tarot attempt (question + spread).
 * Network retries reuse the id (so the server replays instead of charging
 * again); editing the question or switching the spread starts a new attempt.
 */
export function nextTarotAttempt(
  previous: TarotAttempt | null,
  question: string,
  spreadId: string = "situation",
  createId: () => string = () => crypto.randomUUID(),
): TarotAttempt {
  const normalized = question.trim();
  if (
    previous &&
    previous.question === normalized &&
    previous.spreadId === spreadId
  )
    return previous;
  return { question: normalized, spreadId, requestId: createId() };
}
