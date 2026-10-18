export type RankingCategory = "mind" | "love" | "power" | "emotion";

export type RankingTopic = {
  slug: string;
  category: RankingCategory;
  emoji: string;
  shortKa: string;
  titleKa: string;
  traitKa: string;
};

export const RANKING_CATEGORY_ORDER: RankingCategory[] = [
  "mind",
  "love",
  "power",
  "emotion",
];

export const RANKING_CATEGORIES: Record<RankingCategory, string> = {
  mind: "გონება და ინტუიცია",
  love: "სიყვარული და ურთიერთობები",
  power: "ძალა, ამბიცია და წარმატება",
  emotion: "ემოციები და ხასიათის შტრიხები",
};

export const RANKING_TOPICS: RankingTopic[] = [
  {
    slug: "chkviani",
    category: "mind",
    emoji: "🧠",
    shortKa: "ყველაზე ჭკვიანი",
    titleKa: "ყველაზე ჭკვიანი ზოდიაქოს ნიშნები",
    traitKa: "ანალიტიკური აზროვნება, სისწრაფე და გამჭრიახობა",
  },
  {
    slug: "intuituri",
    category: "mind",
    emoji: "🔮",
    shortKa: "ყველაზე ინტუიციური",
    titleKa: "ყველაზე ინტუიციური ზოდიაქოს ნიშნები",
    traitKa: "წინათგრძნობა, ფარული მოტივების ამოცნობა და სიღრმისეული აღქმა",
  },
  {
    slug: "romantiuli",
    category: "love",
    emoji: "💘",
    shortKa: "ყველაზე რომანტიული",
    titleKa: "ყველაზე რომანტიული ზოდიაქოს ნიშნები",
    traitKa: "სითბო, ყურადღება და სიყვარულის ლამაზად გამოხატვა",
  },
  {
    slug: "ertguli",
    category: "love",
    emoji: "🤝",
    shortKa: "ყველაზე ერთგული",
    titleKa: "ყველაზე ერთგული ზოდიაქოს ნიშნები",
    traitKa: "სტაბილურობა, სანდოობა და პარტნიორის გვერდით დგომა",
  },
  {
    slug: "echviani",
    category: "love",
    emoji: "🔥",
    shortKa: "ყველაზე ეჭვიანი",
    titleKa: "ყველაზე ეჭვიანი ზოდიაქოს ნიშნები",
    traitKa: "მესაკუთრეობა, ემოციური სიმძაფრე და ნდობის გამოცდა",
  },
  {
    slug: "dzlieri",
    category: "power",
    emoji: "🦁",
    shortKa: "ყველაზე ძლიერი",
    titleKa: "ყველაზე ძლიერი ხასიათის ზოდიაქოს ნიშნები",
    traitKa: "ნებისყოფა, გამძლეობა და კრიზისში სიმტკიცე",
  },
  {
    slug: "lideri",
    category: "power",
    emoji: "👑",
    shortKa: "საუკეთესო ლიდერი",
    titleKa: "ყველაზე ძლიერი ლიდერი ზოდიაქოს ნიშნები",
    traitKa: "ინიციატივა, პასუხისმგებლობის აღება და სხვების გაძღოლა",
  },
  {
    slug: "mgrdznobiare",
    category: "emotion",
    emoji: "🌊",
    shortKa: "ყველაზე მგრძნობიარე",
    titleKa: "ყველაზე მგრძნობიარე და ემპათიური ზოდიაქოს ნიშნები",
    traitKa: "ემოციური სიღრმე, თანაგრძნობა და გარემოს ფაქიზი აღქმა",
  },
];

export const ALL_RANKING_SLUGS: string[] = RANKING_TOPICS.map((t) => t.slug);

export function rankingTopicBySlug(slug: string): RankingTopic | undefined {
  return RANKING_TOPICS.find((t) => t.slug === slug);
}
