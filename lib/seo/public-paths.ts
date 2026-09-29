/**
 * Public URL vocabulary for the international site.
 *
 * The shared App Router tree intentionally keeps its established Georgian
 * route names so vivida.ge never moves. vividaastro.com exposes these clean
 * public paths and the proxy rewrites them back to the shared internal tree.
 */
const PATH_PREFIXES = [
  ["/zodiac/tavsebadoba", "/zodiac/compatibility"],
  ["/horoskopi/kvireuli", "/weekly-horoscope"],
  ["/horoskopi/tviuri", "/monthly-horoscope"],
  ["/horoskopi", "/daily-horoscope"],
  ["/siyvarulis-horoskopi", "/love-horoscope"],
  ["/finansuri-horoskopi", "/money-horoscope"],
  ["/karieris-horoskopi", "/career-horoscope"],
  ["/astrologiuri-kalendari", "/astrology-calendar"],
  ["/ighbliani-dgheebi", "/lucky-days"],
  ["/frtxili-dgheebi", "/challenging-days"],
  ["/mtvaris-kalendari", "/moon-calendar"],
  ["/savse-mtvare", "/full-moon"],
  ["/akhali-mtvare", "/new-moon"],
  ["/dabnelebebi", "/eclipses"],
  ["/merkuri-retrogradi", "/mercury-retrograde"],
  ["/chinuri-horoskopi", "/chinese-zodiac"],
  ["/sizmris-akhsna", "/dream-meanings"],
  ["/numerologia", "/numerology"],
  ["/angeluri-ricxvebi", "/angel-numbers"],
  ["/emociuri-inteleqti", "/emotional-intelligence"],
  ["/astrologiuri-saxlebi", "/astrology-houses"],
  ["/planetebi", "/astrology-planets"],
  ["/zodiac/reitingebi", "/zodiac/rankings"],
  ["/zodiac/mtvare", "/zodiac/moon-sign"],
  ["/zodiac/amomavali", "/zodiac/rising-sign"],
  ["/zodiac/elementebi", "/zodiac/elements"],
  ["/zodiac/datit", "/zodiac/dates"],
  ["/zodiac/gzamkvlevi", "/zodiac/guide"],
  ["/pirovnebis-testi", "/personality-test"],
  ["/iq-testi", "/iq-test"],
  ["/eq-testi", "/eq-test"],
  ["/quiz/namdvili-nishani", "/quiz/true-zodiac-sign"],
  ["/quiz/varskvlavebis-zodiaqo", "/quiz/celebrity-zodiac"],
  ["/taro", "/tarot"],
] as const;

// These legacy hubs intentionally consolidate on the existing core
// compatibility page. They are one-way aliases: /compatibility must stay a
// real app/en + app/am route rather than rewrite back into the shared tree.
const EXACT_PUBLIC_ALIASES = [
  ["/tavsebadoba", "/compatibility"],
  ["/zodiac/tavsebadoba", "/compatibility"],
] as const;

const HOROSCOPE_VIEW_SEGMENTS = [
  ["dghes", "today-horoscope"],
  ["khval", "tomorrow-horoscope"],
  ["kviris-horoskopi", "weekly-horoscope"],
  ["tvis-horoskopi", "monthly-horoscope"],
  ["momavali-kviris-horoskopi", "next-week-horoscope"],
  ["momavali-tvis-horoskopi", "next-month-horoscope"],
] as const;

function normalize(path: string): string {
  if (!path || path === "/") return "/";
  const value = path.startsWith("/") ? path : `/${path}`;
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

function mapPathname(
  value: string,
  mapper: (pathname: string) => string,
): string {
  const suffixIndex = value.search(/[?#]/);
  const pathname = suffixIndex === -1 ? value : value.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : value.slice(suffixIndex);
  return `${mapper(normalize(pathname))}${suffix}`;
}

function replacePrefix(
  path: string,
  entries: ReadonlyArray<readonly [string, string]>,
): string {
  for (const [from, to] of entries) {
    if (path === from) return to;
    if (path.startsWith(`${from}/`)) return `${to}${path.slice(from.length)}`;
  }
  return path;
}

function replaceHoroscopeView(
  path: string,
  entries: ReadonlyArray<readonly [string, string]>,
): string {
  const parts = path.split("/");
  if (parts.length !== 4 || parts[1] !== "zodiac") return path;
  const match = entries.find(([from]) => from === parts[3]);
  if (!match) return path;
  parts[3] = match[1];
  return parts.join("/");
}

/** Shared internal (Georgian) route -> international public route. */
export function internationalPublicPath(path: string): string {
  return mapPathname(path, (normalized) => {
    const alias = EXACT_PUBLIC_ALIASES.find(
      ([legacy]) => legacy === normalized,
    );
    if (alias) return alias[1];
    return replaceHoroscopeView(
      replacePrefix(normalized, PATH_PREFIXES),
      HOROSCOPE_VIEW_SEGMENTS,
    );
  });
}

/** International public route -> shared internal (Georgian) route. */
export function internationalInternalPath(path: string): string {
  const prefixEntries = PATH_PREFIXES.map(
    ([legacy, clean]) => [clean, legacy] as const,
  );
  const viewEntries = HOROSCOPE_VIEW_SEGMENTS.map(
    ([legacy, clean]) => [clean, legacy] as const,
  );
  return mapPathname(path, (normalized) =>
    replacePrefix(replaceHoroscopeView(normalized, viewEntries), prefixEntries),
  );
}

export function isInternationalLegacyPath(path: string): boolean {
  const normalized = normalize(path);
  return internationalPublicPath(normalized) !== normalized;
}

export function isInternationalCleanPath(path: string): boolean {
  const normalized = normalize(path);
  return internationalInternalPath(normalized) !== normalized;
}

/**
 * Resolve a shared-tree path to the href a locale should render: Georgian
 * renders the tree as-is, English renders the public English-readable
 * vocabulary (rewritten back internally by the proxy).
 */
export function localizedHref(path: string, locale?: "ka" | "en"): string {
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
    path.startsWith("/u/")
  ) {
    return path;
  }
  if (locale === "en") return internationalPublicPath(path);
  return path;
}
