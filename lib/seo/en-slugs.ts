/**
 * English and Polish URL slugs for clusters whose internal route slugs are
 * Georgian transliterations (dreams, EQ articles, planets).
 *
 * Georgian URLs are UNTOUCHED, same slug, same canonical, same content.
 * On English and Polish hosts these pages additionally resolve at keyword-rich
 * localized slugs (canonical there), and the old transliterated URL
 * resolves as a fallback.
 *
 * Zero imports on purpose: next.config.ts imports this file with a relative
 * path (outside the tsconfig `@/` alias), so it must stay dependency-free.
 */

export type SlugPair = {
  /** Internal slug, also the Georgian public slug. Never changes. */
  ka: string;
  /** English public slug. Must be unique within its cluster. */
  en: string;
  /** Polish public slug. Clean ASCII hyphenated, unique within its cluster. */
  pl: string;
};

function buildIndexes(pairs: SlugPair[]) {
  const enByKa = new Map(pairs.map((p) => [p.ka, p.en]));
  const kaByEn = new Map(pairs.map((p) => [p.en, p.ka]));
  const plByKa = new Map(pairs.map((p) => [p.ka, p.pl]));
  const kaByPl = new Map(pairs.map((p) => [p.pl, p.ka]));
  return { enByKa, kaByEn, plByKa, kaByPl };
}

/** Dream symbols: /sizmris-akhsna/<ka> → /dream-meanings/<en> or /pl/sennik/<pl>. */
export const DREAM_EN_SLUGS: SlugPair[] = [
  { ka: "gveli", en: "snake", pl: "waz" },
  { ka: "wyali", en: "water", pl: "woda" },
  { ka: "kbili", en: "teeth-falling-out", pl: "wypadajace-zeby" },
  { ka: "micvalebuli", en: "deceased-loved-one", pl: "zmarla-bliska-osoba" },
  { ka: "orsuloba", en: "pregnancy", pl: "ciaza" },
  { ka: "bavshvi", en: "baby", pl: "dziecko" },
  { ka: "qorwili", en: "wedding", pl: "slub" },
  { ka: "sisxli", en: "blood", pl: "krew" },
  { ka: "tevzi", en: "fish", pl: "ryba" },
  { ka: "fuli", en: "money", pl: "pieniadze" },
  { ka: "oqro", en: "gold", pl: "zloto" },
  { ka: "cecxli", en: "fire", pl: "ogien" },
  { ka: "saxli", en: "house", pl: "dom" },
  { ka: "kari", en: "door", pl: "drzwi" },
  { ka: "gza", en: "road", pl: "droga" },
  { ka: "manqana", en: "car", pl: "samochod" },
  { ka: "frena", en: "flying", pl: "latanie" },
  { ka: "dacema", en: "falling", pl: "spadanie" },
  { ka: "devna", en: "being-chased", pl: "ucieczka" },
  { ka: "sikvdili", en: "death", pl: "smierc" },
  { ka: "zgva", en: "sea", pl: "morze" },
  { ka: "wvima", en: "rain", pl: "deszcz" },
  { ka: "tovli", en: "snow", pl: "snieg" },
  { ka: "tma", en: "hair", pl: "wlosy" },
  { ka: "sarke", en: "mirror", pl: "lustro" },
  { ka: "kibe", en: "stairs", pl: "schody" },
  { ka: "dzagli", en: "playful-dog", pl: "przyjazny-pies" },
  { ka: "kata", en: "cat", pl: "kot" },
  { ka: "cxeni", en: "horse", pl: "kon" },
  { ka: "tagvi", en: "mouse", pl: "mysz" },
  { ka: "oboba", en: "spider", pl: "pajak" },
  { ka: "futkari", en: "bee", pl: "pszczola" },
  { ka: "yvavilebi", en: "flowers", pl: "kwiaty" },
  { ka: "puri", en: "bread", pl: "chleb" },
  { ka: "eklesia", en: "church", pl: "kosciol" },
  { ka: "tirili", en: "crying", pl: "placz" },
  { ka: "bechedi", en: "ring", pl: "pierscionek" },
  { ka: "dzroxa", en: "cow", pl: "krowa" },
  { ka: "mze", en: "sun", pl: "slonce" },
  { ka: "mtvare", en: "moon", pl: "ksiezyc" },
  { ka: "varskvlavi", en: "star", pl: "gwiazda" },
  { ka: "mdinare", en: "river", pl: "rzeka" },
  { ka: "cha", en: "well", pl: "studnia" },
  { ka: "karishkhali", en: "storm", pl: "burza" },
  { ka: "micisdzvra", en: "earthquake", pl: "trzesienie-ziemi" },
  { ka: "kvamli", en: "smoke", pl: "dym" },
  { ka: "nisli", en: "fog", pl: "mgla" },
  { ka: "bagi", en: "garden", pl: "ogrod" },
  { ka: "tye", en: "forest", pl: "las" },
  { ka: "xe", en: "tree", pl: "drzewo" },
  { ka: "vashli", en: "apple", pl: "jablko" },
  { ka: "yurdzeni", en: "grapes", pl: "winogrona" },
  { ka: "ghvino", en: "wine", pl: "wino" },
  { ka: "tapli", en: "honey", pl: "miod" },
  { ka: "mgeli", en: "wolf", pl: "wilk" },
  { ka: "dzaghli", en: "dog", pl: "pies" },
  { ka: "lomi", en: "lion", pl: "lew" },
  { ka: "datvi", en: "bear", pl: "niedzwiedz" },
  { ka: "txa", en: "goat", pl: "koza" },
  { ka: "cxvari", en: "sheep", pl: "owca" },
  { ka: "qatami", en: "chicken", pl: "kura" },
  { ka: "kvercxi", en: "egg", pl: "jajko" },
  { ka: "rdze", en: "milk", pl: "mleko" },
  { ka: "gamocda", en: "exam", pl: "egzamin" },
  { ka: "omi", en: "war", pl: "wojna" },
  { ka: "dana", en: "knife", pl: "noz" },
];

