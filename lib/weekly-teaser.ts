import type { WeeklyForecastDay } from "@/db/schema";

export function stripWeeklyTeaser(
  days: WeeklyForecastDay[],
): WeeklyForecastDay[] {
  return days.map((day, idx) =>
    idx === 0
      ? day
      : {
          ...day,
          headline: "",
          reasons: [],
          advice: "",
          drivers: [],
        },
  );
}
