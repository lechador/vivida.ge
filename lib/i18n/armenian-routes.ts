/**
 * Armenian lives at a path prefix, not a host.
 *
 * Georgian and English each own a domain, so `lib/seo/locales.ts` can resolve
 * their locale from the Host header alone. Armenian shares vividaastro.com with
 * English and is distinguished by a leading `/am`, which no header carries —
 * `proxy.ts` is the only place in the request lifecycle that can still see the
 * pathname, so it translates the prefix into `LOCALE_HEADER` for the server
 * components downstream. Everything here is edge-safe: no db, no node built-ins.
 */

export const ARMENIAN_PREFIX = "/am";

/** Request header `proxy.ts` writes so `getRequestLocale()` can read the prefix. */
export const LOCALE_HEADER = "x-vivida-locale";

/**
 * The routes served by real files under `app/am/**`, mirroring `app/en/**`.
 *
 * These keep English slugs (`/natal-chart`, not `/nataluri-ruka`) exactly as
 * their English twins do, and they must NOT be rewritten onto the shared
 * Georgian tree — `/am/natal-chart` would strip to `/natal-chart`, which only
 * exists under `app/en`, and `/am/about` would strip to a route that does not
 * exist in the Georgian tree at all. The long tail is the opposite case: it
 * sits at Georgian slugs on every locale, so it rewrites.
 */
export const ARMENIAN_CORE_ROUTES = [
  "/",
  "/about",
  "/compatibility",
  "/horoscope",
  "/natal-chart",
  "/privacy",
  "/terms",
  "/tests",
  "/zodiac",
] as const;

const CORE_ROUTE_SET: ReadonlySet<string> = new Set(ARMENIAN_CORE_ROUTES);

/**
 * `/am/zodiac/vergo` → `/zodiac/vergo`, `/am` → `/`, anything else → null.
 *
 * Returns null rather than throwing so callers can treat "not an Armenian URL"
 * as the ordinary case it is.
 */
export function stripArmenianPrefix(pathname: string): string | null {
  if (pathname === ARMENIAN_PREFIX) return "/";
  if (pathname === `${ARMENIAN_PREFIX}/`) return "/";
  if (pathname.startsWith(`${ARMENIAN_PREFIX}/`)) {
    return pathname.slice(ARMENIAN_PREFIX.length);
  }
  return null;
}

import type { UserLocale } from "@/lib/i18n/user-locale";

/** `/zodiac/vergo` → `/am/zodiac/vergo`, `/` → `/am`. Idempotent. */
export function withArmenianPrefix(path: string): string {
  if (path === ARMENIAN_PREFIX || path.startsWith(`${ARMENIAN_PREFIX}/`)) {
    return path;
  }
  if (path === "/" || path === "") return ARMENIAN_PREFIX;
  return `${ARMENIAN_PREFIX}${path}`;
}

/**
 * Prefix an internal content href for the locale being rendered.
 * Leaves absolute URLs, API routes, auth routes, and authenticated surfaces untouched.
 */
export function localeHref(path: string, locale?: UserLocale): string {
  if (locale !== "am") return path;
  if (
    !path ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#")
  ) {
    return path;
  }
  if (
    path.startsWith("/api/") ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/account") ||
    path.startsWith("/feed") ||
    path.startsWith("/messages") ||
    path.startsWith("/friends") ||
    path.startsWith("/people") ||
    path.startsWith("/subscription") ||
    path.startsWith("/credits") ||
    path.startsWith("/admin") ||
    path.startsWith("/u/")
  ) {
    return path;
  }
  return withArmenianPrefix(path);
}

/**
 * Does this de-prefixed path have a page under `app/am/**`?
 *
 * Only these are exempt from the proxy rewrite. Long-tail Armenian pages are
 * *not* listed here — they render from the shared route tree and so must be
 * rewritten, not passed through.
 */
export function isArmenianCoreRoute(strippedPath: string): boolean {
  return CORE_ROUTE_SET.has(strippedPath);
}

const ARMENIAN_HOROSCOPE_SIGN_SLUGS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

