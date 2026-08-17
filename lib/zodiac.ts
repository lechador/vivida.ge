/**
 * Zodiac signs in canonical order (Aries = 0 ... Pisces = 11).
 * Names are stored in Georgian for direct rendering.
 */

export type ZodiacSign = {
  index: number;
  key: string;            // canonical English key (lowercase)
  labelEn: string;
  labelKa: string;
  labelAm: string;
  symbol: string;         // unicode glyph
  element: "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი";
  modality: "კარდინალური" | "ფიქსირებული" | "მუტაბელური";
  ruler: string;          // ruling planet (Georgian)
  rulerAm: string;        // ruling planet (Armenian)
  emoji: string;
};

export const SIGNS: ZodiacSign[] = [
  { index: 0,  key: "aries",       labelEn: "Aries",       labelKa: "ვერძი",       labelAm: "Խոյ",         symbol: "♈", element: "ცეცხლი", modality: "კარდინალური", ruler: "მარსი",    rulerAm: "Մարս",     emoji: "🐏" },
  { index: 1,  key: "taurus",      labelEn: "Taurus",      labelKa: "კურო",        labelAm: "Ցուլ",         symbol: "♉", element: "მიწა",     modality: "ფიქსირებული",   ruler: "ვენერა",   rulerAm: "Վեներա",   emoji: "🐂" },
  { index: 2,  key: "gemini",      labelEn: "Gemini",      labelKa: "ტყუპები",     labelAm: "Երկվորյակներ", symbol: "♊", element: "ჰაერი",   modality: "მუტაბელური",   ruler: "მერკური",  rulerAm: "Մերկուրի", emoji: "👯" },
  { index: 3,  key: "cancer",      labelEn: "Cancer",      labelKa: "კირჩხიბი",    labelAm: "Խեցգետին",     symbol: "♋", element: "წყალი",   modality: "კარდინალური", ruler: "მთვარე",   rulerAm: "Լուսին",   emoji: "🦀" },
  { index: 4,  key: "leo",         labelEn: "Leo",         labelKa: "ლომი",        labelAm: "Առյուծ",       symbol: "♌", element: "ცეცხლი", modality: "ფიქსირებული",   ruler: "მზე",      rulerAm: "Արև",      emoji: "🦁" },
  { index: 5,  key: "virgo",       labelEn: "Virgo",       labelKa: "ქალწული",     labelAm: "Կույս",        symbol: "♍", element: "მიწა",     modality: "მუტაბელური",   ruler: "მერკური",  rulerAm: "Մերկուրի", emoji: "🌾" },
  { index: 6,  key: "libra",       labelEn: "Libra",       labelKa: "სასწორი",     labelAm: "Կշեռք",        symbol: "♎", element: "ჰაერი",   modality: "კარდინალური", ruler: "ვენერა",   rulerAm: "Վեներա",   emoji: "⚖️" },
  { index: 7,  key: "scorpio",     labelEn: "Scorpio",     labelKa: "მორიელი",     labelAm: "Կարիճ",        symbol: "♏", element: "წყალი",   modality: "ფიქსირებული",   ruler: "პლუტონი",  rulerAm: "Պլուտոն",  emoji: "🦂" },
  { index: 8,  key: "sagittarius", labelEn: "Sagittarius", labelKa: "მშვილდოსანი", labelAm: "Աղեղնավոր",    symbol: "♐", element: "ცეცხლი", modality: "მუტაბელური",   ruler: "იუპიტერი", rulerAm: "Յուպիտեր", emoji: "🏹" },
  { index: 9,  key: "capricorn",   labelEn: "Capricorn",   labelKa: "თხის რქა",    labelAm: "Այծեղջյուր",   symbol: "♑", element: "მიწა",     modality: "კარდინალური", ruler: "სატურნი",  rulerAm: "Սատուրն",  emoji: "🐐" },
  { index: 10, key: "aquarius",    labelEn: "Aquarius",    labelKa: "მერწყული",    labelAm: "Ջրհոս",        symbol: "♒", element: "ჰაერი",   modality: "ფიქსირებული",   ruler: "ურანი",    rulerAm: "Ուրան",    emoji: "🏺" },
  { index: 11, key: "pisces",      labelEn: "Pisces",      labelKa: "თევზები",     labelAm: "Ձկներ",        symbol: "♓", element: "წყალი",   modality: "მუტაბელური",   ruler: "ნეპტუნი",  rulerAm: "Նեպտուն",  emoji: "🐟" },
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
 * Planet / luminary metadata.
 * Keys match the canonical lowercase names used by the chart engine.
 */
export type CelestialBody = {
  key: string;
  labelKa: string;
  labelEn: string;
  labelAm: string;
  symbol: string;
  emoji: string;
  /** display order on the dashboard */
  order: number;
  meaningKa: string;
  meaningEn: string;
  meaningAm: string;
};

export const BODIES: Record<string, CelestialBody> = {
  sun:        { key: "sun", labelKa: "მზე", labelEn: "Sun", labelAm: "Արև", symbol: "☉", emoji: "☀️", order: 0, meaningKa: "ბირთვი, იდენტობა, სიცოცხლის ცეცხლი", meaningEn: "core identity, vitality and purpose", meaningAm: "ինքնություն, կենսունակություն և նպատակ" },
  moon:       { key: "moon", labelKa: "მთვარე", labelEn: "Moon", labelAm: "Լուսին", symbol: "☽", emoji: "🌙", order: 1, meaningKa: "ემოციები, შინაგანი სამყარო, ინსტინქტები", meaningEn: "emotions, instincts and inner life", meaningAm: "էմոցիաներ, ինտուիցիա և ներքին աշխարհ" },
  ascendant:  { key: "ascendant", labelKa: "ამომავალი", labelEn: "Ascendant", labelAm: "Ասցենդենտ", symbol: "AC", emoji: "⬆️", order: 2, meaningKa: "სოციალური ნიღაბი, პირველი შთაბეჭდილება", meaningEn: "first impressions and outward style", meaningAm: "առաջին տպավորություն և արտաքին ոճ" },
  mercury:    { key: "mercury", labelKa: "მერკური", labelEn: "Mercury", labelAm: "Մերկուրի", symbol: "☿", emoji: "☿", order: 3, meaningKa: "გონება, აზროვნება, კომუნიკაცია", meaningEn: "thinking, learning and communication", meaningAm: "մտածողություն, ուսում և հաղորդակցություն" },
  venus:      { key: "venus", labelKa: "ვენერა", labelEn: "Venus", labelAm: "Վեներա", symbol: "♀", emoji: "♀", order: 4, meaningKa: "სიყვარული, სილამაზე, ღირებულებები", meaningEn: "love, attraction, beauty and values", meaningAm: "սեր, գրավչություն, գեղեցկություն և արժեքներ" },
  mars:       { key: "mars", labelKa: "მარსი", labelEn: "Mars", labelAm: "Մարս", symbol: "♂", emoji: "♂", order: 5, meaningKa: "მოქმედება, ენერგია, ვნება", meaningEn: "action, drive, energy and desire", meaningAm: "գործողություն, էներգիա, կիրք և նախաձեռնություն" },
  jupiter:    { key: "jupiter", labelKa: "იუპიტერი", labelEn: "Jupiter", labelAm: "Յուպիտեր", symbol: "♃", emoji: "♃", order: 6, meaningKa: "ზრდა, შესაძლებლობები, ფილოსოფია", meaningEn: "growth, opportunity and perspective", meaningAm: "աճ, հնարավորություններ և աշխարհայացք" },
  saturn:     { key: "saturn", labelKa: "სატურნი", labelEn: "Saturn", labelAm: "Սատուրն", symbol: "♄", emoji: "♄", order: 7, meaningKa: "დისციპლინა, საზღვრები, ხანგრძლივი მიზანი", meaningEn: "discipline, boundaries and long-term growth", meaningAm: "կարգապահություն, սահմաններ և երկարաժամկետ աճ" },
  uranus:     { key: "uranus", labelKa: "ურანი", labelEn: "Uranus", labelAm: "Ուրան", symbol: "♅", emoji: "♅", order: 8, meaningKa: "ცვლილება, თავისუფლება, უცხო", meaningEn: "change, freedom and innovation", meaningAm: "փոփոխություն, ազատություն և նորարարություն" },
  neptune:    { key: "neptune", labelKa: "ნეპტუნი", labelEn: "Neptune", labelAm: "Նեպտուն", symbol: "♆", emoji: "♆", order: 9, meaningKa: "ოცნება, ინტუიცია, წარმოსახვა", meaningEn: "dreams, intuition and imagination", meaningAm: "երազանքներ, ինտուիցիա և երևակայություն" },
  pluto:      { key: "pluto", labelKa: "პლუტონი", labelEn: "Pluto", labelAm: "Պլուտոն", symbol: "♇", emoji: "♇", order: 10, meaningKa: "ტრანსფორმაცია, ძალა, განახლება", meaningEn: "transformation, power and renewal", meaningAm: "տրանսֆորմացիա, ուժ և վերածնունդ" },
  midheaven:  { key: "midheaven", labelKa: "ზენიტი", labelEn: "Midheaven", labelAm: "Միջօրեական (MC)", symbol: "MC", emoji: "⬆️", order: 11, meaningKa: "კარიერა, საზოგადოებრივი იმიჯი", meaningEn: "career, reputation and public direction", meaningAm: "կարիերա, հեղինակություն և հանրային ուղի" },
  chiron:     { key: "chiron", labelKa: "ქირონი", labelEn: "Chiron", labelAm: "Քիրոն", symbol: "⚷", emoji: "⚷", order: 12, meaningKa: "შინაგანი ჭრილობა, განკურნება, სიბრძნე ტკივილიდან", meaningEn: "wounds, healing and hard-won wisdom", meaningAm: "ներքին վերքեր, ապաքինում և խորը իմաստություն" },
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
