export type ZodiacSign = {
  key: string;
  nameKa: string;
  nameEn: string;
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
  { key: "aries", nameKa: "ვერძი", nameEn: "Aries", glyph: "♈" },
  { key: "taurus", nameKa: "კურო", nameEn: "Taurus", glyph: "♉" },
  { key: "gemini", nameKa: "ტყუპები", nameEn: "Gemini", glyph: "♊" },
  { key: "cancer", nameKa: "კირჩხიბი", nameEn: "Cancer", glyph: "♋" },
  { key: "leo", nameKa: "ლომი", nameEn: "Leo", glyph: "♌" },
  { key: "virgo", nameKa: "ქალწული", nameEn: "Virgo", glyph: "♍" },
  { key: "libra", nameKa: "სასწორი", nameEn: "Libra", glyph: "♎" },
  { key: "scorpio", nameKa: "მორიელი", nameEn: "Scorpio", glyph: "♏" },
  { key: "sagittarius", nameKa: "მშვილდოსანი", nameEn: "Sagittarius", glyph: "♐" },
  { key: "capricorn", nameKa: "თხის რქა", nameEn: "Capricorn", glyph: "♑" },
  { key: "aquarius", nameKa: "მერწყული", nameEn: "Aquarius", glyph: "♒" },
  { key: "pisces", nameKa: "თევზები", nameEn: "Pisces", glyph: "♓" },
];

/** Twenty public-figure questions, shuffled + trimmed to a fixed round length
 * on every new attempt. Portraits are reviewed Wikimedia Commons photos used
 * as visual quiz cards. */
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
  { id: "beyonce", name: "Beyoncé", professionKa: "მომღერალი", sign: "virgo", imageId: "beyonce", imageAlt: "Beyoncé სცენაზე" },
  { id: "lionel-messi", name: "Lionel Messi", professionKa: "ფეხბურთელი", sign: "cancer", imageId: "lionel-messi", imageAlt: "Lionel Messi მოედანზე" },
  { id: "ariana-grande", name: "Ariana Grande", professionKa: "მომღერალი", sign: "cancer", imageId: "ariana-grande", imageAlt: "Ariana Grande-ს პორტრეტი" },
  { id: "barack-obama", name: "Barack Obama", professionKa: "პოლიტიკოსი", sign: "leo", imageId: "barack-obama", imageAlt: "Barack Obama-ს პორტრეტი" },
  { id: "angelina-jolie", name: "Angelina Jolie", professionKa: "მსახიობი", sign: "gemini", imageId: "angelina-jolie", imageAlt: "Angelina Jolie-ს პორტრეტი" },
  { id: "kim-kardashian", name: "Kim Kardashian", professionKa: "ბიზნესვუმენი", sign: "libra", imageId: "kim-kardashian", imageAlt: "Kim Kardashian-ის პორტრეტი" },
  { id: "adele", name: "Adele", professionKa: "მომღერალი", sign: "taurus", imageId: "adele", imageAlt: "Adele-ს პორტრეტი" },
  { id: "justin-bieber", name: "Justin Bieber", professionKa: "მომღერალი", sign: "pisces", imageId: "justin-bieber", imageAlt: "Justin Bieber-ის პორტრეტი" },
  { id: "emma-watson", name: "Emma Watson", professionKa: "მსახიობი", sign: "aries", imageId: "emma-watson", imageAlt: "Emma Watson-ის პორტრეტი" },
  { id: "billie-eilish", name: "Billie Eilish", professionKa: "მომღერალი", sign: "sagittarius", imageId: "billie-eilish", imageAlt: "Billie Eilish-ის პორტრეტი" },
];

/** Fixed round length — the pool is shuffled and trimmed to this each attempt. */
export const FAMOUS_ZODIAC_ROUND = 20;

export function signFor(key: string) {
  return ZODIAC_SIGNS.find((sign) => sign.key === key)!;
}

const PROFESSION_EN: Record<string, string> = {
  "მომღერალი": "Singer",
  "მსახიობი": "Actor",
  "ფეხბურთელი": "Footballer",
  "კალათბურთელი": "Basketball player",
  "პოლიტიკოსი": "Politician",
  "ბიზნესვუმენი": "Entrepreneur",
};

export function professionEn(question: FamousZodiacQuestion): string {
  return PROFESSION_EN[question.professionKa] ?? "Public figure";
}
