export type ChineseAnimal = {
  slug: string;
  nameKa: string;
  nameEn: string;
  emoji: string;
  baseYear: number;
  element: string;
  elementEn: string;
  polarity: string;
  polarityEn: string;
};

export const CHINESE_ANIMALS: ChineseAnimal[] = [
  {
    slug: "virtxa",
    nameKa: "ვირთხა",
    nameEn: "Rat",
    emoji: "🐀",
    baseYear: 1924,
    element: "წყალი",
    elementEn: "Water",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "xari",
    nameKa: "ხარი",
    nameEn: "Ox",
    emoji: "🐂",
    baseYear: 1925,
    element: "მიწა",
    elementEn: "Earth",
    polarity: "ინი",
    polarityEn: "Yin",
  },
  {
    slug: "vefxvi",
    nameKa: "ვეფხვი",
    nameEn: "Tiger",
    emoji: "🐅",
    baseYear: 1926,
    element: "ხე",
    elementEn: "Wood",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "kurdgeli",
    nameKa: "კურდღელი",
    nameEn: "Rabbit",
    emoji: "🐇",
    baseYear: 1927,
    element: "ხე",
    elementEn: "Wood",
    polarity: "ინი",
    polarityEn: "Yin",
  },
  {
    slug: "drakoni",
    nameKa: "დრაკონი",
    nameEn: "Dragon",
    emoji: "🐉",
    baseYear: 1928,
    element: "მიწა",
    elementEn: "Earth",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "gveli",
    nameKa: "გველი",
    nameEn: "Snake",
    emoji: "🐍",
    baseYear: 1929,
    element: "ცეცხლი",
    elementEn: "Fire",
    polarity: "ინი",
    polarityEn: "Yin",
  },
  {
    slug: "cxeni",
    nameKa: "ცხენი",
    nameEn: "Horse",
    emoji: "🐎",
    baseYear: 1930,
    element: "ცეცხლი",
    elementEn: "Fire",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "txa",
    nameKa: "თხა",
    nameEn: "Goat",
    emoji: "🐐",
    baseYear: 1931,
    element: "მიწა",
    elementEn: "Earth",
    polarity: "ინი",
    polarityEn: "Yin",
  },
  {
    slug: "maimuni",
    nameKa: "მაიმუნი",
    nameEn: "Monkey",
    emoji: "🐒",
    baseYear: 1932,
    element: "ლითონი",
    elementEn: "Metal",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "mamali",
    nameKa: "მამალი",
    nameEn: "Rooster",
    emoji: "🐓",
    baseYear: 1933,
    element: "ლითონი",
    elementEn: "Metal",
    polarity: "ინი",
    polarityEn: "Yin",
  },
  {
    slug: "dzagli",
    nameKa: "ძაღლი",
    nameEn: "Dog",
    emoji: "🐕",
    baseYear: 1934,
    element: "მიწა",
    elementEn: "Earth",
    polarity: "იანი",
    polarityEn: "Yang",
  },
  {
    slug: "gori",
    nameKa: "ღორი",
    nameEn: "Pig",
    emoji: "🐖",
    baseYear: 1935,
    element: "წყალი",
    elementEn: "Water",
    polarity: "ინი",
    polarityEn: "Yin",
  },
];

export const ALL_CHINESE_SLUGS = CHINESE_ANIMALS.map((a) => a.slug);

export function chineseAnimalBySlug(slug: string): ChineseAnimal | undefined {
  return CHINESE_ANIMALS.find((a) => a.slug === slug);
}

export function yearsForAnimal(slug: string): number[] {
  const animal = chineseAnimalBySlug(slug);
  if (!animal) return [];
  const years: number[] = [];
  for (let y = animal.baseYear; y <= 2035; y += 12) {
    if (y >= 1936) years.push(y);
  }
  return years.reverse();
}

export function animalForYear(year: number): ChineseAnimal {
  const idx = (((year - 1924) % 12) + 12) % 12;
  return CHINESE_ANIMALS[idx];
}
