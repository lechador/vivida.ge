import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Zodiac signs in canonical order (Aries = 0 ... Pisces = 11).
 * Names are stored in Georgian for direct rendering.
 */

export type ZodiacSign = {
  index: number;
  key: string; // canonical English key (lowercase)
  labelEn: string;
  labelKa: string;
  labelPl: string;
  symbol: string; // unicode glyph
  element: "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი";
  modality: "კარდინალური" | "ფიქსირებული" | "მუტაბელური";
  ruler: string; // ruling planet (Georgian)
  emoji: string;
};

export const SIGNS: ZodiacSign[] = [
  {
    index: 0,
    key: "aries",
    labelEn: "Aries",
    labelKa: "ვერძი",
    labelPl: "Baran",
    symbol: "♈",
    element: "ცეცხლი",
    modality: "კარდინალური",
    ruler: "მარსი",
    emoji: "🐏",
  },
  {
    index: 1,
    key: "taurus",
    labelEn: "Taurus",
    labelKa: "კურო",
    labelPl: "Byk",
    symbol: "♉",
    element: "მიწა",
    modality: "ფიქსირებული",
    ruler: "ვენერა",
    emoji: "🐂",
  },
  {
    index: 2,
    key: "gemini",
    labelEn: "Gemini",
    labelKa: "ტყუპები",
    labelPl: "Bliźnięta",
    symbol: "♊",
    element: "ჰაერი",
    modality: "მუტაბელური",
    ruler: "მერკური",
    emoji: "👯",
  },
  {
    index: 3,
    key: "cancer",
    labelEn: "Cancer",
    labelKa: "კირჩხიბი",
    labelPl: "Rak",
    symbol: "♋",
    element: "წყალი",
    modality: "კარდინალური",
    ruler: "მთვარე",
    emoji: "🦀",
  },
  {
    index: 4,
    key: "leo",
    labelEn: "Leo",
    labelKa: "ლომი",
    labelPl: "Lew",
    symbol: "♌",
    element: "ცეცხლი",
    modality: "ფიქსირებული",
    ruler: "მზე",
    emoji: "🦁",
  },
  {
    index: 5,
    key: "virgo",
    labelEn: "Virgo",
    labelKa: "ქალწული",
    labelPl: "Panna",
    symbol: "♍",
    element: "მიწა",
    modality: "მუტაბელური",
    ruler: "მერკური",
    emoji: "🌾",
  },
  {
    index: 6,
    key: "libra",
    labelEn: "Libra",
    labelKa: "სასწორი",
    labelPl: "Waga",
    symbol: "♎",
    element: "ჰაერი",
    modality: "კარდინალური",
    ruler: "ვენერა",
    emoji: "⚖️",
  },
  {
    index: 7,
    key: "scorpio",
    labelEn: "Scorpio",
    labelKa: "მორიელი",
    labelPl: "Skorpion",
    symbol: "♏",
    element: "წყალი",
    modality: "ფიქსირებული",
    ruler: "პლუტონი",
    emoji: "🦂",
  },
  {
    index: 8,
    key: "sagittarius",
    labelEn: "Sagittarius",
    labelKa: "მშვილდოსანი",
    labelPl: "Strzelec",
    symbol: "♐",
    element: "ცეცხლი",
    modality: "მუტაბელური",
    ruler: "იუპიტერი",
    emoji: "🏹",
  },
  {
    index: 9,
    key: "capricorn",
    labelEn: "Capricorn",
    labelKa: "თხის რქა",
    labelPl: "Koziorożec",
    symbol: "♑",
    element: "მიწა",
    modality: "კარდინალური",
    ruler: "სატურნი",
    emoji: "🐐",
  },
  {
    index: 10,
    key: "aquarius",
    labelEn: "Aquarius",
    labelKa: "მერწყული",
    labelPl: "Wodnik",
    symbol: "♒",
    element: "ჰაერი",
    modality: "ფიქსირებული",
    ruler: "ურანი",
    emoji: "🏺",
  },
  {
    index: 11,
    key: "pisces",
    labelEn: "Pisces",
    labelKa: "თევზები",
    labelPl: "Ryby",
    symbol: "♓",
    element: "წყალი",
    modality: "მუტაბელური",
    ruler: "ნეპტუნი",
    emoji: "🐟",
  },
];

export function signFromLongitude(longitude: number): ZodiacSign {
  const norm = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(norm / 30)];
}

