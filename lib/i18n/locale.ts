export const USER_LOCALES = ["ka", "en", "am"] as const;
export type UserLocale = (typeof USER_LOCALES)[number];

export function normalizeUserLocale(
  value: string | null | undefined,
): UserLocale {
  if (value === "en") return "en";
  if (value === "am" || value === "hy") return "am";
  return "ka";
}

export function isEnglish(locale: UserLocale): boolean {
  return locale === "en";
}

export function isArmenian(locale: UserLocale): boolean {
  return locale === "am";
}
