export type ZodiacElementKa = "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი";
export type ZodiacModalityKa = "კარდინალური" | "ფიქსირებული" | "მუტაბელური";

export type ZodiacSign = {
  index: number;
  key:
    | "aries"
    | "taurus"
    | "gemini"
    | "cancer"
    | "leo"
    | "virgo"
    | "libra"
    | "scorpio"
    | "sagittarius"
    | "capricorn"
    | "aquarius"
    | "pisces";
  slug:
    | "aries"
    | "taurus"
    | "gemini"
    | "cancer"
    | "leo"
    | "virgo"
    | "libra"
    | "scorpio"
    | "sagittarius"
    | "capricorn"
    | "aquarius"
    | "pisces";
  labelKa: string;
  labelEn: string;
  symbol: string;
  element: ZodiacElementKa;
  elementEn: "Fire" | "Earth" | "Air" | "Water";
  modality: ZodiacModalityKa;
  modalityEn: "Cardinal" | "Fixed" | "Mutable";
  rulerKa: string;
  rulerEn: string;
  ruler?: string;
  emoji?: string;
};

export const SIGNS: ZodiacSign[] = [
  {
    index: 0,
    key: "aries",
    slug: "aries",
    labelKa: "ვერძი",
    labelEn: "Aries",
    symbol: "♈",
    element: "ცეცხლი",
    elementEn: "Fire",
    modality: "კარდინალური",
    modalityEn: "Cardinal",
    rulerKa: "მარსი",
    rulerEn: "Mars",
  },
  {
    index: 1,
    key: "taurus",
    slug: "taurus",
    labelKa: "კურო",
    labelEn: "Taurus",
    symbol: "♉",
    element: "მიწა",
    elementEn: "Earth",
    modality: "ფიქსირებული",
    modalityEn: "Fixed",
    rulerKa: "ვენერა",
    rulerEn: "Venus",
  },
  {
    index: 2,
    key: "gemini",
    slug: "gemini",
    labelKa: "ტყუპები",
    labelEn: "Gemini",
    symbol: "♊",
    element: "ჰაერი",
    elementEn: "Air",
    modality: "მუტაბელური",
    modalityEn: "Mutable",
    rulerKa: "მერკური",
    rulerEn: "Mercury",
  },
  {
    index: 3,
    key: "cancer",
    slug: "cancer",
    labelKa: "კირჩხიბი",
    labelEn: "Cancer",
    symbol: "♋",
    element: "წყალი",
    elementEn: "Water",
    modality: "კარდინალური",
    modalityEn: "Cardinal",
    rulerKa: "მთვარე",
    rulerEn: "Moon",
  },
  {
    index: 4,
    key: "leo",
    slug: "leo",
    labelKa: "ლომი",
    labelEn: "Leo",
    symbol: "♌",
    element: "ცეცხლი",
    elementEn: "Fire",
    modality: "ფიქსირებული",
    modalityEn: "Fixed",
    rulerKa: "მზე",
    rulerEn: "Sun",
  },
  {
    index: 5,
    key: "virgo",
    slug: "virgo",
    labelKa: "ქალწული",
    labelEn: "Virgo",
    symbol: "♍",
    element: "მიწა",
    elementEn: "Earth",
    modality: "მუტაბელური",
    modalityEn: "Mutable",
    rulerKa: "მერკური",
    rulerEn: "Mercury",
  },
  {
    index: 6,
    key: "libra",
    slug: "libra",
    labelKa: "სასწორი",
    labelEn: "Libra",
    symbol: "♎",
    element: "ჰაერი",
    elementEn: "Air",
    modality: "კარდინალური",
    modalityEn: "Cardinal",
    rulerKa: "ვენერა",
    rulerEn: "Venus",
  },
  {
    index: 7,
    key: "scorpio",
    slug: "scorpio",
    labelKa: "მორიელი",
    labelEn: "Scorpio",
    symbol: "♏",
    element: "წყალი",
    elementEn: "Water",
    modality: "ფიქსირებული",
    modalityEn: "Fixed",
    rulerKa: "პლუტონი",
    rulerEn: "Pluto",
  },
  {
    index: 8,
    key: "sagittarius",
    slug: "sagittarius",
    labelKa: "მშვილდოსანი",
    labelEn: "Sagittarius",
    symbol: "♐",
    element: "ცეცხლი",
    elementEn: "Fire",
    modality: "მუტაბელური",
    modalityEn: "Mutable",
    rulerKa: "იუპიტერი",
    rulerEn: "Jupiter",
  },
  {
    index: 9,
    key: "capricorn",
    slug: "capricorn",
    labelKa: "თხის რქა",
    labelEn: "Capricorn",
    symbol: "♑",
    element: "მიწა",
    elementEn: "Earth",
    modality: "კარდინალური",
    modalityEn: "Cardinal",
    rulerKa: "სატურნი",
    rulerEn: "Saturn",
  },
  {
    index: 10,
    key: "aquarius",
    slug: "aquarius",
    labelKa: "მერწყული",
    labelEn: "Aquarius",
    symbol: "♒",
    element: "ჰაერი",
    elementEn: "Air",
    modality: "ფიქსირებული",
    modalityEn: "Fixed",
    rulerKa: "ურანი",
    rulerEn: "Uranus",
  },
  {
    index: 11,
    key: "pisces",
    slug: "pisces",
    labelKa: "თევზები",
    labelEn: "Pisces",
    symbol: "♓",
    element: "წყალი",
    elementEn: "Water",
    modality: "მუტაბელური",
    modalityEn: "Mutable",
    rulerKa: "ნეპტუნი",
    rulerEn: "Neptune",
  },
];