export function signByLabelEn(label: string): ZodiacSign | undefined {
  const k = label.toLowerCase();
  return SIGNS.find((s) => s.key === k);
}

export function signByKey(key: string): ZodiacSign | undefined {
  const k = key.toLowerCase();
  return SIGNS.find((s) => s.key === k);
}

export function signByIndex(i: number): ZodiacSign {
  return SIGNS[((i % 12) + 12) % 12];
}

export function signLabel(sign: ZodiacSign, locale: UserLocale): string {
  if (locale === "pl") return sign.labelPl;
  if (locale === "en") return sign.labelEn;
  return sign.labelKa;
}

export function signName(index: number, locale: UserLocale): string {
  return signLabel(signByIndex(index), locale);
}

export type ZodiacElementKa = ZodiacSign["element"];
export type ZodiacModalityKa = ZodiacSign["modality"];

export const ELEMENT_LABELS_PL: Record<ZodiacElementKa, string> = {
  ცეცხლი: "Ogień",
  მიწა: "Ziemia",
  ჰაერი: "Powietrze",
  წყალი: "Woda",
};

export const ELEMENT_LABELS_EN: Record<ZodiacElementKa, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

const EN_TO_KA_ELEMENT: Record<string, ZodiacElementKa> = {
  fire: "ცეცხლი",
  earth: "მიწა",
  air: "ჰაერი",
  water: "წყალი",
};

export function elementLabel(
  element: ZodiacElementKa | "fire" | "earth" | "air" | "water" | string,
  locale: UserLocale,
): string {
  const kaKey = (EN_TO_KA_ELEMENT[element.toLowerCase()] ??
    element) as ZodiacElementKa;
  if (locale === "pl") return ELEMENT_LABELS_PL[kaKey] ?? element;
  if (locale === "en") return ELEMENT_LABELS_EN[kaKey] ?? element;
  return kaKey;
}

export const MODALITY_LABELS_PL: Record<ZodiacModalityKa, string> = {
  კარდინალური: "Kardynalny",
  ფიქსირებული: "Stały",
  მუტაბელური: "Zmienny",
};

export const MODALITY_LABELS_EN: Record<ZodiacModalityKa, string> = {
  კარდინალური: "Cardinal",
  ფიქსირებული: "Fixed",
  მუტაბელური: "Mutable",
};

const EN_TO_KA_MODALITY: Record<string, ZodiacModalityKa> = {
  cardinal: "კარდინალური",
  fixed: "ფიქსირებული",
  mutable: "მუტაბელური",
};

export function modalityLabel(
  modality: ZodiacModalityKa | "cardinal" | "fixed" | "mutable" | string,
  locale: UserLocale,
): string {
  const kaKey = (EN_TO_KA_MODALITY[modality.toLowerCase()] ??
    modality) as ZodiacModalityKa;
  if (locale === "pl") return MODALITY_LABELS_PL[kaKey] ?? modality;
  if (locale === "en") return MODALITY_LABELS_EN[kaKey] ?? modality;
  return kaKey;
}

/**
 * Element-keyed accent color for visual treatments. Mirrors ELEMENT_META
 * in components/dashboard/elements-card.tsx but lives here so unrelated
 * components (sign badge, etc.) can pull it without depending on the
 * elements card module.
 */
const ELEMENT_COLOR: Record<ZodiacSign["element"], string> = {
  ცეცხლი: "oklch(0.72 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.78 0.16 220)",
  წყალი: "oklch(0.65 0.20 285)",
};

export function signColor(sign: ZodiacSign): string {
  return ELEMENT_COLOR[sign.element];
}

/**
 * Planet / luminary metadata.
 * Keys match the canonical lowercase names used by the chart engine.
 */
export type CelestialBody = {
  key: string;
  labelKa: string;
  labelEn: string;
  labelPl: string;
  symbol: string;
  emoji: string;
  /** display order on the dashboard */
  order: number;
  meaningKa: string;
  meaningEn: string;
  meaningPl: string;
};

