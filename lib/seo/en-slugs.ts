/**
 * English URL slugs for clusters whose internal route slugs are Georgian
 * transliterations (dreams, EQ articles, planets).
 *
 * Georgian URLs are UNTOUCHED — same slug, same canonical, same content.
 * On the English host these pages additionally resolve at a keyword-rich
 * English slug (canonical there), and the old transliterated English URL
 * 308-redirects to it (host-scoped, see next.config.ts).
 *
 * Zero imports on purpose: next.config.ts imports this file with a relative
 * path (outside the tsconfig `@/` alias), so it must stay dependency-free.
 */

export type SlugPair = {
  /** Internal slug — also the Georgian public slug. Never changes. */
  ka: string;
  /** English public slug. Must be unique within its cluster. */
  en: string;
};

function buildIndexes(pairs: SlugPair[]) {
  const enByKa = new Map(pairs.map((p) => [p.ka, p.en]));
  const kaByEn = new Map(pairs.map((p) => [p.en, p.ka]));
  return { enByKa, kaByEn };
}

/** Dream symbols: /sizmris-akhsna/<ka> → /dream-meanings/<en>. */
export const DREAM_EN_SLUGS: SlugPair[] = [
  { ka: "gveli", en: "snake" },
  { ka: "wyali", en: "water" },
  { ka: "kbili", en: "teeth-falling-out" },
  { ka: "micvalebuli", en: "deceased-loved-one" },
  { ka: "orsuloba", en: "pregnancy" },
  { ka: "bavshvi", en: "baby" },
  { ka: "qorwili", en: "wedding" },
  { ka: "sisxli", en: "blood" },
  { ka: "tevzi", en: "fish" },
  { ka: "fuli", en: "money" },
  { ka: "oqro", en: "gold" },
  { ka: "cecxli", en: "fire" },
  { ka: "saxli", en: "house" },
  { ka: "kari", en: "door" },
  { ka: "gza", en: "road" },
  { ka: "manqana", en: "car" },
  { ka: "frena", en: "flying" },
  { ka: "dacema", en: "falling" },
  { ka: "devna", en: "being-chased" },
  { ka: "sikvdili", en: "death" },
  { ka: "zgva", en: "sea" },
  { ka: "wvima", en: "rain" },
  { ka: "tovli", en: "snow" },
  { ka: "tma", en: "hair" },
  { ka: "sarke", en: "mirror" },
  { ka: "kibe", en: "stairs" },
  { ka: "dzagli", en: "playful-dog" },
  { ka: "kata", en: "cat" },
  { ka: "cxeni", en: "horse" },
  { ka: "tagvi", en: "mouse" },
  { ka: "oboba", en: "spider" },
  { ka: "futkari", en: "bee" },
  { ka: "yvavilebi", en: "flowers" },
  { ka: "puri", en: "bread" },
  { ka: "eklesia", en: "church" },
  { ka: "tirili", en: "crying" },
  { ka: "bechedi", en: "ring" },
  { ka: "dzroxa", en: "cow" },
  { ka: "mze", en: "sun" },
  { ka: "mtvare", en: "moon" },
  { ka: "varskvlavi", en: "star" },
  { ka: "mdinare", en: "river" },
  { ka: "cha", en: "well" },
  { ka: "karishkhali", en: "storm" },
  { ka: "micisdzvra", en: "earthquake" },
  { ka: "kvamli", en: "smoke" },
  { ka: "nisli", en: "fog" },
  { ka: "bagi", en: "garden" },
  { ka: "tye", en: "forest" },
  { ka: "xe", en: "tree" },
  { ka: "vashli", en: "apple" },
  { ka: "yurdzeni", en: "grapes" },
  { ka: "ghvino", en: "wine" },
  { ka: "tapli", en: "honey" },
  { ka: "mgeli", en: "wolf" },
  { ka: "dzaghli", en: "dog" },
  { ka: "lomi", en: "lion" },
  { ka: "datvi", en: "bear" },
  { ka: "txa", en: "goat" },
  { ka: "cxvari", en: "sheep" },
  { ka: "qatami", en: "chicken" },
  { ka: "kvercxi", en: "egg" },
  { ka: "rdze", en: "milk" },
  { ka: "gamocda", en: "exam" },
  { ka: "omi", en: "war" },
  { ka: "dana", en: "knife" },
];

