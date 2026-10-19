import type { Metadata } from "next";

// Relative, not "@/": this module is imported by next.config.ts, which is
// loaded outside the app's tsconfig path aliases.
import { internationalPublicPath } from "./public-paths";

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
  | "/terms"
  | "/readings";

export type CoreEnglishInternalPath =
  "/en" | `/en${Exclude<CoreEnglishPath, "/">}`;

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
  {
    ka: "/zodiac/tavsebadoba",
    en: "/compatibility",
    internalEn: "/en/compatibility",
  },
  { ka: "/tests", en: "/tests", internalEn: "/en/tests" },
  { ka: "/privacy", en: "/privacy", internalEn: "/en/privacy" },
  { ka: "/terms", en: "/terms", internalEn: "/en/terms" },
];

export const ENGLISH_ONLY_ROUTES: ReadonlyArray<{
  en: CoreEnglishPath;
  internalEn: CoreEnglishInternalPath;
}> = [
  { en: "/about", internalEn: "/en/about" },
  // "How daily horoscopes work", an explainer with no Georgian equivalent.
  // It previously held the hreflang pair with the Georgian /horoskopi, but
  // that is the Georgian *daily hub*, whose real English counterpart is the
  // English daily-horoscope content from the shared /horoskopi route (publicly
  // exposed as /daily-horoscope, alongside /weekly- and /monthly-horoscope).
  // Pairing an explainer with a daily hub mismatched the content on both
  // sides and left the English daily hub with no counterpart at all.
  { en: "/horoscope", internalEn: "/en/horoscope" },
  // Insight Bazaar, English-only reader marketplace (no Georgian twin).
  { en: "/readings", internalEn: "/en/readings" },
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
    (p) =>
      p.ka === path ||
      p.en === normalized ||
      p.internalEn === path ||
      p.en === path,
  );
  if (found) return found.en;
  return internationalPublicPath(normalized);
}

function absoluteUrl(origin: string, path: string): string {
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Georgian-only pages (for example the Rosenberg self-esteem test) have no
 * English twin. Advertising an `en` alternate would point search engines at a
 * Georgian page on the English host, so these pages publish only `ka-GE` and
 * `x-default`, both on the Georgian host.
 */
export function georgianOnlyAlternates(
  canonicalPath: string,
): NonNullable<Metadata["alternates"]> {
  const url = absoluteUrl(GEORGIAN_SITE_URL, canonicalPath || "/");
  return {
    canonical: url,
    languages: {
      "ka-GE": url,
      "x-default": url,
    },
  };
}

/**
 * English-only pages (for example /about) have no Georgian twin, so both
 * `en` and `x-default` point at the English page. `x-default` only falls back
 * to English when no Georgian counterpart exists.
 */
export function englishOnlyAlternates(
  canonicalPath: string,
): NonNullable<Metadata["alternates"]> {
  const url = absoluteUrl(
    ENGLISH_SITE_URL,
    internationalPublicPath(canonicalPath || "/"),
  );
  return {
    canonical: url,
    languages: {
      en: url,
      "x-default": url,
    },
  };
}

/**
 * Cross-domain alternates for a page whose English version keeps the same
 * path on the English host. Used by ad landings that sit outside the `/en`
 * rewrite tree, so `/compatibility`-style aliases must not be inferred.
 */
export function samePathAlternates(
  path: string,
  locale: "ka" | "en" | string,
): NonNullable<Metadata["alternates"]> {
  const kaUrl = absoluteUrl(GEORGIAN_SITE_URL, path);
  const enUrl = absoluteUrl(ENGLISH_SITE_URL, path);
  return {
    canonical: locale === "en" ? enUrl : kaUrl,
    languages: {
      "ka-GE": kaUrl,
      en: enUrl,
      "x-default": kaUrl,
    },
  };
}

export function localizedAlternates(
  canonicalPath: string,
  pairedPath: string,
  locale: "ka" | "en" | string,
): NonNullable<Metadata["alternates"]> {
  const kaPath =
    locale === "ka"
      ? canonicalPath || "/"
      : (CORE_LANGUAGE_PAIRS.find(
          (p) =>
            p.en === publicEnglishPath(canonicalPath) ||
            p.internalEn === canonicalPath ||
            p.en === publicEnglishPath(pairedPath),
        )?.ka ?? pairedPath);

  const rawEnPath =
    locale === "en"
      ? publicEnglishPath(canonicalPath)
      : resolveEnglishPath(pairedPath);
  const enPath = internationalPublicPath(rawEnPath);

  const englishUrl = absoluteUrl(ENGLISH_SITE_URL, enPath);
  const georgianUrl = absoluteUrl(GEORGIAN_SITE_URL, kaPath);
  const canonical = locale === "en" ? englishUrl : georgianUrl;

  return {
    canonical,
    languages: {
      "ka-GE": georgianUrl,
      en: englishUrl,
      // Georgian is the brand default: unmatched languages land on the
      // Georgian page, which is the canonical entry point for the product.
      "x-default": georgianUrl,
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
 * Relative on purpose, `metadataBase` in the root layout is host-aware, so
 * this resolves to vivida.ge or vividaastro.com to match the domain served.
 * Pages with a tailored card (`/api/og/page?t=…`) should keep using it; this is
 * only the branded default for the rest.
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

/**
 * Resolve an English-site content link for whichever host is serving.
 */
export function englishSiteHref(path: string, onEnglishHost: boolean): string {
  const publicPath = internationalPublicPath(path);
  if (onEnglishHost) return publicPath;
  return `${ENGLISH_SITE_URL}${publicPath === "/" ? "" : publicPath}`;
}

/**
 * Georgian keyword landing pages that overlap an established English page.
 *
 * Serving the Georgian page on the international host would create a
 * language-mismatched, competing URL. A host-scoped permanent redirect keeps
 * the Georgian URLs intact on vivida.ge while consolidating English signals
 * on the existing canonical page.
 *
 * Lives here (not in next.config.ts) so the SEO suite can assert the
 * contract: every source must stay a 200 with Georgian copy on the Georgian
 * hosts and a 308 to its destination on the English hosts.
 */
export const ENGLISH_LEGACY_CONTENT_REDIRECTS = [
  // Renders the identical <NatalChartPageEn /> as /natal-chart, so on the
  // international host it was a straight duplicate of the canonical English
  // URL, two self-canonicalling copies competing for the same query. The
  // Georgian /nataluri-ruka is untouched: this is host-scoped.
  { source: "/nataluri-ruka", destination: "/natal-chart" },
  { source: "/piradi-ruka", destination: "/natal-chart" },
  {
    source: "/piradi-ruka/rogor-shevadginot",
    destination: "/natal-chart",
  },
  { source: "/piradi-horoskopi", destination: "/horoscope" },
  { source: "/mkitxaoba", destination: "/tarot" },
  { source: "/zodiac/tavsebadoba", destination: "/compatibility" },
] as const;
