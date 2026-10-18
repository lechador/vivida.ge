export function shiftDate(dateStr: string, deltaDays: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export type StreakCalculation = {
  current: number;
  todayComplete: boolean;
};

export function calculateStreak(
  dates: string[],
  today: string,
): StreakCalculation {
  const set = new Set(dates);
  const todayComplete = set.has(today);
  let cursor = todayComplete ? today : shiftDate(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = shiftDate(cursor, -1);
  }
  return { current, todayComplete };
}