/** EQ articles: /emociuri-inteleqti/<ka> → /emotional-intelligence/<en>. */
export const EQ_EN_SLUGS: SlugPair[] = [
  { ka: "ra-aris-emociuri-inteleqti", en: "what-is-eq" },
  { ka: "rogor-avimaghlo-empathia", en: "how-to-build-empathy" },
  { ka: "aqtiuri-mosmena", en: "active-listening" },
  { ka: "tvitshgmecnebis-ganvitareba", en: "developing-self-awareness" },
  { ka: "emociuri-dghiuri", en: "emotional-journal" },
  { ka: "emociis-martva", en: "how-to-regulate-emotions" },
  { ka: "suntqva-da-grounding", en: "breathing-and-grounding" },
  { ka: "sibradzis-martva", en: "anger-management" },
  { ka: "shinagani-motivacia", en: "intrinsic-motivation" },
  { ka: "prokrastinaciis-dadzleva", en: "overcoming-procrastination" },
  { ka: "konfliqtis-martva", en: "conflict-management" },
  { ka: "asertiuli-komunikacia", en: "assertive-communication" },
  { ka: "emociuri-inteleqti-urtiertobebshi", en: "eq-in-relationships" },
  { ka: "emociuri-inteleqti-samsaxurshi", en: "eq-at-work" },
  { ka: "eq-da-iq-gansxvaveba", en: "eq-vs-iq" },
];

/** Planets: /planetebi/<ka> → /astrology-planets/<en>. */
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

const dreamIndexes = buildIndexes(DREAM_EN_SLUGS);
const eqIndexes = buildIndexes(EQ_EN_SLUGS);
const planetIndexes = buildIndexes(PLANET_EN_SLUGS);

export type SlugLocale = "ka" | "en";

/**
 * Resolve a URL slug segment to the internal (Georgian) slug.
 * - Georgian host: only the internal slug resolves (English slugs 404 —
 *   Georgian URLs never move).
 * - English host: the English slug resolves, and the internal slug still
 *   resolves as a fallback (the host-scoped 308 in next.config.ts sends it
 *   to the canonical English URL before the page renders).
 */
function resolveSlug(
  input: string,
  locale: SlugLocale,
  indexes: ReturnType<typeof buildIndexes>,
  isInternalSlug: (slug: string) => boolean,
): string | null {
  if (locale === "ka") return isInternalSlug(input) ? input : null;
  const fromEn = indexes.kaByEn.get(input);
  if (fromEn) return fromEn;
  return isInternalSlug(input) ? input : null;
}

/** The slug to render in links for this locale (English gets keywords). */
function publicSlug(
  kaSlug: string,
  locale: SlugLocale,
  indexes: ReturnType<typeof buildIndexes>,
): string {
  if (locale === "en") return indexes.enByKa.get(kaSlug) ?? kaSlug;
  return kaSlug;
}

export function resolveDreamSlug(
  input: string,
  locale: SlugLocale,
  isInternalSlug: (slug: string) => boolean,
): string | null {
  return resolveSlug(input, locale, dreamIndexes, isInternalSlug);
}

export function dreamPublicSlug(kaSlug: string, locale: SlugLocale): string {
  return publicSlug(kaSlug, locale, dreamIndexes);
}

export function resolveEqSlug(
  input: string,
  locale: SlugLocale,
  isInternalSlug: (slug: string) => boolean,
): string | null {
  return resolveSlug(input, locale, eqIndexes, isInternalSlug);
}

export function eqPublicSlug(kaSlug: string, locale: SlugLocale): string {
  return publicSlug(kaSlug, locale, eqIndexes);
}

export function resolvePlanetSlug(
  input: string,
  locale: SlugLocale,
  isInternalSlug: (slug: string) => boolean,
): string | null {
  return resolveSlug(input, locale, planetIndexes, isInternalSlug);
}

export function planetPublicSlug(kaSlug: string, locale: SlugLocale): string {
  return publicSlug(kaSlug, locale, planetIndexes);
}

/** English detail slugs for generateStaticParams. */
export const ALL_DREAM_EN_SLUGS = DREAM_EN_SLUGS.map((p) => p.en);
export const ALL_EQ_EN_SLUGS = EQ_EN_SLUGS.map((p) => p.en);
export const ALL_PLANET_EN_SLUGS = PLANET_EN_SLUGS.map((p) => p.en);

const DETAIL_PREFIXES: Array<{ prefix: string; pairs: SlugPair[] }> = [
  { prefix: "/dream-meanings/", pairs: DREAM_EN_SLUGS },
  { prefix: "/emotional-intelligence/", pairs: EQ_EN_SLUGS },
  { prefix: "/astrology-planets/", pairs: PLANET_EN_SLUGS },
];

/**
 * Upgrade an already-clean English detail URL carrying a legacy
 * transliterated slug to its keyword slug
 * (`/dream-meanings/gveli` → `/dream-meanings/snake`).
 * Identity for hubs, unknown slugs, and nested paths.
 *
 * Used by proxy.ts so the legacy→clean 308 and the slug upgrade collapse
 * into a single hop (`/sizmris-akhsna/gveli` → `/dream-meanings/snake`).
 */
export function upgradeEnglishDetailSlug(cleanPath: string): string {
  for (const { prefix, pairs } of DETAIL_PREFIXES) {
    if (!cleanPath.startsWith(prefix)) continue;
    const rest = cleanPath.slice(prefix.length);
    if (!rest || rest.includes("/")) return cleanPath;
    const match = pairs.find((p) => p.ka === rest);
    return match ? `${prefix}${match.en}` : cleanPath;
  }
  return cleanPath;
}
