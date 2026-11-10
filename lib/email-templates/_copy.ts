import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Pick the copy for a recipient's locale. Every outbound message (email and
 * push) takes all three, so Polish readers can never fall through to Georgian
 * the way the old `locale === "en" ? en : ka` branches let them.
 */
export function pickCopy<T>(
  locale: UserLocale,
  copy: { ka: T; en: T; pl: T },
): T {
  if (locale === "pl") return copy.pl;
  if (locale === "en") return copy.en;
  return copy.ka;
}

/**
 * Polish count noun: 1 kredyt, 2-4 kredyty (not 12-14), else kredytów.
 */
export function plPlural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  const tens = abs % 100;
  const units = abs % 10;
  if (units >= 2 && units <= 4 && (tens < 12 || tens > 14)) return few;
  return many;
}

export function plCredits(n: number): string {
  return `${n} ${plPlural(n, "kredyt", "kredyty", "kredytów")}`;
}
