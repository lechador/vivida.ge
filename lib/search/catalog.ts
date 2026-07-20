import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_ELEMENT_SLUGS,
  ALL_SLUGS,
  ELEMENT_LABEL_KA,
} from "@/lib/seo/zodiac-dates";
import { SIGN_LATIN_NAMES } from "@/lib/seo/transliteration";
import { MBTI_TYPES } from "@/lib/mbti-library";
import { MBTI_GROUP } from "@/lib/seo/mbti-seo";
import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { LIFE_PATH_CONTENT } from "@/lib/seo/numerology-content";
import { CHINESE_ANIMALS } from "@/lib/seo/chinese-zodiac";
import { RANKING_TOPICS } from "@/lib/seo/rankings";

/**
 * Static, in-memory catalog of every public page worth surfacing in site
 * search. Built once at module load from the same SEO content libs the pages
 * themselves use, so titles/labels never drift. `terms` holds extra match
 * tokens (Georgian synonyms + Latin-on-QWERTY spellings) so the same query
 * matches whether typed in ქართული or Latin.
 */

export type SearchCategory =
  | "page"
  | "horoscope"
  | "sign"
  | "test"
  | "element"
  | "mbti"
  | "numerology"
  | "chinese"
  | "ranking";

export type SearchEntry = {
  title: string;
  sub: string;
  url: string;
  category: SearchCategory;
  /** Lowercased match tokens (title is added automatically). */
  terms: string[];
  /** Emoji/symbol shown in the result row. */
  icon?: string;
};

