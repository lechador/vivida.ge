export const GEORGIAN_SITE_URL = "https://www.vivida.ge";
export const ENGLISH_SITE_URL = "https://www.vividaastro.com";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Vivida",
};

export const CORE_LANGUAGE_PAIRS: Array<{ ka: string; en: string }> = [
  { ka: "/", en: "/" },
  { ka: "/horoskopi", en: "/daily-horoscope" },
  { ka: "/zodiac", en: "/zodiac" },
  { ka: "/zodiac/tavsebadoba", en: "/compatibility" },
  { ka: "/nataluri-ruka", en: "/natal-chart" },
  { ka: "/tests", en: "/tests" },
  { ka: "/mkitxaoba", en: "/readings" },
  { ka: "/privacy", en: "/privacy" },
  { ka: "/terms", en: "/terms" },
];

export const ENGLISH_ONLY_ROUTES: Array<{ en: string }> = [
  { en: "/about" },
  { en: "/horoscope" },
];

export function isEnglishHost(host?: string | null): boolean {
  if (!host) return false;
  return host.toLowerCase().includes("vividaastro.com");
}

export function siteOriginForHost(host?: string | null): string {
  return isEnglishHost(host) ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
}

export function englishSiteHref(path: string, stripEnPrefix = true): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const normalized =
    stripEnPrefix && clean.startsWith("/en/")
      ? clean.slice(3)
      : stripEnPrefix && clean === "/en"
        ? "/"
        : clean;
  return `${ENGLISH_SITE_URL}${normalized === "/" ? "" : normalized}`;
}

export function resolveEnglishPath(kaPath: string): string {
  return CORE_LANGUAGE_PAIRS.find((p) => p.ka === kaPath)?.en ?? kaPath;
}

export function localizedAlternates(
  currentPath: string,
  pairedPath: string,
  locale: "ka" | "en" = "ka",
) {
  const kaUrl = `${GEORGIAN_SITE_URL}${locale === "ka" ? currentPath : pairedPath}`;
  const enPath = locale === "en" ? currentPath : pairedPath;
  const enUrl = englishSiteHref(enPath, true);
  return {
    canonical: locale === "en" ? enUrl : kaUrl,
    languages: {
      "ka-GE": kaUrl,
      en: enUrl,
      "x-default": enUrl,
    },
  };
}
