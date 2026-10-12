/**
 * Ranking / listicle SEO topics, "ყველაზე ჭკვიანი / ეჭვიანი / რომანტიული …
 * ზოდიაქოს ნიშნები". Each topic becomes a page at /zodiac/reitingebi/[topic]
 * that ranks all 12 signs by a trait. Content is generated on-demand by the
 * AI and cached in the `sign_ranking` table (see actions/sign-ranking).
 *
 * Slugs are Latin-transliterated to keep URLs ASCII, matching the rest of the
 * /zodiac SEO surface (aries, tavsebadoba, mtvare, …).
 */

export type RankingCategory =
  | "love"
  | "personality"
  | "shadow"
  | "success"
  | "social";

export type RankingTopic = {
  /** URL slug (Latin). */
  slug: string;
  /** Full H1 / <title>, e.g. "ყველაზე ჭკვიანი ზოდიაქოს ნიშნები". */
  titleKa: string;
  /** Short label for hub cards / breadcrumbs, e.g. "ყველაზე ჭკვიანი". */
  shortKa: string;
  /** Trait description fed to the model to rank by. */
  traitKa: string;
  emoji: string;
  category: RankingCategory;
};

export const RANKING_CATEGORIES: Record<RankingCategory, string> = {
  love: "სიყვარული და ურთიერთობები",
  personality: "ხასიათი",
  shadow: "ჩრდილოვანი მხარე",
  success: "წარმატება და კარიერა",
  social: "ადამიანური თვისებები",
};

export const RANKING_CATEGORY_ORDER: RankingCategory[] = [
  "love",
  "personality",
  "success",
  "social",
  "shadow",
];

