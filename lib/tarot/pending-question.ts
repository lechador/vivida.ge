const STORAGE_KEY = "vivida_pending_tarot_q";

export type PendingTarotAttempt = {
  question: string;
  requestId?: string;
  spreadId?: string;
};

export function savePendingTarotQuestion(
  storage: Storage | null | undefined,
  question: string,
  requestId?: string,
  spreadId?: string,
): void {
  if (!storage) return;
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ question, requestId, spreadId }),
    );
  } catch {
    // ignore storage quota errors
  }
}

export function takePendingTarotQuestion(
  storage: Storage | null | undefined,
): PendingTarotAttempt | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    storage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingTarotAttempt;
  } catch {
    return null;
  }
}