export const BODIES: Record<string, CelestialBody> = {
  sun: {
    key: "sun",
    labelKa: "მზე",
    labelEn: "Sun",
    labelPl: "Słońce",
    symbol: "☉",
    emoji: "☀️",
    order: 0,
    meaningKa: "ბირთვი, იდენტობა, სიცოცხლის ცეცხლი",
    meaningEn: "core identity, vitality and purpose",
    meaningPl: "rdzeń tożsamości, witalność i cel",
  },
  moon: {
    key: "moon",
    labelKa: "მთვარე",
    labelEn: "Moon",
    labelPl: "Księżyc",
    symbol: "☽",
    emoji: "🌙",
    order: 1,
    meaningKa: "ემოციები, შინაგანი სამყარო, ინსტინქტები",
    meaningEn: "emotions, instincts and inner life",
    meaningPl: "emocje, instynkty i świat wewnętrzny",
  },
  ascendant: {
    key: "ascendant",
    labelKa: "ამომავალი",
    labelEn: "Ascendant",
    labelPl: "Ascendent",
    symbol: "AC",
    emoji: "⬆️",
    order: 2,
    meaningKa: "სოციალური ნიღაბი, პირველი შთაბეჭდილება",
    meaningEn: "first impressions and outward style",
    meaningPl: "pierwsze wrażenie i styl zewnętrzny",
  },
  mercury: {
    key: "mercury",
    labelKa: "მერკური",
    labelEn: "Mercury",
    labelPl: "Merkury",
    symbol: "☿",
    emoji: "☿",
    order: 3,
    meaningKa: "გონება, აზროვნება, კომუნიკაცია",
    meaningEn: "thinking, learning and communication",
    meaningPl: "myślenie, nauka i komunikacja",
  },
  venus: {
    key: "venus",
    labelKa: "ვენერა",
    labelEn: "Venus",
    labelPl: "Wenus",
    symbol: "♀",
    emoji: "♀",
    order: 4,
    meaningKa: "სიყვარული, სილამაზე, ღირებულებები",
    meaningEn: "love, attraction, beauty and values",
    meaningPl: "miłość, przyciąganie, piękno i wartości",
  },
  mars: {
    key: "mars",
    labelKa: "მარსი",
    labelEn: "Mars",
    labelPl: "Mars",
    symbol: "♂",
    emoji: "♂",
    order: 5,
    meaningKa: "მოქმედება, ენერგია, ვნება",
    meaningEn: "action, drive, energy and desire",
    meaningPl: "działanie, napęd, energia i pragnienia",
  },
  jupiter: {
    key: "jupiter",
    labelKa: "იუპიტერი",
    labelEn: "Jupiter",
    labelPl: "Jowisz",
    symbol: "♃",
    emoji: "♃",
    order: 6,
    meaningKa: "ზრდა, შესაძლებლობები, ფილოსოფია",
    meaningEn: "growth, opportunity and perspective",
    meaningPl: "wzrost, szanse i perspektywa",
  },
  saturn: {
    key: "saturn",
    labelKa: "სატურნი",
    labelEn: "Saturn",
    labelPl: "Saturn",
    symbol: "♄",
    emoji: "♄",
    order: 7,
    meaningKa: "დისციპლინა, საზღვრები, ხანგრძლივი მიზანი",
    meaningEn: "discipline, boundaries and long-term growth",
    meaningPl: "dyscyplina, granice i długoterminowy rozwój",
  },
  uranus: {
    key: "uranus",
    labelKa: "ურანი",
    labelEn: "Uranus",
    labelPl: "Uran",
    symbol: "♅",
    emoji: "♅",
    order: 8,
    meaningKa: "ცვლილება, თავისუფლება, უცხო",
    meaningEn: "change, freedom and innovation",
    meaningPl: "zmiana, wolność i innowacja",
  },
  neptune: {
    key: "neptune",
    labelKa: "ნეპტუნი",
    labelEn: "Neptune",
    labelPl: "Neptun",
    symbol: "♆",
    emoji: "♆",
    order: 9,
    meaningKa: "ოცნება, ინტუიცია, წარმოსახვა",
    meaningEn: "dreams, intuition and imagination",
    meaningPl: "marzenia, intuicja i wyobraźnia",
  },
  pluto: {
    key: "pluto",
    labelKa: "პლუტონი",
    labelEn: "Pluto",
    labelPl: "Pluton",
    symbol: "♇",
    emoji: "♇",
    order: 10,
    meaningKa: "ტრანსფორმაცია, ძალა, განახლება",
    meaningEn: "transformation, power and renewal",
    meaningPl: "transformacja, moc i odrodzenie",
  },
  midheaven: {
    key: "midheaven",
    labelKa: "ზენიტი",
    labelEn: "Midheaven",
    labelPl: "Medium Coeli",
    symbol: "MC",
    emoji: "⬆️",
    order: 11,
    meaningKa: "კარიერა, საზოგადოებრივი იმიჯი",
    meaningEn: "career, reputation and public direction",
    meaningPl: "kariera, reputacja i kierunek społeczny",
  },
  chiron: {
    key: "chiron",
    labelKa: "ქირონი",
    labelEn: "Chiron",
    labelPl: "Chiron",
    symbol: "⚷",
    emoji: "⚷",
    order: 12,
    meaningKa: "შინაგანი ჭრილობა, განკურნება, სიბრძნე ტკივილიდან",
    meaningEn: "wounds, healing and hard-won wisdom",
    meaningPl: "wewnętrzna rana, uzdrowienie i mądrość",
  },
};

