export const USER_LOCALES = ["ka", "en", "pl"] as const;
export type UserLocale = (typeof USER_LOCALES)[number];

export function normalizeUserLocale(
  value: string | null | undefined,
): UserLocale {
  if (value === "pl") return "pl";
  if (value === "en" || value === "am" || value === "hy") return "en";
  return "ka";
}

export function isEnglish(locale: UserLocale): boolean {
  return locale === "en";
}

export function isPolish(locale: UserLocale): boolean {
  return locale === "pl";
}

export function usesEnglishCopy(locale: UserLocale): boolean {
  return locale !== "ka";
}

export function pickLocale<T>(
  locale: UserLocale,
  choices: { ka: T; en: T; pl?: T },
): T {
  if (locale === "pl" && choices.pl !== undefined) return choices.pl;
  if (locale !== "ka") return choices.en;
  return choices.ka;
}
