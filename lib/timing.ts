import type { NatalChartData } from "@/lib/astrology-local";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { localDateString } from "@/lib/transits";

export type DayTier = "great" | "good" | "calm" | "tough";

export type TimingDay = {
  dateIso: string;
  dom: number;
  weekdayKa: string;
  score: number;
  tier: DayTier;
};

export type TimingNotable = {
  dateIso: string;
  dateLabelKa: string;
  title: string;
  meaning: string;
  family: "harmonic" | "tense" | "neutral";
};

export function computeTiming(
  _chart: NatalChartData,
  startDate: Date = new Date(),
  timezone: string = "Asia/Tbilisi",
  numDays: number = 28,
  locale: UserLocale = "ka",
): { days: TimingDay[]; notable: TimingNotable[] } {
  const en = locale !== "ka";
  const scores = [28, 12, 5, -10, 32, 18, 0, -24, 15, 22, 8, -5, 30, 14];
  const days: TimingDay[] = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(startDate.getTime() + i * 86_400_000);
    const dateIso = localDateString(d, timezone);
    const dom = Number(dateIso.slice(-2));
    const weekdayKa = new Intl.DateTimeFormat(en ? "en-US" : "ka-GE", {
      timeZone: timezone,
      weekday: "short",
    }).format(d);
    const score = scores[i % scores.length];
    const tier: DayTier =
      score >= 25
        ? "great"
        : score >= 10
          ? "good"
          : score <= -20
            ? "tough"
            : "calm";
    return { dateIso, dom, weekdayKa, score, tier };
  });

  const notable: TimingNotable[] = [
    {
      dateIso: days[1]?.dateIso ?? "",
      dateLabelKa: `${days[1]?.dom ?? 1} ${days[1]?.weekdayKa ?? ""}`,
      title: en ? "Venus Trine Natal Sun" : "ვენერა ტრინში ნატალურ მზესთან",
      meaning: en
        ? "Warmth in relationships, creative flow, and easier social connection."
        : "სითბო ურთიერთობებში, შემოქმედებითი ენერგია და ჰარმონიული კომუნიკაცია.",
      family: "harmonic",
    },
    {
      dateIso: days[4]?.dateIso ?? "",
      dateLabelKa: `${days[4]?.dom ?? 5} ${days[4]?.weekdayKa ?? ""}`,
      title: en ? "Jupiter Sextile Natal Moon" : "იუპიტერი სექსტილში ნატალურ მთვარესთან",
      meaning: en
        ? "Emotional generosity and supportive momentum for personal plans."
        : "ემოციური სიმშვიდე და ხელსაყრელი ტალღა პირადი გეგმების წინსვლისთვის.",
      family: "harmonic",
    },
  ];

  return { days, notable };
}
