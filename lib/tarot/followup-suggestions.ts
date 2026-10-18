import type { UserLocale } from "@/lib/i18n/locale";

export function normalizeTarotFollowupSuggestions(
  suggestions: string[] | undefined | null,
  locale: UserLocale = "ka",
  askedQuestions: string[] = [],
): string[] {
  const asked = new Set(askedQuestions.map((q) => q.trim().toLowerCase()));
  const defaults =
    locale === "en"
      ? [
          "What practical step should I take first?",
          "What hidden factor should I pay attention to?",
        ]
      : [
          "რა პრაქტიკული ნაბიჯი გადავდგა პირველ რიგში?",
          "რა ფარულ ფაქტორს მივაქციო ყურადღება?",
        ];
  const list = suggestions && suggestions.length > 0 ? suggestions : defaults;
  return list.filter((s) => !asked.has(s.trim().toLowerCase())).slice(0, 3);
}
