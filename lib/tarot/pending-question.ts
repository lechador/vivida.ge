const STORAGE_KEY = "vivida:tarot:pending";
const MAX_QUESTION_LENGTH = 300;
const MAX_AGE_MS = 30 * 60 * 1000;

type WritableStorage = Pick<Storage, "setItem">;
type ReadableStorage = Pick<Storage, "getItem" | "removeItem">;

/**
 * Keep the user's tarot question across the sign-in and top-up redirects.
 * The payload is consumed on read so a stale question never pops back up.
 */
export function savePendingTarotQuestion(
  storage: WritableStorage,
  question: string,
): void {
  const normalized = question.trim().slice(0, MAX_QUESTION_LENGTH);
  if (normalized.length < 3) return;
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ question: normalized, savedAt: Date.now() }),
    );
  } catch {
    // Storage may be unavailable (private mode); the question is best-effort.
  }
}

export function takePendingTarotQuestion(
  storage: ReadableStorage,
  now: number = Date.now(),
): string | null {
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
      savedAt?: unknown;
    };
    if (typeof parsed.question !== "string") return null;
    const question = parsed.question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (question.length < 3) return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (now - parsed.savedAt > MAX_AGE_MS) return null;
    return question;
  } catch {
    return null;
  }
}
