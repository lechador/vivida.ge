import { kaShortDate } from "@/lib/i18n/ka-date";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Short relative time formatter — "ახლახან / X წუთის წინ / X საათის წინ /
 * X დღის წინ" until a week passes, then a localised short date. Lives in
 * components/feed so feed and comment surfaces share the exact wording.
 *
 * Pure function — safe to call from server or client; no Date.now()
 * snapshot is taken at module load.
 */
export function feedTimeAgo(date: Date | string, locale: UserLocale = "ka"): string {
  const en = locale === "en";
  const ts = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - ts.getTime()) / 1000);
  if (seconds < 45) return en ? "just now" : "ახლახან";
  // 45–59s falls past "ახლახან" but floors to 0 — clamp so we never
  // render "0 წუთის წინ".
  const minutes = Math.max(1, Math.floor(seconds / 60));
  if (minutes < 60) return en ? `${minutes}m ago` : `${minutes} წუთის წინ`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours}h ago` : `${hours} საათის წინ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return en ? `${days}d ago` : `${days} დღის წინ`;
  return en
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(ts)
    : kaShortDate(ts);
}
