/**
 * Pure English SEO copy for sign horoscope pages. Lives in `lib/seo` (not in
 * the page component) so unit tests can import it without pulling the page's
 * component tree (`SmartHeader` → server actions → database).
 */

import { anchorForView, type HoroscopeView } from "@/lib/sign-horoscope";

function dateLabel(view: HoroscopeView, now = new Date()): string {
  const date = anchorForView(view, now);
  if (view === "today" || view === "tomorrow")
    return new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  if (view === "week" || view === "nextWeek")
    return `Week of ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" }).format(date)}`;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function signHoroscopeSeoEn(
  name: string,
  view: HoroscopeView,
  now = new Date(),
) {
  const period = dateLabel(view, now);
  const phrase =
    view === "today"
      ? "Horoscope Today"
      : view === "tomorrow"
        ? "Horoscope Tomorrow"
        : view === "week"
          ? "Weekly Horoscope"
          : view === "month"
            ? "Monthly Horoscope"
            : view === "nextWeek"
              ? "Horoscope Next Week"
              : "Horoscope Next Month";
  const horizon =
    view === "today"
      ? "today"
      : view === "tomorrow"
        ? "tomorrow"
        : view === "week"
          ? "this week"
          : view === "month"
            ? "this month"
            : view === "nextWeek"
              ? "next week"
              : "next month";

  return {
    period,
    horizon,
    heading: `${name} ${phrase}`,
    title: `${name} ${phrase}, ${period}`,
    description: `${name} horoscope ${horizon}: practical astrology guidance for love, relationships, career, priorities, and personal growth for ${period}.`,
  };
}