export type BodyMeta = {
  key: string;
  labelKa: string;
  labelEn: string;
  symbol: string;
  meaningKa: string;
  meaningEn: string;
};

const BODIES_LIST: BodyMeta[] = [
  { key: "sun", labelKa: "მზე", labelEn: "Sun", symbol: "☉", meaningKa: "ბირთვი და იდენტობა", meaningEn: "Core identity" },
  { key: "moon", labelKa: "მთვარე", labelEn: "Moon", symbol: "☽", meaningKa: "ემოციური სამყარო", meaningEn: "Emotional inner world" },
  { key: "ascendant", labelKa: "ასცენდენტი", labelEn: "Ascendant", symbol: "↑", meaningKa: "გარეგანი ხატი", meaningEn: "Rising sign & persona" },
  { key: "mercury", labelKa: "მერკური", labelEn: "Mercury", symbol: "☿", meaningKa: "აზროვნება და კომუნიკაცია", meaningEn: "Mind & communication" },
  { key: "venus", labelKa: "ვენერა", labelEn: "Venus", symbol: "♀", meaningKa: "სიყვარული და ღირებულებები", meaningEn: "Love & values" },
  { key: "mars", labelKa: "მარსი", labelEn: "Mars", symbol: "♂", meaningKa: "ენერგია და ნება", meaningEn: "Drive & action" },
  { key: "jupiter", labelKa: "იუპიტერი", labelEn: "Jupiter", symbol: "♃", meaningKa: "ზრდა და იღბალი", meaningEn: "Growth & wisdom" },
  { key: "saturn", labelKa: "სატურნი", labelEn: "Saturn", symbol: "♄", meaningKa: "სტრუქტურა და დისციპლინა", meaningEn: "Structure & mastery" },
  { key: "uranus", labelKa: "ურანი", labelEn: "Uranus", symbol: "♅", meaningKa: "ცვლილება და თავისუფლება", meaningEn: "Innovation & change" },
  { key: "neptune", labelKa: "ნეპტუნი", labelEn: "Neptune", symbol: "♆", meaningKa: "ინტუიცია და ოცნებები", meaningEn: "Intuition & dreams" },
  { key: "pluto", labelKa: "პლუტონი", labelEn: "Pluto", symbol: "♇", meaningKa: "ტრანსფორმაცია და ძალა", meaningEn: "Transformation & depth" },
  { key: "midheaven", labelKa: "მედიუმ ცელი", labelEn: "Midheaven", symbol: "MC", meaningKa: "მოწოდება და კარიერა", meaningEn: "Public path & vocation" },
  { key: "chiron", labelKa: "ქირონი", labelEn: "Chiron", symbol: "⚷", meaningKa: "განკურნება და სიბრძნე", meaningEn: "Wound & healing" },
];

for (const item of BODIES_LIST) {
  Object.defineProperty(BODIES_LIST, item.key, {
    value: item,
    enumerable: false,
    configurable: true,
  });
}

export const BODIES = BODIES_LIST as BodyMeta[] & Record<string, BodyMeta>;

export function signByIndex(index: number): ZodiacSign {
  const normalized = ((Math.floor(index) % 12) + 12) % 12;
  return SIGNS[normalized] ?? SIGNS[0];
}

export function signFromLongitude(longitude: number): ZodiacSign {
  const norm = ((longitude % 360) + 360) % 360;
  return signByIndex(Math.floor(norm / 30));
}

export function signByLabelEn(label: string): ZodiacSign | undefined {
  const lower = label?.toLowerCase?.() ?? "";
  return SIGNS.find((s) => s.labelEn.toLowerCase() === lower || s.key === lower);
}

export function bodyMeta(key: string): BodyMeta | undefined {
  return BODIES.find((b) => b.key === key);
}

export function signColor(sign: { element?: string } | ZodiacSign | undefined): string {
  const el = sign?.element;
  if (el === "ცეცხლი" || el === "Fire") return "oklch(0.75 0.19 35)";
  if (el === "მიწა" || el === "Earth") return "oklch(0.76 0.16 145)";
  if (el === "ჰაერი" || el === "Air") return "oklch(0.78 0.16 210)";
  if (el === "წყალი" || el === "Water") return "oklch(0.72 0.20 295)";
  return "var(--vivida-violet)";
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

export const ZODIAC_SIGNS = SIGNS;

