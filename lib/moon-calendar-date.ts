const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Georgia uses UTC+4 year-round. Months are zero-based, as in Date.UTC. */
export function tbilisiCalendarParts(date: Date) {
  const local = new Date(date.getTime() + TBILISI_OFFSET_MS);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth(),
    day: local.getUTCDate(),
    weekday: local.getUTCDay(),
    hour: local.getUTCHours(),
    minute: local.getUTCMinutes(),
  };
}

/** 12:00 in Tbilisi, represented as 08:00 UTC for daily samples. */
export function tbilisiNoonUtc(date: Date): Date {
  const { year, month, day } = tbilisiCalendarParts(date);
  return new Date(Date.UTC(year, month, day, 8));
}
