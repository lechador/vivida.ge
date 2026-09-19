const STORAGE_KEY = "vivida:tarot:pending";
const MAX_QUESTION_LENGTH = 300;
const MAX_AGE_MS = 30 * 60 * 1000;

type WritableStorage = Pick<Storage, "setItem">;
type ReadableStorage = Pick<Storage, "getItem" | "removeItem">;

export type PendingTarotAttempt = {
  question: string;
  /** The idempotent request id, when the question was already sent once. */
  requestId: string | null;
};

/**
 * Keep the user's tarot question (and its idempotent request id, when one
 * exists) across the sign-in and top-up redirects. The payload is consumed on
 * read so a stale question never pops back up.
 */
export function savePendingTarotQuestion(
  storage: WritableStorage,
  question: string,
  requestId?: string | null,
): void {
  const normalized = question.trim().slice(0, MAX_QUESTION_LENGTH);
  if (normalized.length < 3) return;
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        question: normalized,
        requestId:
          typeof requestId === "string" && requestId.length > 0
            ? requestId
            : null,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Storage may be unavailable (private mode); the question is best-effort.
  }
}

export function takePendingTarotQuestion(
  storage: ReadableStorage,
  now: number = Date.now(),
): PendingTarotAttempt | null {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Leave the value; a stale entry expires by age below.
  }
  try {
    const parsed = JSON.parse(raw) as {
      question?: unknown;
      requestId?: unknown;
      savedAt?: unknown;
    };
    if (typeof parsed.question !== "string") return null;
    const question = parsed.question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (question.length < 3) return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (now - parsed.savedAt > MAX_AGE_MS) return null;
    return {
      question,
      requestId:
        typeof parsed.requestId === "string" && parsed.requestId.length > 0
          ? parsed.requestId
          : null,
    };
  } catch {
    return null;
  }
}
