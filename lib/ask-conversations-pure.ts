import type { UserLocale } from "@/lib/i18n/locale";

/**
 * Pure helpers for ask conversations, no DB imports so unit tests load them
 * without DATABASE_URL. Persistence lives in `lib/ask-conversations.ts`.
 */

export const CONVERSATION_TITLE_MAX = 70;

/** First question becomes the switcher label; trimmed on a word boundary. */
export function conversationTitle(question: string): string {
  const clean = question.replace(/\s+/g, " ").trim();
  if (clean.length <= CONVERSATION_TITLE_MAX) return clean;
  const cut = clean.slice(0, CONVERSATION_TITLE_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** A blank/absent title is what tells us to fill it on the first turn. */
export function needsConversationTitle(
  title: string | null | undefined,
): boolean {
  return !title || title.trim().length === 0;
}

/** Short relative label for the switcher ("დღეს", "გუშინ", "3 მარ"). */
export function conversationWhen(
  updatedAt: Date | string,
  now: Date,
  locale: UserLocale = "ka",
): string {
  const then = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (Number.isNaN(then.getTime())) return "";
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(then)) / 86_400_000);
  if (days <= 0)
    return locale === "pl" ? "Dzisiaj" : locale === "ka" ? "დღეს" : "Today";
  if (days === 1)
    return locale === "pl"
      ? "Wczoraj"
      : locale === "ka"
        ? "გუშინ"
        : "Yesterday";
  if (days < 7) {
    if (locale === "pl") return `${days} dni temu`;
    return locale === "ka" ? `${days} დღის წინ` : `${days} days ago`;
  }
  const dateLocale =
    locale === "pl" ? "pl-PL" : locale === "ka" ? "ka-GE" : "en-US";
  return then.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
  });
}