export function bodyMeta(key: string): CelestialBody | undefined {
  return BODIES[key.toLowerCase()];
}

export function bodyLabel(
  keyOrBody: string | CelestialBody,
  locale: UserLocale,
): string {
  const body = typeof keyOrBody === "string" ? bodyMeta(keyOrBody) : keyOrBody;
  if (!body) return typeof keyOrBody === "string" ? keyOrBody : "";
  if (locale === "pl") return body.labelPl;
  if (locale === "en") return body.labelEn;
  return body.labelKa;
}

export function bodyName(key: string, locale: UserLocale): string {
  return bodyLabel(key, locale);
}

export const PL_SIGN_GENITIVE: Record<string, string> = {
  aries: "Barana",
  taurus: "Byka",
  gemini: "Bliźniąt",
  cancer: "Raka",
  leo: "Lwa",
  virgo: "Panny",
  libra: "Wagi",
  scorpio: "Skorpiona",
  sagittarius: "Strzelca",
  capricorn: "Koziorożca",
  aquarius: "Wodnika",
  pisces: "Ryb",
};

export const PL_SIGN_LOCATIVE: Record<string, string> = {
  aries: "w Baranie",
  taurus: "w Byku",
  gemini: "w Bliźniętach",
  cancer: "w Raku",
  leo: "w Lwie",
  virgo: "w Pannie",
  libra: "w Wadze",
  scorpio: "w Skorpionie",
  sagittarius: "w Strzelcu",
  capricorn: "w Koziorożcu",
  aquarius: "w Wodniku",
  pisces: "w Rybach",
};

export function plSignGenitive(signKey: string): string {
  return PL_SIGN_GENITIVE[signKey.toLowerCase()] ?? signKey;
}

export function plSignLocative(signKey: string): string {
  return PL_SIGN_LOCATIVE[signKey.toLowerCase()] ?? `w ${signKey}`;
}

export function signLocative(
  signOrKey: ZodiacSign | string,
  locale: UserLocale,
): string {
  const sign = typeof signOrKey === "string" ? signByKey(signOrKey) : signOrKey;
  if (!sign) {
    if (typeof signOrKey === "string" && locale === "pl")
      return plSignLocative(signOrKey);
    return typeof signOrKey === "string" ? signOrKey : "";
  }
  if (locale === "pl") return plSignLocative(sign.key);
  if (locale === "en") return `in ${sign.labelEn}`;
  // Georgian locative: ვერძში, კუროში, etc.
  const name = sign.labelKa;
  if (name.endsWith("ი")) return `${name.slice(0, -1)}ში`;
  return `${name}ში`;
}

export function signGenitive(
  signOrKey: ZodiacSign | string,
  locale: UserLocale,
): string {
  const sign = typeof signOrKey === "string" ? signByKey(signOrKey) : signOrKey;
  if (!sign) {
    if (typeof signOrKey === "string" && locale === "pl")
      return plSignGenitive(signOrKey);
    return typeof signOrKey === "string" ? signOrKey : "";
  }
  if (locale === "pl") return plSignGenitive(sign.key);
  if (locale === "en") return `${sign.labelEn}'s`;
  const name = sign.labelKa;
  if (name.endsWith("ი") || name.endsWith("ა")) return `${name.slice(0, -1)}ის`;
  return `${name}ს`;
}

export const ASPECT_LABELS_PL: Record<string, string> = {
  conjunction: "koniunkcja",
  opposition: "opozycja",
  trine: "trygon",
  square: "kwadratura",
  sextile: "sekstyl",
  quincunx: "inkoniunkcja",
  semisextile: "półsekstyl",
  semisquare: "półkwadratura",
  sesquiquadrate: "półtorakwadratura",
};

/**
 * Format a degree-within-sign as 24° 35′ for display.
 */
export function formatDegree(degreeWithinSign: number): string {
  const d = Math.floor(degreeWithinSign);
  const m = Math.floor((degreeWithinSign - d) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}′`;
}
