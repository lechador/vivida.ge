export type ZodiacSign = {
  key: string;
  nameKa: string;
  nameEn: string;
  nameAm: string;
  glyph: string;
};

export type FamousZodiacQuestion = {
  id: string;
  name: string;
  professionKa: string;
  professionAm: string;
  sign: ZodiacSign["key"];
  imageId: string;
  imageAlt: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { key: "aries", nameKa: "ვერძი", nameEn: "Aries", nameAm: "Խոյ", glyph: "♈" },
  { key: "taurus", nameKa: "კურო", nameEn: "Taurus", nameAm: "Ցուլ", glyph: "♉" },
  { key: "gemini", nameKa: "ტყუპები", nameEn: "Gemini", nameAm: "Երկվորյակներ", glyph: "♊" },
  { key: "cancer", nameKa: "კირჩხიბი", nameEn: "Cancer", nameAm: "Խեցգետին", glyph: "♋" },
  { key: "leo", nameKa: "ლომი", nameEn: "Leo", nameAm: "Առյուծ", glyph: "♌" },
  { key: "virgo", nameKa: "ქალწული", nameEn: "Virgo", nameAm: "Կույս", glyph: "♍" },
  { key: "libra", nameKa: "სასწორი", nameEn: "Libra", nameAm: "Կշեռք", glyph: "♎" },
  { key: "scorpio", nameKa: "მორიელი", nameEn: "Scorpio", nameAm: "Կարիճ", glyph: "♏" },
  { key: "sagittarius", nameKa: "მშვილდოსანი", nameEn: "Sagittarius", nameAm: "Աղեղնավոր", glyph: "♐" },
  { key: "capricorn", nameKa: "თხის რქა", nameEn: "Capricorn", nameAm: "Այծեղջյուր", glyph: "♑" },
  { key: "aquarius", nameKa: "მერწყული", nameEn: "Aquarius", nameAm: "Ջրհոս", glyph: "♒" },
  { key: "pisces", nameKa: "თევზები", nameEn: "Pisces", nameAm: "Ձկներ", glyph: "♓" },
];

/** Twenty public-figure questions, shuffled + trimmed to a fixed round length
 * on every new attempt. Portraits are reviewed Wikimedia Commons photos used
 * as visual quiz cards. */
export const FAMOUS_ZODIAC_QUESTIONS: FamousZodiacQuestion[] = [
  { id: "taylor-swift", name: "Taylor Swift", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "sagittarius", imageId: "taylor-swift", imageAlt: "Taylor Swift-ը համերգում" },
  { id: "leonardo-dicaprio", name: "Leonardo DiCaprio", professionKa: "მსახიობი", professionAm: "Դերասան", sign: "scorpio", imageId: "leonardo-dicaprio", imageAlt: "Leonardo DiCaprio-ի դիմանկարը" },
  { id: "cristiano-ronaldo", name: "Cristiano Ronaldo", professionKa: "ფეხბურთელი", professionAm: "Ֆուտբոլիստ", sign: "aquarius", imageId: "cristiano-ronaldo", imageAlt: "Cristiano Ronaldo-ի դիմանկարը" },
  { id: "rihanna", name: "Rihanna", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "pisces", imageId: "rihanna", imageAlt: "Rihanna-ի դիմանկարը" },
  { id: "brad-pitt", name: "Brad Pitt", professionKa: "მსახიობი", professionAm: "Դերասան", sign: "sagittarius", imageId: "brad-pitt", imageAlt: "Brad Pitt-ի դիմանկարը" },
  { id: "lady-gaga", name: "Lady Gaga", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "aries", imageId: "lady-gaga", imageAlt: "Lady Gaga-ի դիմանկարը" },
  { id: "michael-jordan", name: "Michael Jordan", professionKa: "კალათბურთელი", professionAm: "Բասկետբոլիստ", sign: "aquarius", imageId: "michael-jordan", imageAlt: "Michael Jordan-ը խաղի ժամանակ" },
  { id: "arnold-schwarzenegger", name: "Arnold Schwarzenegger", professionKa: "მსახიობი", professionAm: "Դերասան", sign: "leo", imageId: "arnold-schwarzenegger", imageAlt: "Arnold Schwarzenegger-ի դիմանկարը" },
  { id: "dolly-parton", name: "Dolly Parton", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "capricorn", imageId: "dolly-parton", imageAlt: "Dolly Parton-ի դիմանկարը" },
  { id: "keanu-reeves", name: "Keanu Reeves", professionKa: "მსახიობი", professionAm: "Դերասան", sign: "virgo", imageId: "keanu-reeves", imageAlt: "Keanu Reeves-ի դիմանկարը" },
  { id: "beyonce", name: "Beyoncé", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "virgo", imageId: "beyonce", imageAlt: "Beyoncé-ն բեմում" },
  { id: "lionel-messi", name: "Lionel Messi", professionKa: "ფეხბურთელი", professionAm: "Ֆուտբոլիստ", sign: "cancer", imageId: "lionel-messi", imageAlt: "Lionel Messi-ն խաղադաշտում" },
  { id: "ariana-grande", name: "Ariana Grande", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "cancer", imageId: "ariana-grande", imageAlt: "Ariana Grande-ի դիմանկարը" },
  { id: "barack-obama", name: "Barack Obama", professionKa: "პოლიტიკოსი", professionAm: "Քաղաքական գործիչ", sign: "leo", imageId: "barack-obama", imageAlt: "Barack Obama-ի դիմանկարը" },
  { id: "angelina-jolie", name: "Angelina Jolie", professionKa: "მსახიობი", professionAm: "Դերասանուհի", sign: "gemini", imageId: "angelina-jolie", imageAlt: "Angelina Jolie-ի դիմանկարը" },
  { id: "kim-kardashian", name: "Kim Kardashian", professionKa: "ბიზნესვუმენი", professionAm: "Գործարար", sign: "libra", imageId: "kim-kardashian", imageAlt: "Kim Kardashian-ի դիմանկարը" },
  { id: "adele", name: "Adele", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "taurus", imageId: "adele", imageAlt: "Adele-ի դիմանկարը" },
  { id: "justin-bieber", name: "Justin Bieber", professionKa: "მომღერალი", professionAm: "Երգիչ", sign: "pisces", imageId: "justin-bieber", imageAlt: "Justin Bieber-ի դիմանկարը" },
  { id: "emma-watson", name: "Emma Watson", professionKa: "მსახიობი", professionAm: "Դերասանուհի", sign: "aries", imageId: "emma-watson", imageAlt: "Emma Watson-ի դիմանկարը" },
  { id: "billie-eilish", name: "Billie Eilish", professionKa: "მომღერალი", professionAm: "Երգչուհի", sign: "sagittarius", imageId: "billie-eilish", imageAlt: "Billie Eilish-ի դիմանկարը" },
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
