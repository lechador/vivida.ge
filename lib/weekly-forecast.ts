import type { NatalChartData } from "@/lib/astrology-local";
import type { WeeklyForecastDay } from "@/db/schema";
import { localDateString } from "@/lib/transits";

export function computeWeeklyForecast(
  _chart: NatalChartData,
  startDate: Date = new Date(),
  timezone: string = "UTC",
): { weekStart: string; days: WeeklyForecastDay[] } {
  const weekStart = localDateString(startDate, timezone);
  const days: WeeklyForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate.getTime() + i * 86_400_000);
    const dateStr = localDateString(d, timezone);
    const weekday = new Intl.DateTimeFormat("ka-GE", {
      timeZone: timezone,
      weekday: "long",
    }).format(d);
    const score = [72, 65, 80, 58, 76, 84, 69][i % 7];
    return {
      date: dateStr,
      weekday,
      score,
      tier: score >= 75 ? "great" : score >= 60 ? "good" : "calm",
      moonSign: "ვერძი",
      headline: "ჰარმონიული დღე პირადი ინიციატივისა და მშვიდი კომუნიკაციისთვის",
      reasons: ["მთვარის ჰარმონიული ასპექტი აძლიერებს შინაგან თავდაჯერებულობას"],
      advice: "გამოიყენე დღის პირველი ნახევარი მნიშვნელოვანი საქმეებისთვის.",
      drivers: [],
    } as unknown as WeeklyForecastDay;
  });
  return { weekStart, days };
}
