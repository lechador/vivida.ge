export type DailyRitualState = { horoscopeRead: boolean; focus: string | null };

const EMPTY: DailyRitualState = { horoscopeRead: false, focus: null };
const PREFIX = "vivida_daily_ritual_v2";

function key(userId: string, date: string): string {
  return `${PREFIX}:${encodeURIComponent(userId)}:${date}`;
}

export function readDailyRitual(userId: string, date: string): DailyRitualState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const value = JSON.parse(localStorage.getItem(key(userId, date)) ?? "null") as unknown;
    if (!value || typeof value !== "object") return { ...EMPTY };
    const record = value as Record<string, unknown>;
    return {
      horoscopeRead: record.horoscopeRead === true,
      focus: typeof record.focus === "string" && record.focus.length <= 80 ? record.focus : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveDailyRitual(userId: string, date: string, state: DailyRitualState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(userId, date), JSON.stringify(state));
  } catch {
    // Private browsing/storage quotas must never block completion.
  }
}
