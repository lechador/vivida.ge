export type DateRange = {
  startDate: string;
  endDate: string;
};

export type ComparisonDateRanges = {
  current: DateRange;
  previous: DateRange;
  days: number;
  lagDays: number;
};

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

export function comparisonDateRanges(
  days: number,
  options: { lagDays?: number; now?: Date } = {},
): ComparisonDateRanges {
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    throw new Error("days must be an integer between 1 and 90");
  }

  const lagDays = options.lagDays ?? 3;
  const now = options.now ?? new Date();
  const utcToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const currentEnd = shiftUtcDays(utcToday, -lagDays);
  const currentStart = shiftUtcDays(currentEnd, -(days - 1));
  const previousEnd = shiftUtcDays(currentStart, -1);
  const previousStart = shiftUtcDays(previousEnd, -(days - 1));

  return {
    current: {
      startDate: formatUtcDate(currentStart),
      endDate: formatUtcDate(currentEnd),
    },
    previous: {
      startDate: formatUtcDate(previousStart),
      endDate: formatUtcDate(previousEnd),
    },
    days,
    lagDays,
  };
}
