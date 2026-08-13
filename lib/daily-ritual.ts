export type DailyRitualState = {
  horoscopeRead: boolean;
  moonRead: boolean;
  focus: string | null;
};

type StoredDailyRitual = DailyRitualState & {
  version: 1;
  date: string;
  savedAt: number;
};

const STORAGE_PREFIX = "vivida_daily_ritual_v1";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export const EMPTY_DAILY_RITUAL: DailyRitualState = {
  horoscopeRead: false,
  moonRead: false,
  focus: null,
};

function key(userId: string): string {
  return `${STORAGE_PREFIX}:${encodeURIComponent(userId)}`;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isFocus(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.length > 0 && value.length <= 80)
  );
}

/**
 * Keeps one user's latest daily ritual on this browser. This is deliberately
 * lightweight product state, not a reward ledger: the server remains the
 * source of truth for visits, streaks, and credits.
 */
export function readDailyRitual(
  userId: string,
  date: string
): DailyRitualState {
  const target = storage();
  if (!target || !userId || !isDate(date)) return { ...EMPTY_DAILY_RITUAL };

  try {
    const raw = target.getItem(key(userId));
    if (!raw) return { ...EMPTY_DAILY_RITUAL };
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      value.date !== date ||
      typeof value.savedAt !== "number" ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > Date.now() ||
      Date.now() - value.savedAt > MAX_AGE_MS ||
      typeof value.horoscopeRead !== "boolean" ||
      typeof value.moonRead !== "boolean" ||
      !isFocus(value.focus)
    ) {
      target.removeItem(key(userId));
      return { ...EMPTY_DAILY_RITUAL };
    }

    return {
      horoscopeRead: value.horoscopeRead,
      moonRead: value.moonRead,
      focus: value.focus,
    };
  } catch {
    try {
      target.removeItem(key(userId));
    } catch {
      /* storage became unavailable */
    }
    return { ...EMPTY_DAILY_RITUAL };
  }
}

export function saveDailyRitual(
  userId: string,
  date: string,
  state: DailyRitualState
): boolean {
  const target = storage();
  if (!target || !userId || !isDate(date) || !isFocus(state.focus)) return false;
  const payload: StoredDailyRitual = {
    version: 1,
    date,
    savedAt: Date.now(),
    ...state,
  };

  try {
    target.setItem(key(userId), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function isDailyRitualComplete(
  state: DailyRitualState,
  moonRequired: boolean,
  accountComplete = false
): boolean {
  return (
    accountComplete ||
    (state.horoscopeRead && (!moonRequired || state.moonRead) && !!state.focus)
  );
}