/** Curated top-level product + SEO hub pages. */
const PAGES: SearchEntry[] = [
  {
    title: "ჰოროსკოპი",
    sub: "დღის ჰოროსკოპი ყველა ნიშნისთვის",
    url: "/horoskopi",
    category: "horoscope",
    icon: "🔮",
    terms: ["horoskopi", "dgis horoskopi", "dghis horoskopi", "დღის", "დღევანდელი"],
  },
  {
    title: "კვირის ჰოროსკოპი",
    sub: "ამ კვირის პროგნოზი",
    url: "/horoskopi/kvireuli",
    category: "horoscope",
    icon: "🔮",
    terms: ["kviris horoskopi", "kvireuli", "ყოველკვირეული"],
  },
  {
    title: "თვის ჰოროსკოპი",
    sub: "ამ თვის პროგნოზი",
    url: "/horoskopi/tviuri",
    category: "horoscope",
    icon: "🔮",
    terms: ["tvis horoskopi", "tviuri", "ყოველთვიური"],
  },
  {
    title: "სიყვარულის ჰოროსკოპი",
    sub: "ზოდიაქოს 12 ნიშანი სიყვარულსა და ურთიერთობებში",
    url: "/siyvarulis-horoskopi",
    category: "horoscope",
    icon: "♥️",
    terms: ["siyvarulis horoskopi", "ურთიერთობის ჰოროსკოპი", "ზოდიაქო სიყვარულში"],
  },
  {
    title: "ფინანსური ჰოროსკოპი",
    sub: "ფული და ფინანსური ჩვევები ნიშნების მიხედვით",
    url: "/finansuri-horoskopi",
    category: "horoscope",
    icon: "💰",
    terms: ["finansuri horoskopi", "fulis horoskopi", "ზოდიაქო და ფული"],
  },
  {
    title: "კარიერის ჰოროსკოპი",
    sub: "პროფესია და სამუშაო სტილი ნიშნების მიხედვით",
    url: "/karieris-horoskopi",
    category: "horoscope",
    icon: "💼",
    terms: ["karieris horoskopi", "profesia zodiaqos mixedvit", "ზოდიაქო და კარიერა"],
  },
  {
    title: "ნატალური რუკა",
    sub: "შენი პერსონალური ცის რუკა — უფასოდ",
    url: "/nataluri-ruka",
    category: "page",
    icon: "🪐",
    terms: ["nataluri ruka", "chemi ruka", "ცის რუკა", "natal chart"],
  },
  {
    title: "თავსებადობა",
    sub: "შეამოწმე შენი კავშირი ვარსკვლავებით",
    url: "/tavsebadoba",
    category: "page",
    icon: "❤️",
    terms: ["tavsebadoba", "siyvaruli", "თავსებადობა", "სიყვარული"],
  },
  {
    title: "ტესტები",
    sub: "IQ, პიროვნების ტესტი და მეტი",
    url: "/tests",
    category: "test",
    icon: "🧠",
    terms: ["testebi", "test", "ტესტი"],
  },
  {
    title: "IQ ტესტი",
    sub: "გაზომე შენი ინტელექტი — უფასოდ",
    url: "/iq-testi",
    category: "test",
    icon: "🧠",
    terms: ["iq testi", "iq test", "ინტელექტი", "aikju"],
  },
  {
    title: "პიროვნების ტესტი",
    sub: "Astro-MBTI — შენი 16 ტიპიდან",
    url: "/pirovnebis-testi",
    category: "test",
    icon: "🧩",
    terms: ["pirovnebis testi", "mbti", "16 personalities", "პიროვნება"],
  },
  {
    title: "ნუმეროლოგია",
    sub: "ბედის რიცხვის გამოთვლა",
    url: "/numerologia",
    category: "numerology",
    icon: "🔢",
    terms: ["numerologia", "bedis ricxvi", "ბედის რიცხვი", "რიცხვები"],
  },
  {
    title: "მერკური რეტროგრადში",
    sub: "თარიღები და მნიშვნელობა",
    url: "/merkuri-retrogradi",
    category: "page",
    icon: "☿",
    terms: ["merkuri retrogradshi", "retrograduli merkuri", "რეტროგრადი"],
  },
  {
    title: "მთვარის კალენდარი",
    sub: "მთვარის ფაზები 30 დღეზე",
    url: "/mtvaris-kalendari",
    category: "page",
    icon: "🌙",
    terms: ["mtvaris kalendari", "mtvare", "მთვარე", "ფაზები"],
  },
  {
    title: "ასტროლოგიური კალენდარი",
    sub: "იღბლიანი და ფრთხილი დღეები",
    url: "/astrologiuri-kalendari",
    category: "horoscope",
    icon: "📅",
    terms: ["astrologiuri kalendari", "იღბლიანი დღეები", "ფრთხილი დღეები", "დღის ასტროლოგია"],
  },
  {
    title: "სავსე მთვარე",
    sub: "თარიღები, დრო და ზოდიაქოს ნიშანი",
    url: "/savse-mtvare",
    category: "horoscope",
    icon: "🌕",
    terms: ["savse mtvare", "როდის არის სავსე მთვარე", "შემდეგი სავსე მთვარე"],
  },
  {
    title: "ახალი მთვარე",
    sub: "თარიღები, დრო და ზოდიაქოს ნიშანი",
    url: "/akhali-mtvare",
    category: "horoscope",
    icon: "🌑",
    terms: ["akhali mtvare", "როდის არის ახალი მთვარე", "შემდეგი ახალი მთვარე"],
  },
  {
    title: "მზისა და მთვარის დაბნელებები",
    sub: "თარიღები, ტიპები და ხილვადობა",
    url: "/dabnelebebi",
    category: "horoscope",
    icon: "🌘",
    terms: ["dabneleba", "mzis dabneleba", "mtvaris dabneleba", "შემდეგი დაბნელება"],
  },
  {
    title: "იღბლიანი დღეები",
    sub: "უახლოესი ხელსაყრელი თარიღები",
    url: "/ighbliani-dgheebi",
    category: "horoscope",
    icon: "✦",
    terms: ["ighbliani dgheebi", "ხელსაყრელი დღეები", "კარგი დღე"],
  },
  {
    title: "ფრთხილი დღეები",
    sub: "თარიღები, როცა მეტი ყურადღებაა საჭირო",
    url: "/frtxili-dgheebi",
    category: "horoscope",
    icon: "△",
    terms: ["frtxili dgheebi", "არახელსაყრელი დღეები", "რთული დღეები"],
  },
  {
    title: "ცა ახლა",
    sub: "პლანეტების ცოცხალი მდებარეობა",
    url: "/sky",
    category: "page",
    icon: "✨",
    terms: ["ca akhla", "sky", "planetebi", "პლანეტები"],
  },
  {
    title: "ჩინური ჰოროსკოპი",
    sub: "ზოდიაქოს ცხოველები წლების მიხედვით",
    url: "/chinuri-horoskopi",
    category: "chinese",
    icon: "🐉",
    terms: ["chinuri horoskopi", "chinese zodiac", "wlebis", "ცხოველი"],
  },
  {
    title: "ზოდიაქოს ნიშნები",
    sub: "12 ნიშნის სრული აღწერა",
    url: "/zodiac",
    category: "sign",
    icon: "♈",
    terms: ["zodiaqos nishnebi", "zodiaqo", "ნიშნები", "12 ნიშანი"],
  },
  {
    title: "ზოდიაქო თარიღით",
    sub: "რომელი ნიშანი ხარ დაბადების თარიღით",
    url: "/zodiac/datit",
    category: "sign",
    icon: "📅",
    terms: ["zodiaqo tarigit", "ra nishani var", "თარიღით", "რა ნიშანი ვარ"],
  },
  {
    title: "ელემენტები",
    sub: "ცეცხლი, მიწა, ჰაერი, წყალი",
    url: "/zodiac/elementebi",
    category: "element",
    icon: "🔥",
    terms: ["elementebi", "cecxli", "mica", "haeri", "wyali"],
  },
  {
    title: "რეიტინგები",
    sub: "ყველაზე ჭკვიანი, ეჭვიანი, ვნებიანი ნიშნები",
    url: "/zodiac/reitingebi",
    category: "ranking",
    icon: "🏆",
    terms: ["reitingebi", "yvelaze", "რეიტინგი"],
  },
  {
    title: "როგორ მუშაობს",
    sub: "Vivida-ს შესახებ",
    url: "/how-it-works",
    category: "page",
    icon: "💫",
    terms: ["rogor mushaobs", "about"],
  },
];

