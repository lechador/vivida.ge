import type { Metadata } from "next";

// Relative, not "@/": this module is imported by next.config.ts, which is
// loaded outside the app's tsconfig path aliases.
import {
  hasArmenianVersion,
  stripArmenianPrefix,
} from "../i18n/armenian-routes";

export const GEORGIAN_SITE_URL = "https://www.vivida.ge";
export const ENGLISH_SITE_URL = "https://www.vividaastro.com";
export const ARMENIAN_SITE_URL = "https://www.vividaastro.com/am";

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

export function resolveEnglishPath(path: string): string {
  const normalized = publicEnglishPath(path);
  const found = CORE_LANGUAGE_PAIRS.find(
    (p) => p.ka === path || p.en === normalized || p.internalEn === path || p.en === path,
  );
  if (found) return found.en;
  return normalized;
}

export function localizedAlternates(
  canonicalPath: string,
  pairedPath: string,
  locale: "ka" | "en" | "am" | string,
  armenianPath?: string,
): NonNullable<Metadata["alternates"]> {
  const kaPath =
    locale === "ka"
      ? canonicalPath || "/"
      : CORE_LANGUAGE_PAIRS.find(
          (p) =>
            p.en === publicEnglishPath(canonicalPath) ||
            p.internalEn === canonicalPath ||
            p.en === publicEnglishPath(pairedPath),
        )?.ka ?? pairedPath;

  const enPath =
    locale === "en"
      ? publicEnglishPath(canonicalPath)
      : resolveEnglishPath(
          locale === "am"
            ? (canonicalPath.replace(/^\/am/, "") || "/")
            : pairedPath,
        );

  const rawAm =
    locale === "am"
      ? canonicalPath
      : (armenianPath ?? (enPath === "/" ? "/am" : `/am${enPath}`));
  const amPath = rawAm.startsWith("/am") ? rawAm : `/am${rawAm === "/" ? "" : rawAm}`;

  const canonical =
    locale === "am"
      ? `${ENGLISH_SITE_URL}${amPath}`
      : locale === "en"
      ? `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`
      : `${GEORGIAN_SITE_URL}${kaPath === "/" ? "" : kaPath}`;
  const englishUrl = `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`;
  const georgianUrl = `${GEORGIAN_SITE_URL}${kaPath === "/" ? "" : kaPath}`;
  const armenianUrl = `${ENGLISH_SITE_URL}${amPath}`;

  // An Armenian alternate is a promise that the URL resolves. Most of the
  // ~1,200 Georgian and English pages have no Armenian twin yet, and pointing
  // hreflang at a 404 makes Google discard the entire annotation cluster for
  // the page — including the ka↔en pair that does work.
  const includeArmenian =
    locale === "am" || hasArmenianVersion(stripArmenianPrefix(amPath) ?? "/");

  return {
    canonical,
    languages: {
      "ka-GE": georgianUrl,
      en: englishUrl,
      ...(includeArmenian ? { "hy-AM": armenianUrl, hy: armenianUrl } : {}),
      "x-default": englishUrl,
    },
  };
}

/**
 * Fallback social card for pages that define their own `openGraph` block.
 *
 * Next merges metadata **shallowly**: a page-level `openGraph` object replaces
 * the parent's wholesale, which silently drops the `images` that the root
 * `app/opengraph-image.tsx` contributes to the root segment. Pages therefore
 * have to restate an image or they ship with none, and every share of that URL
 * renders as a bare text link.
 *
 * Relative on purpose — `metadataBase` in the root layout is host-aware, so
 * this resolves to vivida.ge or vividaastro.com to match the domain served.
 * Pages with a tailored card (`/api/og/page?t=…`) should keep using it; this is
 * only the branded default for the rest.
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

/**
 * Resolve an English-site content link for whichever host is serving.
 */
export function englishSiteHref(path: string, onEnglishHost: boolean): string {
  if (onEnglishHost) return path;
  return `${ENGLISH_SITE_URL}${path === "/" ? "" : path}`;
}

/**
 * Resolve an Armenian-site content link for whichever host is serving.
 */
export function armenianSiteHref(path: string, onEnglishHost: boolean): string {
  const amPath = path.startsWith("/am") ? path : `/am${path === "/" ? "" : path}`;
  if (onEnglishHost) return amPath;
  return `${ENGLISH_SITE_URL}${amPath}`;
}

