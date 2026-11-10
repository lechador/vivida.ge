/**
 * Single source of truth for which `/pl` URLs actually render Polish.
 *
 * Polish launched only partly translated. Every other `/pl/*` URL falls back
 * to Georgian/English content that canonicalizes elsewhere, and Google drops
 * hreflang clusters whose targets canonicalize away from themselves (which
 * also takes the ka <-> en pairs down with them). So `pl` hreflang, `/pl`
 * sitemap entries and the `/pl` proxy routing all gate on this list.
 *
 * Grow it only when a route renders real Polish with a self-canonical.
 * Everything else under `/pl` 308-redirects to its English twin.
 */

const ZODIAC_SIGNS = [
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

/** Exact public paths (no children). */
export const POLISH_READY_EXACT: ReadonlySet<string> = new Set([
  "/pl",
  "/pl/horoskop-urodzeniowy",
  "/pl/tests",
  "/pl/horoskop-dzienny",
  "/pl/test-osobowosci",
  "/pl/test-iq",
  "/pl/test-eq",
  "/pl/big-five",
  "/pl/test-samooceny",
  "/pl/tarot",
  "/pl/horoskop-partnerski",
  "/pl/kalendarz-ksiezycowy",
  "/pl/quiz/prawdziwy-znak-zodiaku",
  "/pl/quiz/zodiak-gwiazd",
  // Sign pages only; the znaki-zodiaku hub and deeper pages are not Polish yet.
  ...ZODIAC_SIGNS.map((sign) => `/pl/znaki-zodiaku/${sign}`),
]);

/** Fully translated sections: the hub and every page below it. */
export const POLISH_READY_PREFIXES: readonly string[] = [
  "/pl/sennik",
  "/pl/liczby-anielskie",
  "/pl/numerologia",
];

/** True when `path` (a public `/pl...` path, no origin) renders Polish. */
export function isPolishReadyPath(path: string): boolean {
  const suffix = path.search(/[?#]/);
  let pathname = suffix === -1 ? path : path.slice(0, suffix);
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (POLISH_READY_EXACT.has(pathname)) return true;
  return POLISH_READY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
