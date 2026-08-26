export type UnlockProgress = {
  target: 5 | 10;
  current: number;
  missing: number;
  complete: boolean;
};

export function nextUnlockProgress(balance: number): UnlockProgress {
  const safe = Math.max(0, Math.floor(balance));
  const target = safe < 5 ? 5 : 10;
  return {
    target,
    current: Math.min(safe, target),
    missing: Math.max(0, target - safe),
    complete: safe >= 10,
  };
}

/** Exact next monthly drop date; the production cron uses Asia/Tbilisi. */
export function nextMonthlyBonusDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tbilisi",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  return `${next.year}-${String(next.month).padStart(2, "0")}-01`;
}
