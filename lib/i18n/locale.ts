export const USER_LOCALES = ["ka", "en"] as const;
export type UserLocale = (typeof USER_LOCALES)[number];

export function normalizeUserLocale(
  value: string | null | undefined,
): UserLocale {
  return value === "en" ? "en" : "ka";
}

export function isEnglish(locale: UserLocale): boolean {
  return locale === "en";
}
