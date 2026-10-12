export const USER_LOCALES = ["ka", "en"] as const;
export type UserLocale = (typeof USER_LOCALES)[number];

export function normalizeUserLocale(
  value: string | null | undefined,
): UserLocale {
  if (value === "en") return "en";
  // Armenian was removed: stored "am"/"hy" preferences resolve to English so
  // existing users keep a working language instead of falling back to Georgian.
  if (value === "am" || value === "hy") return "en";
  return "ka";
}

export function isEnglish(locale: UserLocale): boolean {
  return locale === "en";
}

/**
 * The `const en = locale !== "ka"` idiom, explained once.
 *
 * Surfaces that have not been translated to Armenian yet ask whether to render
 * their English copy. Written as `locale === "en"` it excludes Armenian, which
 * then falls into the *Georgian* branch, the worst of the three answers for an
 * Armenian reader. `locale !== "ka"` keeps Georgian for Georgian and gives
 * everyone else English, which is a legible fallback.
 *
 * It is a stopgap, not a destination: when a surface gains a real Armenian
 * branch it should test the locale explicitly and stop relying on this.
 */
export function usesEnglishCopy(locale: UserLocale): boolean {
  return locale !== "ka";
}
