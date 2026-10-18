import type { UserLocale } from "@/lib/i18n/user-locale";

export type SlugPair = { ka: string; en: string };

export const PLANET_EN_SLUGS: SlugPair[] = [
  { ka: "mze", en: "sun" },
  { ka: "mtvare", en: "moon" },
  { ka: "merkuri", en: "mercury" },
  { ka: "venera", en: "venus" },
  { ka: "marsi", en: "mars" },
  { ka: "iupiteri", en: "jupiter" },
  { ka: "saturni", en: "saturn" },
  { ka: "urani", en: "uranus" },
  { ka: "neptuni", en: "neptune" },
  { ka: "plutoni", en: "pluto" },
];

export const DREAM_EN_SLUGS: SlugPair[] = [
  { ka: "gveli", en: "snake" },
  { ka: "wyali", en: "water" },
  { ka: "kbili", en: "teeth" },
  { ka: "dzagli", en: "dog" },
  { ka: "bavshvi", en: "child" },
  { ka: "fuli", en: "money" },
  { ka: "mze", en: "sun" },
  { ka: "mtvare", en: "moon" },
];

export const EQ_EN_SLUGS: SlugPair[] = [
  { ka: "ra-aris-emociuri-inteleqti", en: "what-is-emotional-intelligence" },
  { ka: "emociebis-martva", en: "emotion-regulation" },
  { ka: "empatia-urtiertobashi", en: "empathy-in-relationships" },
  { ka: "stresis-martva", en: "stress-management" },
];

export const ALL_PLANET_EN_SLUGS = PLANET_EN_SLUGS.map((p) => p.en);
export const ALL_DREAM_EN_SLUGS = DREAM_EN_SLUGS.map((p) => p.en);
export const ALL_EQ_EN_SLUGS = EQ_EN_SLUGS.map((p) => p.en);

function toPublic(pairs: SlugPair[], kaSlug: string, locale: UserLocale = "ka"): string {
  if (locale !== "en") return kaSlug;
  return pairs.find((p) => p.ka === kaSlug)?.en ?? kaSlug;
}

function resolveKa(
  pairs: SlugPair[],
  rawSlug: string,
  locale: UserLocale,
  isKaValid: (s: string) => boolean,
): string | null {
  if (locale === "en") {
    const match = pairs.find((p) => p.en === rawSlug);
    if (match) return match.ka;
  }
  return isKaValid(rawSlug) ? rawSlug : null;
}

export function planetPublicSlug(kaSlug: string, locale: UserLocale = "ka"): string {
  return toPublic(PLANET_EN_SLUGS, kaSlug, locale);
}

export function resolvePlanetSlug(
  rawSlug: string,
  locale: UserLocale,
  isKaValid: (s: string) => boolean,
): string | null {
  return resolveKa(PLANET_EN_SLUGS, rawSlug, locale, isKaValid);
}

export function dreamPublicSlug(kaSlug: string, locale: UserLocale = "ka"): string {
  return toPublic(DREAM_EN_SLUGS, kaSlug, locale);
}

export function resolveDreamSlug(
  rawSlug: string,
  locale: UserLocale,
  isKaValid: (s: string) => boolean,
): string | null {
  return resolveKa(DREAM_EN_SLUGS, rawSlug, locale, isKaValid);
}

export function eqPublicSlug(kaSlug: string, locale: UserLocale = "ka"): string {
  return toPublic(EQ_EN_SLUGS, kaSlug, locale);
}

export function resolveEqSlug(
  rawSlug: string,
  locale: UserLocale,
  isKaValid: (s: string) => boolean,
): string | null {
  return resolveKa(EQ_EN_SLUGS, rawSlug, locale, isKaValid);
}
