import type { UserLocale } from "@/lib/i18n/locale";

const FALLBACK_SUGGESTIONS: Record<UserLocale, readonly string[]> = {
  ka: [
    "რომელი თემა საჭიროებს ყველაზე მეტ ყურადღებას?",
    "ეს ჩემს სიტუაციას როგორ უკავშირდება?",
    "რომელ პრაქტიკულ ნაბიჯზე დავფიქრდე?",
    "რა დაბრკოლება შეიძლება ვერ შევამჩნიო?",
    "რა უნდა დავაზუსტო გადაწყვეტილებამდე?",
    "როგორ გამოვიყენო ეს ხედვა ყოველდღიურად?",
  ],
  en: [
    "Which theme needs the most attention?",
    "How does this connect to my situation?",
    "Which practical next step should I consider?",
    "Which obstacle might I be overlooking?",
    "What should I clarify before deciding?",
    "How can I apply this insight day to day?",
  ],
};

export function tarotFollowupFallback(locale: UserLocale): string[] {
  return FALLBACK_SUGGESTIONS[locale].slice(0, 3);
}

export function normalizeTarotFollowupSuggestions(
  suggestions: unknown,
  locale: UserLocale,
  excluded: string[] = [],
): string[] {
  const excludedSet = new Set(
    excluded.map((item) => item.trim().toLowerCase()),
  );
  const unique = new Set<string>();
  const normalized: string[] = [];

  const add = (candidate: unknown) => {
    if (typeof candidate !== "string") return;
    const value = candidate.trim().slice(0, 300);
    const key = value.toLowerCase();
    if (value.length < 3 || excludedSet.has(key) || unique.has(key)) return;
    unique.add(key);
    normalized.push(value);
  };

  if (Array.isArray(suggestions)) suggestions.forEach(add);
  FALLBACK_SUGGESTIONS[locale].forEach(add);

  return normalized.slice(0, 3);
}
