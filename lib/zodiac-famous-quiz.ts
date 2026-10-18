import { ZODIAC_SIGNS as BASE_SIGNS } from "@/lib/zodiac";

export type FamousZodiacSign = {
  key: string;
  glyph: string;
  nameKa: string;
  nameEn: string;
};

export const ZODIAC_SIGNS: FamousZodiacSign[] = BASE_SIGNS.map((s) => ({
  key: s.key,
  glyph: s.symbol,
  nameKa: s.labelKa,
  nameEn: s.labelEn,
}));

export function signFor(key: string): FamousZodiacSign {
  return ZODIAC_SIGNS.find((s) => s.key === key) ?? ZODIAC_SIGNS[0];
}

export type FamousZodiacQuestion = {
  id: string;
  name: string;
  professionKa: string;
  professionEn: string;
  sign: string;
  imageId: string;
  imageAlt: string;
};

export const FAMOUS_ZODIAC_ROUND = 3;

export const FAMOUS_ZODIAC_QUESTIONS: FamousZodiacQuestion[] = [
  {
    id: "albert-einstein",
    name: "Albert Einstein",
    professionKa: "ფიზიკოსი · 14 მარტი",
    professionEn: "Physicist · March 14",
    sign: "pisces",
    imageId: "albert-einstein",
    imageAlt: "ალბერტ აინშტაინი",
  },
  {
    id: "marilyn-monroe",
    name: "Marilyn Monroe",
    professionKa: "მსახიობი · 1 ივნისი",
    professionEn: "Actress · June 1",
    sign: "gemini",
    imageId: "marilyn-monroe",
    imageAlt: "მერილინ მონრო",
  },
  {
    id: "david-bowie",
    name: "David Bowie",
    professionKa: "მუსიკოსი · 8 იანვარი",
    professionEn: "Musician · January 8",
    sign: "capricorn",
    imageId: "david-bowie",
    imageAlt: "დევიდ ბოუი",
  },
];

export function professionEn(q: FamousZodiacQuestion): string {
  return q.professionEn;
}
