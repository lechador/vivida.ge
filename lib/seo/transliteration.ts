/**
 * Curated Latin-letter Georgian search variants for the public zodiac
 * pages. Many Georgians type queries on a Latin/QWERTY keyboard without
 * switching layout — "vercis horoskopi", "tavsebadoba", "zodiaqos
 * nishnebi" — so Search Console shows zero hits for our pages on those
 * queries even though we rank well for the ქართული equivalents.
 *
 * Solution: surface the Latin variants on the actual page HTML (Google
 * indexes whatever bytes are there) plus emit them as `alternateName` in
 * structured data. We do NOT hide or stuff — each variant is shown to
 * users as a "ხშირი ძიებები" / popular searches strip, often as real
 * internal links so the keyword presence doubles as link signal.
 *
 * Keep each bundle short (~10-14 entries) and stay honest: no fake
 * synonyms, no off-topic keywords. Search engines penalize spammy
 * footers.
 */

import type { ElementSlug, ZodiacSlug } from "./zodiac-dates";

/** Latin spellings used in real Georgian search-on-QWERTY queries. */
export const SIGN_LATIN_NAMES: Record<ZodiacSlug, string[]> = {
  aries: ["verci", "vercis", "verdzi"],
  taurus: ["kuro", "kuros"],
  gemini: ["tyupebi", "tyupebis"],
  cancer: ["kirchkhibi", "kirchxibi", "kirchkhibis"],
  leo: ["lomi", "lomis"],
  virgo: ["qalwuli", "qalwulis"],
  libra: ["sastsori", "saswori", "sastsoris"],
  scorpio: ["morieli", "morielis"],
  sagittarius: ["mshvildosani", "mshvildosnis"],
  capricorn: ["txis rqa", "tkhis rqa", "txis rqis"],
  aquarius: ["mertskvuli", "merwyuli", "merqwuli"],
  pisces: ["tevzebi", "tevzebis"],
};

export const ELEMENT_LATIN_NAMES: Record<ElementSlug, string[]> = {
  fire: ["tsetskhli", "cecxli", "cecxlis nishnebi"],
  earth: ["mitsa", "mica", "micis nishnebi"],
  air: ["haeri", "haeris nishnebi"],
  water: ["tskhali", "wyali", "wylis nishnebi"],
};

/** Generic, evergreen Georgian-on-Latin queries. */
const GENERIC_QUERIES = [
  "zodiaqos nishnebi",
  "horoskopi",
  "astrologia qartulad",
  "chemi nishani",
  "ra zodiaqos nishani var",
  "tarighi da nishani",
  "tavsebadoba",
  "siyvarulis tavsebadoba",
  "nishnebis tavsebadoba",
];

/** Hub page (`/zodiac`). */
export const HUB_LATIN_QUERIES = [
  ...GENERIC_QUERIES,
  "12 zodiaqos nishani",
  "zodiaqos nishnebi qartulad",
  "astrologiuri prognozi",
  "natalia qarta",
  "sashobio ruka",
];

/** Sign detail page (`/zodiac/[sign]`). */
export function signPageLatinQueries(sign: ZodiacSlug): string[] {
  const [primary, secondary] = SIGN_LATIN_NAMES[sign];
  return [
    `${primary}is nishani`,
    `${primary}is horoskopi`,
    `${primary}is tavsebadoba`,
    `${primary}is xasiati`,
    `${primary}is qali`,
    `${primary}is kaci`,
    `${primary}is dghis horoskopi`,
    `${primary}is tarighi`,
    secondary ? `${secondary}` : null,
    "zodiaqos nishnebi",
    "chemi nishani",
    "horoskopi qartulad",
    "tavsebadoba",
  ].filter((s): s is string => Boolean(s));
}

/** Daily horoscope hub (`/horoskopi`). */
export const HOROSKOPI_HUB_LATIN_QUERIES = [
  "horoskopi",
  "dgis horoskopi",
  "dghis horoskopi",
  "dgevandeli horoskopi",
  "xvalindeli horoskopi",
  "horoskopi qartulad",
  "zodiaqos nishnebi horoskopi",
  "astrologiuri prognozi",
  "kviris horoskopi",
  "tvis horoskopi",
];

/** Weekly / monthly horoscope hubs (`/horoskopi/kvireuli|tviuri`). */
export const PERIOD_HUB_LATIN_QUERIES: Record<"week" | "month", string[]> = {
  week: [
    "kviris horoskopi",
    "kvireuli horoskopi",
    "am kviris horoskopi",
    "horoskopi",
    "horoskopi qartulad",
    "zodiaqos nishnebi",
  ],
  month: [
    "tvis horoskopi",
    "tviuri horoskopi",
    "am tvis horoskopi",
    "yoveltviuri horoskopi",
    "horoskopi",
    "horoskopi qartulad",
    "zodiaqos nishnebi",
  ],
};

/** Per-sign horoscope views (`/zodiac/[sign]/dgis-horoskopi` etc.). */
export function signHoroscopeLatinQueries(sign: ZodiacSlug): string[] {
  const [primary, secondary] = SIGN_LATIN_NAMES[sign];
  return [
    `${primary}is horoskopi`,
    `${primary} horoskopi`,
    `${primary}is dghis horoskopi`,
    secondary ? `${secondary} horoskopi` : null,
    "dgis horoskopi",
    "horoskopi",
    "horoskopi qartulad",
  ].filter((s): s is string => Boolean(s));
}

