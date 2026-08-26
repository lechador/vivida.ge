export type StreakInfo = {
  current: number;
  longest: number;
  todayComplete: boolean;
};

export function shiftDate(date: string, delta: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + delta * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function calculateStreak(
  completedDates: Iterable<string>,
  today: string,
): StreakInfo {
  const days = new Set(completedDates);
  const todayComplete = days.has(today);
  const start = todayComplete ? today : shiftDate(today, -1);

  let current = 0;
  for (let cursor = start; days.has(cursor); cursor = shiftDate(cursor, -1)) current += 1;

  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of [...days].sort()) {
    run = previous !== null && shiftDate(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  return { current, longest, todayComplete };
}
