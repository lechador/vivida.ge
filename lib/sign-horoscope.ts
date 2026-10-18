import type { SignHoroscopePeriod } from "@/db/schema";

export type HoroscopeView =
  | "today"
  | "tomorrow"
  | "week"
  | "month"
  | "nextWeek"
  | "nextMonth";

export const ALL_HOROSCOPE_VIEWS: readonly HoroscopeView[] = [
  "today",
  "tomorrow",
  "week",
  "month",
  "nextWeek",
  "nextMonth",
] as const;

export const VIEW_PATH: Record<HoroscopeView, string> = {
  today: "dghevandeli-horoskopi",
  tomorrow: "khvalindeli-horoskopi",
  week: "am-kviris-horoskopi",
  month: "am-tvis-horoskopi",
  nextWeek: "momavali-kviris-horoskopi",
  nextMonth: "momavali-tvis-horoskopi",
};

export function viewFromPath(slug: string): HoroscopeView | null {
  for (const [view, path] of Object.entries(VIEW_PATH)) {
    if (path === slug) return view as HoroscopeView;
  }
  return null;
}

export function periodForView(view: HoroscopeView): SignHoroscopePeriod {
  if (view === "today" || view === "tomorrow") return "day";
  if (view === "week" || view === "nextWeek") return "week";
  return "month";
}

export function anchorForView(view: HoroscopeView, now: Date = new Date()): Date {
  const d = new Date(now);
  if (view === "tomorrow") {
    d.setUTCDate(d.getUTCDate() + 1);
  } else if (view === "nextWeek") {
    d.setUTCDate(d.getUTCDate() + 7);
  } else if (view === "nextMonth") {
    d.setUTCMonth(d.getUTCMonth() + 1, 1);
  }
  return periodAnchorDate(d, periodForView(view));
}

export function periodAnchorDate(
  now: Date,
  period: SignHoroscopePeriod,
): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "week") {
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
  } else if (period === "month") {
    d.setUTCDate(1);
  }
  return d;
}

export function signHoroscopePeriodKey(
  now: Date,
  period: SignHoroscopePeriod,
): string {
  const anchor = periodAnchorDate(now, period);
  const iso = anchor.toISOString().slice(0, 10);
  if (period === "month") return iso.slice(0, 7);
  return iso;
}

export function signHoroscopePeriodLabel(
  now: Date,
  period: SignHoroscopePeriod,
  locale: "ka" | "en" = "ka",
): string {
  const anchor = periodAnchorDate(now, period);
  const fmtLocale = locale === "en" ? "en-US" : "ka-GE";
  if (period === "month") {
    return new Intl.DateTimeFormat(fmtLocale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(anchor);
  }
  return new Intl.DateTimeFormat(fmtLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(anchor);
}