/** Tarot cluster (`/taro`). */
export const TAROT_LATIN_QUERIES = [
  "taro",
  "taro qartulad",
  "onlain taro",
  "taros gashla",
  "taro kitxva",
  "taro cards",
  "taro kartebi",
  "ufaso taro",
  "taro gashla onlain",
  "astrologia qartulad",
];

/** Numerology cluster (`/numerologia`). */
export const NUMEROLOGY_LATIN_QUERIES = [
  "numerologia",
  "bedis ricxvi",
  "bedis rickhvi",
  "bedis ricxvis gamotvla",
  "cxovrebis gzis ricxvi",
  "numerologia qartulad",
  "ricxvebis mnishvneloba",
  "master ricxvebi",
];

/** Mercury retrograde page (`/merkuri-retrogradi`). */
export const RETROGRADE_LATIN_QUERIES = [
  "merkuri retrogradshi",
  "retrograduli merkuri",
  "merkuri retrogradi",
  "merkuris retrogradi 2026",
  "retrogradi ras nishnavs",
  "planetebis retrogradi",
  "horoskopi",
  "astrologia qartulad",
];

/** By-date page (`/zodiac/datit`). */
export const BY_DATE_LATIN_QUERIES = [
  "zodiaqos nishani datit",
  "ra nishani var datit",
  "raodenis nishania",
  "chemi zodiaqos nishani",
  "datit nishnis gageba",
  "raodenis nishani var",
  "raodenis nishani",
  "tarighi da zodiaqos nishani",
  "horoskopi datit",
  "vis ra nishani gaqvs",
];

/** Compatibility hub (`/zodiac/tavsebadoba`). */
export const COMPAT_HUB_LATIN_QUERIES = [
  "tavsebadoba",
  "nishnebis tavsebadoba",
  "siyvarulis tavsebadoba",
  "zodiaqos tavsebadoba",
  "tavsebadoba nishnebis mikhedvit",
  "siyvarulis test",
  "ra nishans uxdeba",
  "sauketeso wyvili nishnebshi",
];

/** Compatibility pair page (`/zodiac/tavsebadoba/[pair]`). */
export function pairPageLatinQueries(
  a: ZodiacSlug,
  b: ZodiacSlug
): string[] {
  const la = SIGN_LATIN_NAMES[a][0];
  const lb = SIGN_LATIN_NAMES[b][0];
  return [
    `${la} da ${lb} tavsebadoba`,
    `${la}is da ${lb}is tavsebadoba`,
    `${la} ${lb} siyvaruli`,
    `${la}is da ${lb}is wyvili`,
    `${la} da ${lb}`,
    "tavsebadoba",
    "siyvarulis tavsebadoba",
    "nishnebis tavsebadoba",
  ];
}

/** Elements hub (`/zodiac/elementebi`). */
export const ELEMENTS_HUB_LATIN_QUERIES = [
  "zodiaqos elementebi",
  "cecxlis nishnebi",
  "micis nishnebi",
  "haeris nishnebi",
  "wylis nishnebi",
  "elementebi astrologiashi",
  "ra elementia chemi nishani",
  "4 elementi",
];

/** Element detail (`/zodiac/elementebi/[el]`). */
export function elementPageLatinQueries(el: ElementSlug): string[] {
  const variants = ELEMENT_LATIN_NAMES[el];
  return [
    ...variants.map((v) => `${v} nishani`),
    `${variants[0]}is nishnebi`,
    "zodiaqos elementebi",
    "ra elementia chemi nishani",
    "elementebi astrologiashi",
    "cecxlis micis haeris wylis nishnebi",
  ];
}

/** Moon-sign page (`/zodiac/mtvare/[sign]`). */
export function moonPageLatinQueries(sign: ZodiacSlug): string[] {
  const la = SIGN_LATIN_NAMES[sign][0];
  return [
    "mtvaris nishani",
    "chemi mtvaris nishani",
    `mtvare ${la}shi`,
    `${la}is mtvare`,
    "rogor gavigo mtvaris nishani",
    "mtvare astrologiashi",
    "natalia qarta",
  ];
}

/** Rising-sign page (`/zodiac/amomavali/[sign]`). */
export function risingPageLatinQueries(sign: ZodiacSlug): string[] {
  const la = SIGN_LATIN_NAMES[sign][0];
  return [
    "amomavali nishani",
    "chemi amomavali nishani",
    `amomavali ${la}`,
    `${la} amomavali`,
    "rogor gavigo amomavali nishani",
    "ascendant qartulad",
    "natalia qarta",
  ];
}

/** Daily-guide hub (`/zodiac/gzamkvlevi`). */
export const GUIDE_LATIN_QUERIES = [
  "dghis horoskopi",
  "kvireuli horoskopi",
  "horoskopi qartulad",
  "astrologiuri prognozi",
  "chemi dghis horoskopi",
  "vivida horoskopi",
];

/** Yearly horoscope page (`/zodiac/[sign]/[year]`). */
export function yearlyPageLatinQueries(
  sign: ZodiacSlug,
  year: number
): string[] {
  const la = SIGN_LATIN_NAMES[sign][0];
  return [
    `${la}is horoskopi ${year}`,
    `${la}is welitsdis horoskopi`,
    `horoskopi ${year}`,
    `${la} ${year}`,
    `${la}is prognozi ${year}`,
    "weliwdis horoskopi",
    "astrologiuri prognozi",
    "chemi welitsdis horoskopi",
  ];
}