/** EQ articles: /emociuri-inteleqti/<ka> → /emotional-intelligence/<en> or /pl/inteligencja-emocjonalna/<pl>. */
export const EQ_EN_SLUGS: SlugPair[] = [
  {
    ka: "ra-aris-emociuri-inteleqti",
    en: "what-is-eq",
    pl: "co-to-jest-inteligencja-emocjonalna",
  },
  {
    ka: "rogor-avimaghlo-empathia",
    en: "how-to-build-empathy",
    pl: "jak-rozwinac-empatie",
  },
  {
    ka: "aqtiuri-mosmena",
    en: "active-listening",
    pl: "aktywne-sluchanie",
  },
  {
    ka: "tvitshgmecnebis-ganvitareba",
    en: "developing-self-awareness",
    pl: "rozwijanie-samoswiadomosci",
  },
  {
    ka: "emociuri-dghiuri",
    en: "emotional-journal",
    pl: "dziennik-emocji",
  },
  {
    ka: "emociis-martva",
    en: "how-to-regulate-emotions",
    pl: "regulacja-emocji",
  },
  {
    ka: "suntqva-da-grounding",
    en: "breathing-and-grounding",
    pl: "oddychanie-i-uziemienie",
  },
  {
    ka: "sibradzis-martva",
    en: "anger-management",
    pl: "radzenie-sobie-ze-zloscia",
  },
  {
    ka: "shinagani-motivacia",
    en: "intrinsic-motivation",
    pl: "wewnetrzna-motywacja",
  },
  {
    ka: "prokrastinaciis-dadzleva",
    en: "overcoming-procrastination",
    pl: "jak-pokonac-prokrastynacje",
  },
  {
    ka: "konfliqtis-martva",
    en: "conflict-management",
    pl: "rozwiazywanie-konfliktow",
  },
  {
    ka: "asertiuli-komunikacia",
    en: "assertive-communication",
    pl: "asertywna-komunikacja",
  },
  {
    ka: "emociuri-inteleqti-urtiertobebshi",
    en: "eq-in-relationships",
    pl: "inteligencja-emocjonalna-w-zwiazku",
  },
  {
    ka: "emociuri-inteleqti-samsaxurshi",
    en: "eq-at-work",
    pl: "inteligencja-emocjonalna-w-pracy",
  },
  {
    ka: "eq-da-iq-gansxvaveba",
    en: "eq-vs-iq",
    pl: "eq-a-iq-roznice",
  },
];

