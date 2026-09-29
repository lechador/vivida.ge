import type { WeeklyForecastDay } from "@/db/schema";

/**
 * Strip a forecast down to its locked-week teaser: day 1 keeps everything,
 * later days keep only scores, dates and the Moon sign — no headline,
 * reasons, advice or drivers.
 *
 * Runs server-side so locked narrative never reaches the page source.
 */
export function stripWeeklyTeaser(
  days: WeeklyForecastDay[],
): WeeklyForecastDay[] {
  return days.map((day, i) =>
    i === 0
      ? day
      : {
          ...day,
          headline: "",
          harmonicReason: "",
          challengingReason: "",
          advice: "",
          drivers: [],
        },
  );
}
