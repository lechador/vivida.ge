/**
 * Zodiac signs in canonical order (Aries = 0 ... Pisces = 11).
 * Names are stored in Georgian for direct rendering.
 */

export type ZodiacSign = {
  index: number;
  key: string;            // canonical English key (lowercase)
  labelEn: string;
  labelKa: string;
  symbol: string;         // unicode glyph
  element: "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი";
  modality: "კარდინალური" | "ფიქსირებული" | "მუტაბელური";
  ruler: string;          // ruling planet (Georgian)
  emoji: string;
};

export const SIGNS: ZodiacSign[] = [
  { index: 0,  key: "aries",       labelEn: "Aries",       labelKa: "ვერძი",       symbol: "♈", element: "ცეცხლი", modality: "კარდინალური", ruler: "მარსი",   emoji: "🐏" },
  { index: 1,  key: "taurus",      labelEn: "Taurus",      labelKa: "კურო",        symbol: "♉", element: "მიწა",     modality: "ფიქსირებული",   ruler: "ვენერა",  emoji: "🐂" },
  { index: 2,  key: "gemini",      labelEn: "Gemini",      labelKa: "ტყუპები",     symbol: "♊", element: "ჰაერი",   modality: "მუტაბელური",   ruler: "მერკური", emoji: "👯" },
  { index: 3,  key: "cancer",      labelEn: "Cancer",      labelKa: "კირჩხიბი",    symbol: "♋", element: "წყალი",   modality: "კარდინალური", ruler: "მთვარე",  emoji: "🦀" },
  { index: 4,  key: "leo",         labelEn: "Leo",         labelKa: "ლომი",        symbol: "♌", element: "ცეცხლი", modality: "ფიქსირებული",   ruler: "მზე",     emoji: "🦁" },
  { index: 5,  key: "virgo",       labelEn: "Virgo",       labelKa: "ქალწული",     symbol: "♍", element: "მიწა",     modality: "მუტაბელური",   ruler: "მერკური", emoji: "🌾" },
  { index: 6,  key: "libra",       labelEn: "Libra",       labelKa: "სასწორი",     symbol: "♎", element: "ჰაერი",   modality: "კარდინალური", ruler: "ვენერა",  emoji: "⚖️" },
  { index: 7,  key: "scorpio",     labelEn: "Scorpio",     labelKa: "მორიელი",     symbol: "♏", element: "წყალი",   modality: "ფიქსირებული",   ruler: "პლუტონი", emoji: "🦂" },
  { index: 8,  key: "sagittarius", labelEn: "Sagittarius", labelKa: "მშვილდოსანი", symbol: "♐", element: "ცეცხლი", modality: "მუტაბელური",   ruler: "იუპიტერი",emoji: "🏹" },
  { index: 9,  key: "capricorn",   labelEn: "Capricorn",   labelKa: "თხის რქა",    symbol: "♑", element: "მიწა",     modality: "კარდინალური", ruler: "სატურნი", emoji: "🐐" },
  { index: 10, key: "aquarius",    labelEn: "Aquarius",    labelKa: "მერწყული",    symbol: "♒", element: "ჰაერი",   modality: "ფიქსირებული",   ruler: "ურანი",   emoji: "🏺" },
  { index: 11, key: "pisces",      labelEn: "Pisces",      labelKa: "თევზები",     symbol: "♓", element: "წყალი",   modality: "მუტაბელური",   ruler: "ნეპტუნი", emoji: "🐟" },
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
  მიწა:    "oklch(0.65 0.13 130)",
  ჰაერი:  "oklch(0.78 0.16 220)",
  წყალი:  "oklch(0.65 0.20 285)",
};

export function signColor(sign: ZodiacSign): string {
  return ELEMENT_COLOR[sign.element];
}

/**
 * Planet / luminary metadata in Georgian.
 * Keys match the canonical lowercase names used by the chart engine.
 */
export type CelestialBody = {
  key: string;
  labelKa: string;
  symbol: string;
  emoji: string;
  /** display order on the dashboard */
  order: number;
  /** One-line description of what this planet represents (Georgian). */
  meaningKa: string;
};

export const BODIES: Record<string, CelestialBody> = {
  sun:        { key: "sun",        labelKa: "მზე",       symbol: "☉", emoji: "☀️", order: 0,  meaningKa: "ბირთვი, იდენტობა, სიცოცხლის ცეცხლი" },
  moon:       { key: "moon",       labelKa: "მთვარე",    symbol: "☽", emoji: "🌙", order: 1,  meaningKa: "ემოციები, შინაგანი სამყარო, ინსტინქტები" },
  ascendant:  { key: "ascendant",  labelKa: "ამომავალი",  symbol: "AC", emoji: "⬆️", order: 2,  meaningKa: "სოციალური ნიღაბი, პირველი შთაბეჭდილება" },
  mercury:    { key: "mercury",    labelKa: "მერკური",    symbol: "☿", emoji: "☿",  order: 3,  meaningKa: "გონება, აზროვნება, კომუნიკაცია" },
  venus:      { key: "venus",      labelKa: "ვენერა",     symbol: "♀", emoji: "♀",  order: 4,  meaningKa: "სიყვარული, სილამაზე, ღირებულებები" },
  mars:       { key: "mars",       labelKa: "მარსი",      symbol: "♂", emoji: "♂",  order: 5,  meaningKa: "მოქმედება, ენერგია, ვნება" },
  jupiter:    { key: "jupiter",    labelKa: "იუპიტერი",   symbol: "♃", emoji: "♃",  order: 6,  meaningKa: "ზრდა, შესაძლებლობები, ფილოსოფია" },
  saturn:     { key: "saturn",     labelKa: "სატურნი",    symbol: "♄", emoji: "♄",  order: 7,  meaningKa: "დისციპლინა, საზღვრები, ხანგრძლივი მიზანი" },
  uranus:     { key: "uranus",     labelKa: "ურანი",      symbol: "♅", emoji: "♅",  order: 8,  meaningKa: "ცვლილება, თავისუფლება, უცხო" },
  neptune:    { key: "neptune",    labelKa: "ნეპტუნი",    symbol: "♆", emoji: "♆",  order: 9,  meaningKa: "ოცნება, ინტუიცია, წარმოსახვა" },
  pluto:      { key: "pluto",      labelKa: "პლუტონი",    symbol: "♇", emoji: "♇",  order: 10, meaningKa: "ტრანსფორმაცია, ძალა, განახლება" },
  midheaven:  { key: "midheaven",  labelKa: "ზენიტი",     symbol: "MC", emoji: "⬆️", order: 11, meaningKa: "კარიერა, საზოგადოებრივი იმიჯი" },
  chiron:     { key: "chiron",     labelKa: "ქირონი",     symbol: "⚷", emoji: "⚷",  order: 12, meaningKa: "შინაგანი ჭრილობა, განკურნება, სიბრძნე ტკივილიდან" },
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
