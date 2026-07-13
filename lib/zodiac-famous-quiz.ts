export type ZodiacSign = {
  key: string;
  nameKa: string;
  glyph: string;
};

export type FamousZodiacQuestion = {
  id: string;
  name: string;
  professionKa: string;
  sign: ZodiacSign["key"];
  imageId: string;
  imageAlt: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { key: "aries", nameKa: "ვერძი", glyph: "♈" },
  { key: "taurus", nameKa: "კურო", glyph: "♉" },
  { key: "gemini", nameKa: "ტყუპები", glyph: "♊" },
  { key: "cancer", nameKa: "კირჩხიბი", glyph: "♋" },
  { key: "leo", nameKa: "ლომი", glyph: "♌" },
  { key: "virgo", nameKa: "ქალწული", glyph: "♍" },
  { key: "libra", nameKa: "სასწორი", glyph: "♎" },
  { key: "scorpio", nameKa: "მორიელი", glyph: "♏" },
  { key: "sagittarius", nameKa: "მშვილდოსანი", glyph: "♐" },
  { key: "capricorn", nameKa: "თხის რქა", glyph: "♑" },
  { key: "aquarius", nameKa: "მერწყული", glyph: "♒" },
  { key: "pisces", nameKa: "თევზები", glyph: "♓" },
];

/** Ten public-figure questions, shuffled on every new attempt. Portraits are
 * and reviewed Wikimedia Commons photos used as visual quiz cards. */
export const FAMOUS_ZODIAC_QUESTIONS: FamousZodiacQuestion[] = [
  { id: "taylor-swift", name: "Taylor Swift", professionKa: "მომღერალი", sign: "sagittarius", imageId: "taylor-swift", imageAlt: "Taylor Swift კონცერტზე" },
  { id: "leonardo-dicaprio", name: "Leonardo DiCaprio", professionKa: "მსახიობი", sign: "scorpio", imageId: "leonardo-dicaprio", imageAlt: "Leonardo DiCaprio-ს პორტრეტი" },
  { id: "cristiano-ronaldo", name: "Cristiano Ronaldo", professionKa: "ფეხბურთელი", sign: "aquarius", imageId: "cristiano-ronaldo", imageAlt: "Cristiano Ronaldo-ს პორტრეტი" },
  { id: "rihanna", name: "Rihanna", professionKa: "მომღერალი", sign: "pisces", imageId: "rihanna", imageAlt: "Rihanna-ს პორტრეტი" },
  { id: "brad-pitt", name: "Brad Pitt", professionKa: "მსახიობი", sign: "sagittarius", imageId: "brad-pitt", imageAlt: "Brad Pitt-ის პორტრეტი" },
  { id: "lady-gaga", name: "Lady Gaga", professionKa: "მომღერალი", sign: "aries", imageId: "lady-gaga", imageAlt: "Lady Gaga-ს პორტრეტი" },
  { id: "michael-jordan", name: "Michael Jordan", professionKa: "კალათბურთელი", sign: "aquarius", imageId: "michael-jordan", imageAlt: "Michael Jordan თამაშისას" },
  { id: "arnold-schwarzenegger", name: "Arnold Schwarzenegger", professionKa: "მსახიობი", sign: "leo", imageId: "arnold-schwarzenegger", imageAlt: "Arnold Schwarzenegger-ის პორტრეტი" },
  { id: "dolly-parton", name: "Dolly Parton", professionKa: "მომღერალი", sign: "capricorn", imageId: "dolly-parton", imageAlt: "Dolly Parton-ის პორტრეტი" },
  { id: "keanu-reeves", name: "Keanu Reeves", professionKa: "მსახიობი", sign: "virgo", imageId: "keanu-reeves", imageAlt: "Keanu Reeves-ის პორტრეტი" },
];

export function signFor(key: string) {
  return ZODIAC_SIGNS.find((sign) => sign.key === key)!;
}
