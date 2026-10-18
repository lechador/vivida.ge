import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type HoroscopeTheme = "love" | "career" | "finance";

export const ALL_HOROSCOPE_THEMES: HoroscopeTheme[] = [
  "love",
  "career",
  "finance",
];

export type ThemeConfig = {
  slug: string;
  label: string;
  shortLabel: string;
  genitive: string;
  inForm: string;
  glyph: string;
  title: string;
  description: string;
  intro: string;
  keywords: string[];
};

export const THEME_CONFIG: Record<HoroscopeTheme, ThemeConfig> = {
  love: {
    slug: "siyvarulis-horoskopi",
    label: "სიყვარულის ჰოროსკოპი",
    shortLabel: "სიყვარული",
    genitive: "სასიყვარულო",
    inForm: "სიყვარულში",
    glyph: "💞",
    title: "სიყვარულის ჰოროსკოპი — 12 ზოდიაქოს ნიშანი ურთიერთობაში",
    description:
      "სიყვარულის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის: როგორ უყვართ, რას ეძებენ პარტნიორში, რა აძლიერებს კავშირს და რას უნდა მიაქციონ ყურადღება.",
    intro:
      "თითოეული ზოდიაქოს ნიშანი სიყვარულს საკუთარი სტიქიის ენაზე გამოხატავს — ზოგი პირდაპირი ვნებით, ზოგი მშვიდი ერთგულებით, ზოგიც საუბრითა და სულიერი სიახლოვით.",
    keywords: [
      "სიყვარულის ჰოროსკოპი",
      "სასიყვარულო ჰოროსკოპი",
      "ზოდიაქოს ნიშნები სიყვარულში",
      "siyvarulis horoskopi",
    ],
  },
  career: {
    slug: "karieris-horoskopi",
    label: "კარიერის ჰოროსკოპი",
    shortLabel: "კარიერა",
    genitive: "კარიერული",
    inForm: "კარიერაში",
    glyph: "🚀",
    title: "კარიერის ჰოროსკოპი — პროფესია, ამბიცია და სამუშაო სტილი",
    description:
      "კარიერის ჰოროსკოპი 12 ზოდიაქოს ნიშნისთვის: ძლიერი პროფესიული მხარეები, გუნდური როლი, მოტივაცია და განვითარების რჩევები.",
    intro:
      "სამუშაო სტილი, გადაწყვეტილების მიღების ტემპი და პროფესიული მოტივაცია ყველა ნიშანს განსხვავებული აქვს. ნახე, სად ვლინდება შენი ნიშნის ბუნებრივი უპირატესობა.",
    keywords: [
      "კარიერის ჰოროსკოპი",
      "პროფესიული ჰოროსკოპი",
      "ზოდიაქოს ნიშნები და კარიერა",
      "karieris horoskopi",
    ],
  },
  finance: {
    slug: "finansuri-horoskopi",
    label: "ფინანსური ჰოროსკოპი",
    shortLabel: "ფინანსები",
    genitive: "ფინანსური",
    inForm: "ფინანსებში",
    glyph: "💎",
    title: "ფინანსური ჰოროსკოპი — ფული, რესურსები და სტაბილურობა",
    description:
      "ფინანსური ჰოროსკოპი ზოდიაქოს ნიშნების მიხედვით: ფულის გამომუშავების, ხარჯვისა და დაგროვების ჩვევები და პრაქტიკული რჩევები.",
    intro:
      "როგორ ეპყრობა თითოეული ზოდიაქოს ნიშანი მატერიალურ უსაფრთხოებას, რისკსა და გრძელვადიან დაგეგმვას.",
    keywords: [
      "ფინანსური ჰოროსკოპი",
      "ფულის ჰოროსკოპი",
      "ზოდიაქო და ფული",
      "finansuri horoskopi",
    ],
  },
};

export function themeUrl(theme: HoroscopeTheme, sign?: ZodiacSlug): string {
  const base = `/${THEME_CONFIG[theme].slug}`;
  return sign ? `${base}/${sign}` : base;
}

export function themeContent(
  theme: HoroscopeTheme,
  sign: ZodiacSlug,
): {
  focus: string;
  main: string;
  watch: string;
  advice: string;
} {
  const sc = SIGNS_CONTENT[sign];
  if (theme === "love") {
    return {
      focus: `${sc.labelKa} სიყვარულში აფასებს გულწრფელობას, ემოციურ რეზონანსსა და პარტნიორთან ცოცხალ კავშირს.`,
      main: sc.loveKa,
      watch: `მოერიდე დაუმعلنებელ მოლოდინებს და პარტნიორისგან აზრების უსიტყვოდ გამოცნობის მოთხოვნას.`,
      advice: `პირდაპირ და თბილად გაუზიარე პარტნიორს, რა განიჭებს უსაფრთხოებისა და სიახლოვის განცდას.`,
    };
  }
  if (theme === "career") {
    return {
      focus: `${sc.labelKa} საქმეში გამოირჩევა საკუთარი სტიქიის ძალით, პასუხისმგებლობითა და მკაფიო ხედვით.`,
      main: sc.careerKa,
      watch: `ყურადღება მიაქციე გადაღლას და ნუ აიღებ ყველა ამოცანას საკუთარ თავზე ერთდროულად.`,
      advice: `დააკავშირე ყოველდღიური სამუშაო გრძელვადიან პროფესიულ მიზანთან და გამოიყენე შენი ძლიერი უნარები.`,
    };
  }
  return {
    focus: `${sc.labelKa} ფინანსურ გადაწყვეტილებებში აერთიანებს საკუთარ ღირებულებებსა და პრაქტიკულ გამოცდილებას.`,
    main: `${sc.careerKa}\n\nმატერიალურ საკითხებში ${sc.labelKa}-ისთვის მნიშვნელოვანია ბალანსი მიმდინარე სიამოვნებასა და სამომავლო სიმშვიდეს შორის.`,
    watch: `მოერიდე ემოციურ ან იმპულსურ ხარჯვას დაძაბული დღეების შემდეგ.`,
    advice: `შექმენი მარტივი, პროგნოზირებადი ფინანსური ჩვევა, რომელიც თავისუფლებასაც გიტოვებს და საყრდენსაც გიქმნის.`,
  };
}
