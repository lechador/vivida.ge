export type TarotDetailCard = {
  slug: string;
  name: string;
  nameEn: string;
  glyph: string;
  arcana: "major" | "minor";
  eyebrow: string;
  image: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
};

const MAJOR_CARDS: Array<{
  slug: string;
  nameKa: string;
  nameEn: string;
  glyph: string;
  numeral: string;
}> = [
  { slug: "suleli", nameKa: "სულელი", nameEn: "The Fool", glyph: "0", numeral: "0" },
  { slug: "magosi", nameKa: "მაგოსი", nameEn: "The Magician", glyph: "I", numeral: "I" },
  { slug: "qurumi-qali", nameKa: "ქურუმი ქალი", nameEn: "The High Priestess", glyph: "II", numeral: "II" },
  { slug: "imperatrica", nameKa: "იმპერატრიცა", nameEn: "The Empress", glyph: "III", numeral: "III" },
  { slug: "imperatori", nameKa: "იმპერატორი", nameEn: "The Emperor", glyph: "IV", numeral: "IV" },
  { slug: "shekvarebulebi", nameKa: "შეყვარებულები", nameEn: "The Lovers", glyph: "VI", numeral: "VI" },
  { slug: "varskvlavi", nameKa: "ვარსკვლავი", nameEn: "The Star", glyph: "XVII", numeral: "XVII" },
  { slug: "mtvare", nameKa: "მთვარე", nameEn: "The Moon", glyph: "XVIII", numeral: "XVIII" },
  { slug: "mze", nameKa: "მზე", nameEn: "The Sun", glyph: "XIX", numeral: "XIX" },
  { slug: "samyaro", nameKa: "სამყარო", nameEn: "The World", glyph: "XXI", numeral: "XXI" },
];

export function tarotDetailDeck(locale: "ka" | "en" = "ka"): TarotDetailCard[] {
  const en = locale === "en";
  return MAJOR_CARDS.map((c) => ({
    slug: c.slug,
    name: en ? c.nameEn : c.nameKa,
    nameEn: c.nameEn,
    glyph: c.glyph,
    arcana: "major",
    eyebrow: en ? `Major Arcana · ${c.numeral}` : `უფროსი არკანი · ${c.numeral}`,
    image: `/tarot/${c.slug}.webp`,
    keywords: en
      ? ["Intuition", "Beginnings", "Clarity"]
      : ["ინტუიცია", "დასაწყისი", "სიცხადე"],
    reversedKeywords: en
      ? ["Hesitation", "Delay", "Reflection"]
      : ["ყოყმანი", "დაყოვნება", "დაფიქრება"],
    upright: en
      ? `${c.nameEn} represents conscious renewal, inner alignment, and stepping forward with clarity.`
      : `„${c.nameKa}" განასახიერებს შინაგან განახლებას, გააზრებულ არჩევანსა და ახალ ეტაპზე გადასვლის მზაობას.`,
    reversed: en
      ? `When reversed, ${c.nameEn} suggests pausing to review assumptions before rushing ahead.`
      : `შებრუნებულ პოზიციაში „${c.nameKa}" მიუთითებს დაფიქრებისა და შინაგანი ბალანსის აღდგენის საჭიროებაზე.`,
    love: en
      ? "In relationships, openness and honest presence deepen mutual trust."
      : "ურთიერთობებში ეს კარტი გულწრფელობას, ემოციურ სითბოსა და ნდობის გაღრმავებას უსვამს ხაზს.",
    career: en
      ? "In work and projects, focus on creative initiative and steady execution."
      : "კარიერასა და საქმეში ხელს უწყობს ახალ იდეებს, თავდაჯერებულ ნაბიჯებსა და მკაფიო პრიორიტეტებს.",
  }));
}

export function tarotDetailSlugs(): string[] {
  return MAJOR_CARDS.map((c) => c.slug);
}

export function tarotDetailCard(
  slug: string,
  locale: "ka" | "en" = "ka",
): TarotDetailCard | null {
  return tarotDetailDeck(locale).find((c) => c.slug === slug) ?? null;
}
