/**
 * Zodiac signs in canonical order (Aries = 0 ... Pisces = 11).
 * Names are stored in Georgian for direct rendering.
 */

export type ZodiacSign = {
  index: number;
  key: string; // canonical English key (lowercase)
  labelEn: string;
  labelKa: string;
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

export function signByIndex(i: number): ZodiacSign {
  return SIGNS[((i % 12) + 12) % 12];
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
  symbol: string;
  emoji: string;
  /** display order on the dashboard */
  order: number;
  meaningKa: string;
  meaningEn: string;
};

export const BODIES: Record<string, CelestialBody> = {
  sun: {
    key: "sun",
    labelKa: "მზე",
    labelEn: "Sun",
    symbol: "☉",
    emoji: "☀️",
    order: 0,
    meaningKa: "ბირთვი, იდენტობა, სიცოცხლის ცეცხლი",
    meaningEn: "core identity, vitality and purpose",
  },
  moon: {
    key: "moon",
    labelKa: "მთვარე",
    labelEn: "Moon",
    symbol: "☽",
    emoji: "🌙",
    order: 1,
    meaningKa: "ემოციები, შინაგანი სამყარო, ინსტინქტები",
    meaningEn: "emotions, instincts and inner life",
  },
  ascendant: {
    key: "ascendant",
    labelKa: "ამომავალი",
    labelEn: "Ascendant",
    symbol: "AC",
    emoji: "⬆️",
    order: 2,
    meaningKa: "სოციალური ნიღაბი, პირველი შთაბეჭდილება",
    meaningEn: "first impressions and outward style",
  },
  mercury: {
    key: "mercury",
    labelKa: "მერკური",
    labelEn: "Mercury",
    symbol: "☿",
    emoji: "☿",
    order: 3,
    meaningKa: "გონება, აზროვნება, კომუნიკაცია",
    meaningEn: "thinking, learning and communication",
  },
  venus: {
    key: "venus",
    labelKa: "ვენერა",
    labelEn: "Venus",
    symbol: "♀",
    emoji: "♀",
    order: 4,
    meaningKa: "სიყვარული, სილამაზე, ღირებულებები",
    meaningEn: "love, attraction, beauty and values",
  },
  mars: {
    key: "mars",
    labelKa: "მარსი",
    labelEn: "Mars",
    symbol: "♂",
    emoji: "♂",
    order: 5,
    meaningKa: "მოქმედება, ენერგია, ვნება",
    meaningEn: "action, drive, energy and desire",
  },
  jupiter: {
    key: "jupiter",
    labelKa: "იუპიტერი",
    labelEn: "Jupiter",
    symbol: "♃",
    emoji: "♃",
    order: 6,
    meaningKa: "ზრდა, შესაძლებლობები, ფილოსოფია",
    meaningEn: "growth, opportunity and perspective",
  },
  saturn: {
    key: "saturn",
    labelKa: "სატურნი",
    labelEn: "Saturn",
    symbol: "♄",
    emoji: "♄",
    order: 7,
    meaningKa: "დისციპლინა, საზღვრები, ხანგრძლივი მიზანი",
    meaningEn: "discipline, boundaries and long-term growth",
  },
  uranus: {
    key: "uranus",
    labelKa: "ურანი",
    labelEn: "Uranus",
    symbol: "♅",
    emoji: "♅",
    order: 8,
    meaningKa: "ცვლილება, თავისუფლება, უცხო",
    meaningEn: "change, freedom and innovation",
  },
  neptune: {
    key: "neptune",
    labelKa: "ნეპტუნი",
    labelEn: "Neptune",
    symbol: "♆",
    emoji: "♆",
    order: 9,
    meaningKa: "ოცნება, ინტუიცია, წარმოსახვა",
    meaningEn: "dreams, intuition and imagination",
  },
  pluto: {
    key: "pluto",
    labelKa: "პლუტონი",
    labelEn: "Pluto",
    symbol: "♇",
    emoji: "♇",
    order: 10,
    meaningKa: "ტრანსფორმაცია, ძალა, განახლება",
    meaningEn: "transformation, power and renewal",
  },
  midheaven: {
    key: "midheaven",
    labelKa: "ზენიტი",
    labelEn: "Midheaven",
    symbol: "MC",
    emoji: "⬆️",
    order: 11,
    meaningKa: "კარიერა, საზოგადოებრივი იმიჯი",
    meaningEn: "career, reputation and public direction",
  },
  chiron: {
    key: "chiron",
    labelKa: "ქირონი",
    labelEn: "Chiron",
    symbol: "⚷",
    emoji: "⚷",
    order: 12,
    meaningKa: "შინაგანი ჭრილობა, განკურნება, სიბრძნე ტკივილიდან",
    meaningEn: "wounds, healing and hard-won wisdom",
  },
};

export function bodyMeta(key: string): CelestialBody | undefined {
  return BODIES[key.toLowerCase()];
}

/**
 * Format a degree-within-sign as 24° 35′ for display.
 */
export function formatDegree(degreeWithinSign: number): string {
  const d = Math.floor(degreeWithinSign);
  const m = Math.floor((degreeWithinSign - d) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}′`;
}
