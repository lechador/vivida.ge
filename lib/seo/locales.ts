import type { Metadata } from "next";

export const SITE_URL = "https://www.vivida.ge";

export type CoreEnglishPath =
  | "/en"
  | "/en/about"
  | "/en/natal-chart"
  | "/en/horoscope"
  | "/en/zodiac"
  | "/en/compatibility"
  | "/en/tests"
  | "/en/privacy"
  | "/en/terms";

/**
 * Explicit pairs keep hreflang honest: only pages with a real English version
 * advertise one. Georgian-only interpretation pages are intentionally absent.
 */
export const CORE_LANGUAGE_PAIRS: ReadonlyArray<{
  ka: string;
  en: CoreEnglishPath;
}> = [
  { ka: "/", en: "/en" },
  { ka: "/nataluri-ruka", en: "/en/natal-chart" },
  { ka: "/horoskopi", en: "/en/horoscope" },
  { ka: "/zodiac", en: "/en/zodiac" },
  { ka: "/zodiac/tavsebadoba", en: "/en/compatibility" },
  { ka: "/tests", en: "/en/tests" },
  { ka: "/privacy", en: "/en/privacy" },
  { ka: "/terms", en: "/en/terms" },
];

export function localizedAlternates(
  canonicalPath: string,
  pairedPath: string,
  locale: "ka" | "en",
): NonNullable<Metadata["alternates"]> {
  const kaPath = locale === "ka" ? canonicalPath : pairedPath;
  const enPath = locale === "en" ? canonicalPath : pairedPath;

  return {
    canonical: `${SITE_URL}${canonicalPath}`,
    languages: {
      "ka-GE": `${SITE_URL}${kaPath}`,
      en: `${SITE_URL}${enPath}`,
      "x-default": `${SITE_URL}${kaPath}`,
    },
  };
}
