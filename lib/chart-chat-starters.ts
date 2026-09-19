import type { UserLocale } from "@/lib/i18n/user-locale";

export const CHART_STARTER_IDS = [
  "strengths",
  "emotions",
  "relationships",
  "career",
] as const;

export type ChartStarterId = (typeof CHART_STARTER_IDS)[number];

const STARTERS: Record<UserLocale, Record<ChartStarterId, string>> = {
  ka: {
    strengths: "რა არის ჩემი ძლიერი მხარეები?",
    emotions: "რას ამბობს ჩემი მთვარე ემოციებზე?",
    relationships: "როგორი ვარ ურთიერთობებში?",
    career: "რა მირჩევნია კარიერაში?",
  },
  en: {
    strengths: "What are my greatest strengths?",
    emotions: "What does my Moon say about my emotions?",
    relationships: "What am I like in relationships?",
    career: "What kind of career suits me?",
  },
};

export function normalizeChartStarter(
  value: string | undefined,
): ChartStarterId | undefined {
  return CHART_STARTER_IDS.find((id) => id === value);
}

export function chartStarterText(
  id: ChartStarterId,
  locale: UserLocale,
): string {
  return STARTERS[locale][id];
}

export function chartStarterOptions(locale: UserLocale) {
  return CHART_STARTER_IDS.map((id) => ({
    id,
    text: chartStarterText(id, locale),
  }));
}