export const RANKING_TOPICS: RankingTopic[] = [
  // ── Love & relationships ──
  {
    slug: "tavsebadi",
    titleKa: "ყველაზე თავსებადი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე თავსებადი",
    traitKa:
      "საერთო რომანტიული და ემოციური თავსებადობა, რომელ ნიშნებს ყველაზე ადვილად ეწყობათ ჰარმონიული ურთიერთობა",
    emoji: "💞",
    category: "love",
  },
  {
    slug: "romantiuli",
    titleKa: "ყველაზე რომანტიული ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე რომანტიული",
    traitKa: "რომანტიკა, ნაზობა, ლამაზი ჟესტები და სიყვარულში ჩაძირვის უნარი",
    emoji: "🌹",
    category: "love",
  },
  {
    slug: "ertguli",
    titleKa: "ყველაზე ერთგული ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ერთგული",
    traitKa: "ერთგულება, სანდოობა და თავდადება ურთიერთობაში",
    emoji: "💍",
    category: "love",
  },
  {
    slug: "echviani",
    titleKa: "ყველაზე ეჭვიანი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ეჭვიანი",
    traitKa: "ეჭვიანობა, მფლობელობითობა და კონტროლის სურვილი ურთიერთობებში",
    emoji: "🔥",
    category: "love",
  },
  {
    slug: "vnebiani",
    titleKa: "ყველაზე ვნებიანი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ვნებიანი",
    traitKa: "ვნება, ინტენსივობა და სიყვარულის მგზნებარე, ფიზიკური მხარე",
    emoji: "💋",
    category: "love",
  },
  {
    slug: "mimzidveli",
    titleKa: "ყველაზე მიმზიდველი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე მიმზიდველი",
    traitKa: "ბუნებრივი ხიბლი, მაგნეტიზმი და მიმზიდველობა",
    emoji: "✨",
    category: "love",
  },

  // ── Personality ──
  {
    slug: "chkviani",
    titleKa: "ყველაზე ჭკვიანი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ჭკვიანი",
    traitKa: "ინტელექტი, სწრაფი აზროვნება, ანალიტიკა და ცნობისმოყვარეობა",
    emoji: "🧠",
    category: "personality",
  },
  {
    slug: "dzlieri",
    titleKa: "ყველაზე ძლიერი ხასიათის ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ძლიერი ხასიათის",
    traitKa: "შინაგანი სიმტკიცე, ნებისყოფა, გამძლეობა და სტრესის გაძლების უნარი",
    emoji: "💪",
    category: "personality",
  },
  {
    slug: "jiuti",
    titleKa: "ყველაზე ჯიუტი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ჯიუტი",
    traitKa: "სიჯიუტე, პრინციპულობა და დათმობის, კომპრომისის სირთულე",
    emoji: "🐂",
    category: "personality",
  },
  {
    slug: "emociuri",
    titleKa: "ყველაზე ემოციური ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ემოციური",
    traitKa: "ემოციურობა, გრძნობების სიღრმე და მათი ღია გამოხატვა",
    emoji: "🌊",
    category: "personality",
  },
  {
    slug: "mkhiaruli",
    titleKa: "ყველაზე მხიარული ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე მხიარული",
    traitKa: "იუმორი, მხიარულება, ოპტიმიზმი და სიცოცხლის სიყვარული",
    emoji: "😄",
    category: "personality",
  },
  {
    slug: "damoukidebeli",
    titleKa: "ყველაზე დამოუკიდებელი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე დამოუკიდებელი",
    traitKa: "დამოუკიდებლობა, თავისუფლების სიყვარული და თვითკმარობა",
    emoji: "🦅",
    category: "personality",
  },
  {
    slug: "mgrdznobiare",
    titleKa: "ყველაზე მგრძნობიარე ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე მგრძნობიარე",
    traitKa: "მგრძნობელობა, ემპათია და სხვისი ემოციების ღრმად აღქმა",
    emoji: "🌙",
    category: "personality",
  },

  // ── Success & career ──
  {
    slug: "lideri",
    titleKa: "ყველაზე კარგი ლიდერი ზოდიაქოს ნიშნები",
    shortKa: "საუკეთესო ლიდერი",
    traitKa: "ლიდერობა, გავლენა, გადაწყვეტილების მიღება და ხალხის წაყვანის უნარი",
    emoji: "🏆",
    category: "success",
  },
  {
    slug: "shromismoyvare",
    titleKa: "ყველაზე შრომისმოყვარე ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე შრომისმოყვარე",
    traitKa: "შრომისმოყვარეობა, დისციპლინა და გამძლეობა საქმეში",
    emoji: "🛠️",
    category: "success",
  },
  {
    slug: "ighbliani",
    titleKa: "ყველაზე იღბლიანი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე იღბლიანი",
    traitKa: "იღბალი, შესაძლებლობების მოზიდვა და ბუნებრივი ოპტიმიზმი",
    emoji: "🍀",
    category: "success",
  },
  {
    slug: "mizandasakhuli",
    titleKa: "ყველაზე მიზანდასახული ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე მიზანდასახული",
    traitKa: "ამბიცია, მიზანდასახულობა და დაჟინებული სწრაფვა წარმატებისკენ",
    emoji: "🎯",
    category: "success",
  },

  // ── Human qualities ──
  {
    slug: "patiosani",
    titleKa: "ყველაზე პატიოსანი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე პატიოსანი",
    traitKa: "გულწრფელობა, პატიოსნება და სიმართლის პირდაპირ თქმის უნარი",
    emoji: "🤝",
    category: "social",
  },
  {
    slug: "guluxvi",
    titleKa: "ყველაზე გულუხვი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე გულუხვი",
    traitKa: "გულუხვობა, ხელგაშლილობა და სხვებზე ზრუნვა",
    emoji: "🎁",
    category: "social",
  },
  {
    slug: "ndobiani",
    titleKa: "ყველაზე სანდო ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე სანდო",
    traitKa: "სანდოობა, საიმედოობა და დაპირების შესრულება",
    emoji: "🛡️",
    category: "social",
  },

  // ── Shadow side ──
  {
    slug: "gabrazebadi",
    titleKa: "ყველაზე გაბრაზებადი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე გაბრაზებადი",
    traitKa: "სწრაფი გაბრაზება, ცხელი ტემპერამენტი და იმპულსურობა",
    emoji: "⚡",
    category: "shadow",
  },
  {
    slug: "egoisti",
    titleKa: "ყველაზე ეგოისტი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ეგოისტი",
    traitKa: "ეგოიზმი, საკუთარ თავსა და ინტერესებზე ფოკუსი",
    emoji: "👑",
    category: "shadow",
  },
  {
    slug: "civi",
    titleKa: "ყველაზე ცივი ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე ცივი",
    traitKa: "ემოციური სიცივე, დისტანცია და თავშეკავება გრძნობების გამოხატვაში",
    emoji: "❄️",
    category: "shadow",
  },
  {
    slug: "sashishi",
    titleKa: "ყველაზე საშიში ზოდიაქოს ნიშნები",
    shortKa: "ყველაზე საშიში",
    traitKa: "ინტენსივობა, შურისძიების უნარი და გაბრაზებისას სახიფათოობა",
    emoji: "🦂",
    category: "shadow",
  },
];

export const ALL_RANKING_SLUGS = RANKING_TOPICS.map((t) => t.slug);

export function rankingTopicBySlug(slug: string): RankingTopic | undefined {
  return RANKING_TOPICS.find((t) => t.slug === slug);
}
