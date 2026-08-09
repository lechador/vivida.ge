export type StreakInfo = {
  /** Consecutive completed rituals through today, or through yesterday while
   *  today's ritual is still available to complete. */
  current: number;
  longest: number;
  todayComplete: boolean;
};

/** Shift an already-local YYYY-MM-DD calendar date without timezone math. */
export function shiftDate(date: string, delta: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day) + delta * 86_400_000;
  return new Date(time).toISOString().slice(0, 10);
}

/** Pure streak calculation shared by the server query and unit tests. */
export function calculateStreak(
  completedDates: Iterable<string>,
  today: string
): StreakInfo {
  const days = new Set(completedDates);
  const todayComplete = days.has(today);
  const start = todayComplete ? today : shiftDate(today, -1);

  let current = 0;
  for (let cursor = start; days.has(cursor); cursor = shiftDate(cursor, -1)) {
    current++;
  }

  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    run = previous !== null && shiftDate(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest, todayComplete };
}