function buildCatalog(): SearchEntry[] {
  const out: SearchEntry[] = [...PAGES];

  // Zodiac signs → sign hub. Terms cover Latin spellings + "<sign> ჰოროსკოპი".
  for (const slug of ALL_SLUGS) {
    const sc = SIGNS_CONTENT[slug];
    const latin = SIGN_LATIN_NAMES[slug] ?? [];
    out.push({
      title: sc.labelKa,
      sub: "ზოდიაქოს ნიშანი · ჰოროსკოპი, ხასიათი, თავსებადობა",
      url: `/zodiac/${slug}`,
      category: "sign",
      icon: sc.symbol,
      terms: [
        ...latin,
        ...latin.map((l) => `${l} horoskopi`),
        `${sc.labelKa} ჰოროსკოპი`,
        `${sc.labelKa} ნიშანი`,
      ],
    });
  }

  // Elements.
  for (const el of ALL_ELEMENT_SLUGS) {
    out.push({
      title: `${ELEMENT_LABEL_KA[el]}ის ნიშნები`,
      sub: "ელემენტი",
      url: `/zodiac/elementebi/${el}`,
      category: "element",
      icon: "🔥",
      terms: [el, ELEMENT_LABEL_KA[el]],
    });
  }

  // MBTI 16 types.
  for (const code of MBTI_TYPES) {
    const group = MBTI_GROUP[code];
    out.push({
      title: code,
      sub: `პიროვნების ტიპი · ${group?.labelKa ?? ""}`.trim(),
      url: `/mbti/${code.toLowerCase()}`,
      category: "mbti",
      icon: "🧩",
      terms: [code.toLowerCase(), "mbti", group?.labelKa ?? ""],
    });
  }

  // Numerology life-path numbers.
  for (const n of LIFE_PATH_NUMBERS) {
    const c = LIFE_PATH_CONTENT[n];
    out.push({
      title: `ბედის რიცხვი ${n}`,
      sub: c.archetypeKa,
      url: `/numerologia/${n}`,
      category: "numerology",
      icon: "🔢",
      terms: [`bedis ricxvi ${n}`, c.archetypeKa, `რიცხვი ${n}`],
    });
  }

  // Chinese zodiac animals.
  for (const a of CHINESE_ANIMALS) {
    out.push({
      title: a.nameKa,
      sub: "ჩინური ზოდიაქო",
      url: `/chinuri-horoskopi/${a.slug}`,
      category: "chinese",
      icon: a.emoji,
      terms: [a.slug, `${a.slug} chinese`, a.nameKa],
    });
  }

  // Ranking listicles.
  for (const t of RANKING_TOPICS) {
    out.push({
      title: t.titleKa,
      sub: "რეიტინგი",
      url: `/zodiac/reitingebi/${t.slug}`,
      category: "ranking",
      icon: "🏆",
      terms: [t.slug],
    });
  }

  // Pre-lowercase every match token once (title + terms) for fast matching.
  for (const e of out) {
    e.terms = Array.from(
      new Set([e.title.toLowerCase(), ...e.terms.filter(Boolean).map((t) => t.toLowerCase())])
    );
  }
  return out;
}

/** The catalog, built once per server process. */
export const SEARCH_CATALOG: SearchEntry[] = buildCatalog();
