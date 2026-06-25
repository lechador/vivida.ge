/**
 * Pure helpers for sign-level SEO horoscope pages — date-anchor math,
 * period-key derivation, Georgian-localized period labels. Kept separate
 * from actions/sign-horoscope.ts because Next.js 16 server-action files
 * may only export async functions; sync helpers belong here.
 */

import type { SignHoroscopePeriod } from "@/db/schema";

const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

const WEEKDAYS_KA = [
  "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი",
  "ხუთშაბათი", "პარასკევი", "შაბათი",
];

/**
 * Anchor date for a given period:
 *   day   → the day passed in (UTC date string)
 *   week  → Monday of that ISO week (UTC)
 *   month → 1st of that month (UTC)
 *
 * UTC is the natural anchor because the horoscope is content-shared
 * across all readers — picking any single timezone would be arbitrary
 * and computeTransits already runs at noon UTC internally.
 */
export function periodAnchorDate(
  date: Date,
  period: SignHoroscopePeriod
): Date {
  const utc = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  if (period === "day") return utc;
  if (period === "month") {
    return new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), 1));
  }
  const dow = utc.getUTCDay();        // 0=Sun..6=Sat
  const back = dow === 0 ? 6 : dow - 1;
  utc.setUTCDate(utc.getUTCDate() - back);
  return utc;
}

function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO week key YYYY-Www, Monday-anchored. */
function isoWeekKey(monday: Date): string {
  const target = new Date(Date.UTC(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate()
  ));
  // Standard ISO algorithm: shift to Thursday of this week, then count
  // weeks since Jan 1 of that Thursday's year.
  target.setUTCDate(target.getUTCDate() + 3);
  const year = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Canonical periodKey for cache lookup / sitemap URLs. Matches the
 * primary-key column on `sign_horoscope`.
 */
export function signHoroscopePeriodKey(
  date: Date,
  period: SignHoroscopePeriod
): string {
  const anchor = periodAnchorDate(date, period);
  if (period === "day") return utcDateString(anchor);
  if (period === "month") return anchor.toISOString().slice(0, 7);
  return isoWeekKey(anchor);
}

/**
 * Human-readable Georgian label for the period — used in the page <h1>,
 * meta description, and as a hint passed to the AI prompt. Examples:
 *   day   → "ხუთშაბათი, 4 მაისი 2026"
 *   week  → "4-10 მაისი 2026" (or "29 აპრილი – 5 მაისი 2026" across months)
 *   month → "მაისი 2026"
 */
export function signHoroscopePeriodLabel(
  date: Date,
  period: SignHoroscopePeriod
): string {
  const anchor = periodAnchorDate(date, period);
  if (period === "day") {
    return `${WEEKDAYS_KA[anchor.getUTCDay()]}, ${anchor.getUTCDate()} ${MONTHS_KA[anchor.getUTCMonth()]} ${anchor.getUTCFullYear()}`;
  }
  if (period === "month") {
    return `${MONTHS_KA[anchor.getUTCMonth()]} ${anchor.getUTCFullYear()}`;
  }
  const sunday = new Date(anchor);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const sameMonth = anchor.getUTCMonth() === sunday.getUTCMonth();
  if (sameMonth) {
    return `${anchor.getUTCDate()}-${sunday.getUTCDate()} ${MONTHS_KA[anchor.getUTCMonth()]} ${anchor.getUTCFullYear()}`;
  }
  return `${anchor.getUTCDate()} ${MONTHS_KA[anchor.getUTCMonth()]} – ${sunday.getUTCDate()} ${MONTHS_KA[sunday.getUTCMonth()]} ${anchor.getUTCFullYear()}`;
}

/**
 * View-level horoscope variant — what the URL exposes. Differs from the
 * DB `SignHoroscopePeriod`: "today" and "tomorrow" both map to DB
 * period="day" but with different anchor dates. Treating these as one
 * concept at the URL/UI layer keeps page metadata + sibling-link logic
 * uniform without bloating the schema.
 */
export type HoroscopeView =
  | "today"
  | "tomorrow"
  | "week"
  | "month"
  | "nextWeek"
  | "nextMonth";

export const ALL_HOROSCOPE_VIEWS: HoroscopeView[] = [
  "today",
  "tomorrow",
  "week",
  "month",
  "nextWeek",
  "nextMonth",
];

/** URL path segment per view. */
export const VIEW_PATH: Record<HoroscopeView, string> = {
  today: "dghes",
  tomorrow: "khval",
  week: "kviris-horoskopi",
  month: "tvis-horoskopi",
  nextWeek: "momavali-kviris-horoskopi",
  nextMonth: "momavali-tvis-horoskopi",
};

/** Inverse of VIEW_PATH for route param parsing. */
export function viewFromPath(path: string): HoroscopeView | null {
  if (path === "dghes") return "today";
  if (path === "khval") return "tomorrow";
  if (path === "kviris-horoskopi") return "week";
  if (path === "tvis-horoskopi") return "month";
  if (path === "momavali-kviris-horoskopi") return "nextWeek";
  if (path === "momavali-tvis-horoskopi") return "nextMonth";
  return null;
}

/** Map view → DB period. */
export function periodForView(view: HoroscopeView): SignHoroscopePeriod {
  if (view === "today" || view === "tomorrow") return "day";
  if (view === "week" || view === "nextWeek") return "week";
  return "month"; // month | nextMonth
}

/**
 * Anchor date for the view. "today" uses `now`; the "next" variants shift the
 * anchor forward (tomorrow +1d, nextWeek +7d, nextMonth → mid next month) so
 * `periodAnchorDate` + the cache periodKey resolve to the right future period.
 */
export function anchorForView(view: HoroscopeView, now: Date = new Date()): Date {
  if (view === "tomorrow") {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }
  if (view === "nextWeek") {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + 7);
    return d;
  }
  if (view === "nextMonth") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 15));
  }
  return now;
}

// ─── Back-compat exports (deprecated, will be removed once callers migrate)

/** @deprecated Use VIEW_PATH instead. */
export const PERIOD_PATH = {
  day: VIEW_PATH.today,
  week: VIEW_PATH.week,
  month: VIEW_PATH.month,
} as const;

/** @deprecated Use viewFromPath instead. */
export function periodFromPath(path: string): SignHoroscopePeriod | null {
  const view = viewFromPath(path);
  if (!view) return null;
  return periodForView(view);
}
