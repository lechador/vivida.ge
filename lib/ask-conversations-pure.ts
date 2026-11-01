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
  locale: "ka" | "en" = "ka",
): string {
  const then = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (Number.isNaN(then.getTime())) return "";
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(then)) / 86_400_000);
  if (days <= 0) return locale === "ka" ? "დღეს" : "Today";
  if (days === 1) return locale === "ka" ? "გუშინ" : "Yesterday";
  if (days < 7)
    return locale === "ka" ? `${days} დღის წინ` : `${days} days ago`;
  return then.toLocaleDateString(locale === "ka" ? "ka-GE" : "en-US", {
    day: "numeric",
    month: "short",
  });
}
