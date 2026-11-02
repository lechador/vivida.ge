import type { UserLocale } from "@/lib/i18n/locale";

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

export const PL_PATH_PREFIXES = [
  ["/zodiac/tavsebadoba", "/pl/horoskop-partnerski"],
  ["/horoskopi/kvireuli", "/pl/horoskop-tygodniowy"],
  ["/horoskopi/tviuri", "/pl/horoskop-miesieczny"],
  ["/horoskopi", "/pl/horoskop-dzienny"],
  ["/siyvarulis-horoskopi", "/pl/horoskop-milosny"],
  ["/finansuri-horoskopi", "/pl/horoskop-finansowy"],
  ["/karieris-horoskopi", "/pl/horoskop-kariery"],
  ["/astrologiuri-kalendari", "/pl/kalendarz-astrologiczny"],
  ["/ighbliani-dgheebi", "/pl/szczesliwe-dni"],
  ["/frtxili-dgheebi", "/pl/trudne-dni"],
  ["/mtvaris-kalendari", "/pl/kalendarz-ksiezycowy"],
  ["/savse-mtvare", "/pl/pelnia-ksiezyca"],
  ["/akhali-mtvare", "/pl/now-ksiezyca"],
  ["/dabnelebebi", "/pl/zacmienia"],
  ["/merkuri-retrogradi", "/pl/retrogradacja-merkurego"],
  ["/chinuri-horoskopi", "/pl/horoskop-chinski"],
  ["/sizmris-akhsna", "/pl/sennik"],
  ["/numerologia", "/pl/numerologia"],
  ["/angeluri-ricxvebi", "/pl/liczby-anielskie"],
  ["/emociuri-inteleqti", "/pl/inteligencja-emocjonalna"],
  ["/astrologiuri-saxlebi", "/pl/domy-astrologiczne"],
  ["/planetebi", "/pl/planety-w-astrologii"],
  ["/zodiac/reitingebi", "/pl/znaki-zodiaku/rankingi"],
  ["/zodiac/mtvare", "/pl/znaki-zodiaku/znak-ksiezyca"],
  ["/zodiac/amomavali", "/pl/znaki-zodiaku/ascendent"],
  ["/zodiac/elementebi", "/pl/znaki-zodiaku/zywioly"],
  ["/zodiac/datit", "/pl/znaki-zodiaku/daty"],
  ["/zodiac/gzamkvlevi", "/pl/znaki-zodiaku/przewodnik"],
  ["/zodiac", "/pl/znaki-zodiaku"],
  ["/pirovnebis-testi", "/pl/test-osobowosci"],
  ["/iq-testi", "/pl/test-iq"],
  ["/eq-testi", "/pl/test-eq"],
  ["/quiz/namdvili-nishani", "/pl/quiz/prawdziwy-znak-zodiaku"],
  ["/quiz/varskvlavebis-zodiaqo", "/pl/quiz/zodiak-gwiazd"],
  ["/tvit-shepasebis-testi", "/pl/test-samooceny"],
  ["/big-five", "/pl/big-five"],
  ["/taro", "/pl/tarot"],
  ["/nataluri-ruka", "/pl/horoskop-urodzeniowy"],
] as const;

export const PL_EXACT_PUBLIC_ALIASES = [
  ["/tavsebadoba", "/pl/horoskop-partnerski"],
  ["/zodiac/tavsebadoba", "/pl/horoskop-partnerski"],
  ["/compatibility", "/pl/horoskop-partnerski"],
  ["/en/compatibility", "/pl/horoskop-partnerski"],
  ["/", "/pl"],
  ["/en", "/pl"],
  ["/about", "/pl/about"],
  ["/en/about", "/pl/about"],
  ["/tests", "/pl/tests"],
  ["/en/tests", "/pl/tests"],
  ["/privacy", "/pl/privacy"],
  ["/en/privacy", "/pl/privacy"],
  ["/terms", "/pl/terms"],
  ["/en/terms", "/pl/terms"],
  ["/readings", "/pl/readings"],
  ["/en/readings", "/pl/readings"],
] as const;

export const PL_HOROSCOPE_VIEW_SEGMENTS = [
  ["dghes", "horoskop-na-dzis"],
  ["khval", "horoskop-na-jutro"],
  ["kviris-horoskopi", "horoskop-tygodniowy"],
  ["tvis-horoskopi", "horoskop-miesieczny"],
  ["momavali-kviris-horoskopi", "horoskop-na-kolejny-tydzien"],
  ["momavali-tvis-horoskopi", "horoskop-na-kolejny-miesiac"],
] as const;

export const PL_CORE_INTERNAL_MAP: Record<string, string> = {
  "/pl": "/en",
  "/pl/about": "/en/about",
  "/pl/compatibility": "/en/compatibility",
  "/pl/horoskop-partnerski": "/en/compatibility",
  "/pl/tests": "/en/tests",
  "/pl/privacy": "/en/privacy",
  "/pl/terms": "/en/terms",
  "/pl/readings": "/en/readings",
};

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
  zodiacSegment = "zodiac",
): string {
  const parts = path.split("/");
  const zodiacIdx = parts.indexOf(zodiacSegment);
  if (zodiacIdx === -1 || parts.length !== zodiacIdx + 3) return path;
  const viewIdx = zodiacIdx + 2;
  const match = entries.find(([from]) => from === parts[viewIdx]);
  if (!match) return path;
  parts[viewIdx] = match[1];
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

/** Shared internal route -> Polish public route. */
export function polishPublicPath(path: string): string {
  return mapPathname(path, (normalized) => {
    const alias = PL_EXACT_PUBLIC_ALIASES.find(
      ([legacy]) => legacy === normalized,
    );
    if (alias) return alias[1];
    const prefixed = replacePrefix(normalized, PL_PATH_PREFIXES);
    return replaceHoroscopeView(
      prefixed,
      PL_HOROSCOPE_VIEW_SEGMENTS,
      "znaki-zodiaku",
    );
  });
}

/** Polish public route -> shared internal route. */
export function polishInternalPath(path: string): string {
  const prefixEntries = PL_PATH_PREFIXES.map(
    ([legacy, clean]) => [clean, legacy] as const,
  );
  const viewEntries = PL_HOROSCOPE_VIEW_SEGMENTS.map(
    ([legacy, clean]) => [clean, legacy] as const,
  );
  return mapPathname(path, (normalized) => {
    if (normalized in PL_CORE_INTERNAL_MAP) {
      return PL_CORE_INTERNAL_MAP[normalized];
    }
    const withView = replaceHoroscopeView(
      normalized,
      viewEntries,
      "znaki-zodiaku",
    );
    return replacePrefix(withView, prefixEntries);
  });
}

export function isInternationalLegacyPath(path: string): boolean {
  const normalized = normalize(path);
  return internationalPublicPath(normalized) !== normalized;
}

export function isInternationalCleanPath(path: string): boolean {
  const normalized = normalize(path);
  return internationalInternalPath(normalized) !== normalized;
}

export function isPolishPath(path: string): boolean {
  const normalized = normalize(path);
  return normalized === "/pl" || normalized.startsWith("/pl/");
}

/**
 * Resolve a shared-tree path to the href a locale should render: Georgian
 * renders the tree as-is, English renders the public English-readable
 * vocabulary (rewritten back internally by the proxy), Polish renders
 * the public Polish vocabulary under `/pl`.
 */
export function localizedHref(path: string, locale?: UserLocale): string {
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
  if (locale === "pl") return polishPublicPath(path);
  if (locale === "en") return internationalPublicPath(path);
  return path;
}