/** Planets: /planetebi/<ka> → /astrology-planets/<en> or /pl/planety-w-astrologii/<pl>. */
export const PLANET_EN_SLUGS: SlugPair[] = [
  { ka: "mze", en: "sun", pl: "slonce" },
  { ka: "mtvare", en: "moon", pl: "ksiezyc" },
  { ka: "merkuri", en: "mercury", pl: "merkury" },
  { ka: "venera", en: "venus", pl: "wenus" },
  { ka: "marsi", en: "mars", pl: "mars" },
  { ka: "iupiteri", en: "jupiter", pl: "jowisz" },
  { ka: "saturni", en: "saturn", pl: "saturn" },
  { ka: "urani", en: "uranus", pl: "uran" },
  { ka: "neptuni", en: "neptune", pl: "neptun" },
  { ka: "plutoni", en: "pluto", pl: "pluton" },
];

const dreamIndexes = buildIndexes(DREAM_EN_SLUGS);
const eqIndexes = buildIndexes(EQ_EN_SLUGS);
const planetIndexes = buildIndexes(PLANET_EN_SLUGS);

export type SlugLocale = "ka" | "en" | "pl";

/**
 * Resolve a URL slug segment to the internal (Georgian) slug.
 * - Georgian host: only the internal slug resolves (English/Polish slugs 404).
 * - Polish host: resolves from kaByPl (falling back to kaByEn and internal ka slug).
 * - English host: the English slug resolves, with fallback to internal slug.
 */
function resolveSlug(
  input: string,
  locale: SlugLocale,
  indexes: ReturnType<typeof buildIndexes>,
  isInternalSlug: (slug: string) => boolean,
): string | null {
  if (locale === "ka") return isInternalSlug(input) ? input : null;
  if (locale === "pl") {
    const fromPl = indexes.kaByPl.get(input);
    if (fromPl) return fromPl;
    const fromEn = indexes.kaByEn.get(input);
    if (fromEn) return fromEn;
    return isInternalSlug(input) ? input : null;
  }
  const fromEn = indexes.kaByEn.get(input);
  if (fromEn) return fromEn;
  return isInternalSlug(input) ? input : null;
}

/** The slug to render in links for this locale (English and Polish get keywords). */
function publicSlug(
  kaSlug: string,
  locale: SlugLocale,
  indexes: ReturnType<typeof buildIndexes>,
): string {
  if (locale === "pl") return indexes.plByKa.get(kaSlug) ?? kaSlug;
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

/** Detail slugs for generateStaticParams. */
export const ALL_DREAM_EN_SLUGS = DREAM_EN_SLUGS.map((p) => p.en);
export const ALL_EQ_EN_SLUGS = EQ_EN_SLUGS.map((p) => p.en);
export const ALL_PLANET_EN_SLUGS = PLANET_EN_SLUGS.map((p) => p.en);

export const ALL_DREAM_PL_SLUGS = DREAM_EN_SLUGS.map((p) => p.pl);
export const ALL_EQ_PL_SLUGS = EQ_EN_SLUGS.map((p) => p.pl);
export const ALL_PLANET_PL_SLUGS = PLANET_EN_SLUGS.map((p) => p.pl);

const DETAIL_PREFIXES: Array<{ prefix: string; pairs: SlugPair[] }> = [
  { prefix: "/dream-meanings/", pairs: DREAM_EN_SLUGS },
  { prefix: "/emotional-intelligence/", pairs: EQ_EN_SLUGS },
  { prefix: "/astrology-planets/", pairs: PLANET_EN_SLUGS },
];

const PL_DETAIL_PREFIXES: Array<{ prefix: string; pairs: SlugPair[] }> = [
  { prefix: "/pl/sennik/", pairs: DREAM_EN_SLUGS },
  { prefix: "/pl/inteligencja-emocjonalna/", pairs: EQ_EN_SLUGS },
  { prefix: "/pl/planety-w-astrologii/", pairs: PLANET_EN_SLUGS },
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
    const match = pairs.find((p) => p.ka === rest || p.pl === rest);
    return match ? `${prefix}${match.en}` : cleanPath;
  }
  return cleanPath;
}

/**
 * Upgrade a Polish detail URL carrying a Georgian (`ka`) or English (`en`)
 * slug to its canonical Polish keyword slug
 * (`/pl/sennik/gveli` or `/pl/sennik/snake` → `/pl/sennik/waz`).
 */
export function upgradePolishDetailSlug(cleanPath: string): string {
  for (const { prefix, pairs } of PL_DETAIL_PREFIXES) {
    if (!cleanPath.startsWith(prefix)) continue;
    const rest = cleanPath.slice(prefix.length);
    if (!rest || rest.includes("/")) return cleanPath;
    const match = pairs.find((p) => p.ka === rest || p.en === rest);
    return match ? `${prefix}${match.pl}` : cleanPath;
  }
  return cleanPath;
}