const ARMENIAN_HOROSCOPE_VIEW_PATHS = [
  "dghes",
  "khval",
  "kviris-horoskopi",
  "tvis-horoskopi",
  "momavali-kviris-horoskopi",
  "momavali-tvis-horoskopi",
] as const;

/**
 * Long-tail paths in the shared route tree that render Armenian.
 *
 * Exact paths, and prefixes for the dynamic clusters where *every* child is
 * translated. Grows as translated clusters land; nothing may be added here
 * before the Armenian branch of that route actually renders.
 */
const ARMENIAN_CONTENT_PATHS: ReadonlySet<string> = new Set<string>([
  "/zodiac/aries",
  "/zodiac/taurus",
  "/zodiac/gemini",
  "/zodiac/cancer",
  "/zodiac/leo",
  "/zodiac/virgo",
  "/zodiac/libra",
  "/zodiac/scorpio",
  "/zodiac/sagittarius",
  "/zodiac/capricorn",
  "/zodiac/aquarius",
  "/zodiac/pisces",
  "/horoskopi/kvireuli",
  "/horoskopi/tviuri",
  "/siyvarulis-horoskopi",
  "/finansuri-horoskopi",
  "/karieris-horoskopi",
  "/tavsebadoba",
  "/taro",
  "/mbti",
  "/sizmris-akhsna",
  "/numerologia",
  "/angeluri-ricxvebi",
  "/chinuri-horoskopi",
  "/mtvaris-kalendari",
  "/savse-mtvare",
  "/akhali-mtvare",
  "/astrologiuri-kalendari",
  "/ighbliani-dgheebi",
  "/frtxili-dgheebi",
  "/dabnelebebi",
  "/merkuri-retrogradi",
  "/zodiac/reitingebi",
  "/emociuri-inteleqti",
  "/astrologiuri-saxlebi",
  "/planetebi",
  "/horoskopi",
  "/zodiac/mtvare",
  "/zodiac/amomavali",
  "/zodiac/elementebi",
  "/zodiac/datit",
  "/zodiac/gzamkvlevi",
  "/features",
  "/how-it-works",
  "/quiz/namdvili-nishani",
  "/quiz/varskvlavebis-zodiaqo",
  ...ARMENIAN_HOROSCOPE_SIGN_SLUGS.flatMap((sign) =>
    ARMENIAN_HOROSCOPE_VIEW_PATHS.map(
      (viewPath) => `/zodiac/${sign}/${viewPath}`,
    ),
  ),
  ...ARMENIAN_HOROSCOPE_SIGN_SLUGS.map((sign) => `/zodiac/${sign}/2026`),
]);

const ARMENIAN_CONTENT_PREFIXES: readonly string[] = [
  "/siyvarulis-horoskopi/",
  "/finansuri-horoskopi/",
  "/karieris-horoskopi/",
  "/zodiac/tavsebadoba/",
  "/taro/",
  "/mbti/",
  "/sizmris-akhsna/",
  "/numerologia/",
  "/angeluri-ricxvebi/",
  "/chinuri-horoskopi/",
  "/savse-mtvare/",
  "/akhali-mtvare/",
  "/astrologiuri-kalendari/",
  "/dabnelebebi/",
  "/zodiac/reitingebi/",
  "/emociuri-inteleqti/",
  "/astrologiuri-saxlebi/",
  "/planetebi/",
  "/zodiac/mtvare/",
  "/zodiac/amomavali/",
  "/zodiac/elementebi/",
];

/**
 * Should this path advertise an Armenian hreflang alternate?
 *
 * hreflang is a claim that the counterpart exists. Emitting `hy-AM` for a URL
 * that 404s is worse than emitting nothing: Google drops the whole annotation
 * cluster for the page, taking the working ka↔en pair down with it. So the
 * default is no Armenian alternate, and a route opts in only once translated.
 */
export function hasArmenianVersion(path: string): boolean {
  const normalized = path === "" ? "/" : path;
  if (CORE_ROUTE_SET.has(normalized)) return true;
  if (ARMENIAN_CONTENT_PATHS.has(normalized)) return true;
  return ARMENIAN_CONTENT_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix),
  );
}
