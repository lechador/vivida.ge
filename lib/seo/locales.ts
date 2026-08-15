import type { Metadata } from "next";

export const GEORGIAN_SITE_URL = "https://www.vivida.ge";
export const ENGLISH_SITE_URL = "https://www.vividaastro.com";

export const GEORGIAN_HOSTS = ["vivida.ge", "www.vivida.ge"] as const;
export const ENGLISH_HOSTS = [
  "vividaastro.com",
  "www.vividaastro.com",
] as const;

export type CoreEnglishPath =
  | "/"
  | "/about"
  | "/natal-chart"
  | "/horoscope"
  | "/zodiac"
  | "/compatibility"
  | "/tests"
  | "/privacy"
  | "/terms";

export type CoreEnglishInternalPath =
  | "/en"
  | `/en${Exclude<CoreEnglishPath, "/">}`;

/**
 * Explicit pairs keep hreflang honest: only pages with a real English version
 * advertise one. Georgian-only interpretation pages are intentionally absent.
 */
export const CORE_LANGUAGE_PAIRS: ReadonlyArray<{
  ka: string;
  en: CoreEnglishPath;
  internalEn: CoreEnglishInternalPath;
}> = [
  { ka: "/", en: "/", internalEn: "/en" },
  { ka: "/nataluri-ruka", en: "/natal-chart", internalEn: "/en/natal-chart" },
  { ka: "/zodiac", en: "/zodiac", internalEn: "/en/zodiac" },
  { ka: "/zodiac/tavsebadoba", en: "/compatibility", internalEn: "/en/compatibility" },
  { ka: "/tests", en: "/tests", internalEn: "/en/tests" },
  { ka: "/privacy", en: "/privacy", internalEn: "/en/privacy" },
  { ka: "/terms", en: "/terms", internalEn: "/en/terms" },
];

export const ENGLISH_ONLY_ROUTES: ReadonlyArray<{
  en: CoreEnglishPath;
  internalEn: CoreEnglishInternalPath;
}> = [
  { en: "/about", internalEn: "/en/about" },
  // "How daily horoscopes work" — an explainer with no Georgian equivalent.
  // It previously held the hreflang pair with the Georgian /horoskopi, but
  // that is the Georgian *daily hub*, whose real English counterpart is the
  // English /horoskopi (same-path, like its /kvireuli and /tviuri siblings).
  // Pairing an explainer with a daily hub mismatched the content on both
  // sides and left the English daily hub with no counterpart at all.
  { en: "/horoscope", internalEn: "/en/horoscope" },
];

export const ENGLISH_PUBLIC_ROUTES: ReadonlyArray<{
  en: CoreEnglishPath;
  internalEn: CoreEnglishInternalPath;
}> = [
  ...CORE_LANGUAGE_PAIRS.map(({ en, internalEn }) => ({ en, internalEn })),
  ...ENGLISH_ONLY_ROUTES,
];

export function publicEnglishPath(path: string): string {
  if (path === "/en" || path === "/en/") return "/";
  return path.startsWith("/en/") ? path.slice(3) : path;
}

export function isEnglishHost(host: string | null | undefined): boolean {
  const normalized = host?.toLowerCase().split(":", 1)[0];
  return ENGLISH_HOSTS.some((candidate) => candidate === normalized);
}

export function siteOriginForHost(host: string | null | undefined): string {
  return isEnglishHost(host) ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
}

export function localizedAlternates(
  canonicalPath: string,
  pairedPath: string,
  locale: "ka" | "en",
): NonNullable<Metadata["alternates"]> {
  const kaPath = locale === "ka" ? canonicalPath || "/" : pairedPath;
  const enPath = publicEnglishPath(
    locale === "en" ? canonicalPath : pairedPath,
  );
  const canonical =
    locale === "en"
      ? `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`
      : `${GEORGIAN_SITE_URL}${kaPath === "/" ? "" : kaPath}`;
  const englishUrl = `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`;
  const georgianUrl = `${GEORGIAN_SITE_URL}${kaPath === "/" ? "" : kaPath}`;

  return {
    canonical,
    languages: {
      "ka-GE": georgianUrl,
      en: englishUrl,
      "x-default": englishUrl,
    },
  };
}
