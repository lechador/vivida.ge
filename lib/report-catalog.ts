import type { UserLocale } from "@/lib/i18n/user-locale";

export const REPORT_PRODUCT_KEYS = [
  "annual",
  "relationship",
  "career",
  "timing",
] as const;
export type ReportProductKey = (typeof REPORT_PRODUCT_KEYS)[number];

export type LocalizedText = { ka: string; en: string };
export type ReportProduct = {
  key: ReportProductKey;
  credits: number;
  title: LocalizedText;
  shortTitle: LocalizedText;
  description: LocalizedText;
  includes: LocalizedText[];
  accent: "violet" | "pink" | "cyan" | "gold";
};

export const REPORT_PRODUCTS: Record<ReportProductKey, ReportProduct> = {
  annual: {
    key: "annual",
    credits: 25,
    accent: "violet",
    title: { ka: "შენი პერსონალური წელი", en: "Your personal year" },
    shortTitle: { ka: "წლიური რეპორტი", en: "Annual report" },
    description: {
      ka: "მომდევნო 12 თვის მთავარი თემები, შესაძლებლობები და გარდამტეხი პერიოდები.",
      en: "The next 12 months: major themes, opportunities and turning points.",
    },
    includes: [
      { ka: "12-თვიანი პერსონალური ხედვა", en: "A personal 12-month outlook" },
      { ka: "მთავარი ტრანზიტები და თარიღები", en: "Major transits and dates" },
      {
        ka: "პრაქტიკული წლიური სამოქმედო გეგმა",
        en: "A practical annual action plan",
      },
    ],
  },
  relationship: {
    key: "relationship",
    credits: 25,
    accent: "pink",
    title: {
      ka: "ურთიერთობის სიღრმისეული რეპორტი",
      en: "Deep relationship report",
    },
    shortTitle: { ka: "ურთიერთობის რეპორტი", en: "Relationship report" },
    description: {
      ka: "თქვენი დინამიკა, სიახლოვე, კომუნიკაცია, დაძაბულობის წერტილები და ზრდის გზა.",
      en: "Your dynamic, intimacy, communication, friction points and path to growth.",
    },
    includes: [
      {
        ka: "6 სფეროს თავსებადობის ანალიზი",
        en: "Compatibility across 6 areas",
      },
      {
        ka: "ძლიერი და რთული ასპექტები",
        en: "Supportive and challenging aspects",
      },
      {
        ka: "საერთო პრაქტიკული კითხვები",
        en: "Practical questions to explore together",
      },
    ],
  },
  career: {
    key: "career",
    credits: 18,
    accent: "cyan",
    title: { ka: "კარიერა და მოწოდება", en: "Career and calling" },
    shortTitle: { ka: "კარიერის რეპორტი", en: "Career report" },
    description: {
      ka: "შენი პროფესიული ძლიერი მხარეები, სამუშაო სტილი, ზრდის ბარიერები და მიმართულებები.",
      en: "Your professional strengths, work style, growth barriers and directions.",
    },
    includes: [
      {
        ka: "MC-ისა და კარიერული სახლების ანალიზი",
        en: "Midheaven and career-house analysis",
      },
      {
        ka: "ტალანტები და სამუშაო გარემო",
        en: "Talents and ideal work environment",
      },
      { ka: "90-დღიანი განვითარების გეგმა", en: "A 90-day growth plan" },
    ],
  },
  timing: {
    key: "timing",
    credits: 20,
    accent: "gold",
    title: { ka: "შენი მომდევნო 90 დღე", en: "Your next 90 days" },
    shortTitle: { ka: "Timing რეპორტი", en: "Timing report" },
    description: {
      ka: "როდის იმოქმედო, როდის მოითმინო და რომელ დღეებს მიაქციო განსაკუთრებული ყურადღება.",
      en: "When to act, when to wait and which dates deserve special attention.",
    },
    includes: [
      {
        ka: "90-დღიანი ენერგეტიკული კალენდარი",
        en: "A 90-day energy calendar",
      },
      {
        ka: "საუკეთესო და ფრთხილი პერიოდები",
        en: "Best windows and caution periods",
      },
      {
        ka: "მნიშვნელოვანი პირადი ტრანზიტები",
        en: "Important personal transits",
      },
    ],
  },
};

export const REPORT_BUNDLES = {
  momentum: {
    key: "momentum",
    products: ["career", "timing"],
    credits: 34,
    title: { ka: "მიმართულება + სწორი დრო", en: "Direction + right timing" },
  },
  relationship_timing: {
    key: "relationship_timing",
    products: ["relationship", "timing"],
    credits: 40,
    title: { ka: "ურთიერთობა + სწორი დრო", en: "Relationship + right timing" },
  },
  year_ahead: {
    key: "year_ahead",
    products: ["annual", "career", "timing"],
    credits: 54,
    title: { ka: "წლის სრული ნავიგატორი", en: "Complete year navigator" },
  },
  love_year: {
    key: "love_year",
    products: ["annual", "relationship", "timing"],
    credits: 60,
    title: { ka: "სიყვარულის წლის ნავიგატორი", en: "Love-year navigator" },
  },
} as const satisfies Record<
  string,
  {
    key: string;
    products: readonly ReportProductKey[];
    credits: number;
    title: LocalizedText;
  }
>;

export type ReportBundleKey = keyof typeof REPORT_BUNDLES;

export function localized(text: LocalizedText, locale: UserLocale): string {
  return text[locale];
}

export function isReportProductKey(value: unknown): value is ReportProductKey {
  return (
    typeof value === "string" &&
    REPORT_PRODUCT_KEYS.includes(value as ReportProductKey)
  );
}

export function isReportBundleKey(value: unknown): value is ReportBundleKey {
  return typeof value === "string" && value in REPORT_BUNDLES;
}

export function reportEditionKey(
  type: ReportProductKey,
  now = new Date(),
  chartHash = "chart",
  subjectKey = "",
): string {
  if (type === "annual") return String(now.getUTCFullYear());
  if (type === "timing")
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  if (type === "relationship") return `${subjectKey}:${chartHash}`;
  return chartHash;
}

export function bundleSavings(key: ReportBundleKey): number {
  const bundle = REPORT_BUNDLES[key];
  return (
    bundle.products.reduce(
      (sum, product) => sum + REPORT_PRODUCTS[product].credits,
      0,
    ) - bundle.credits
  );
}

/** Preserve the bundle discount when some products are already owned. */
export function bundleRemainingPrice(
  key: ReportBundleKey,
  missing: readonly ReportProductKey[],
): number {
  if (missing.length === 0) return 0;
  const bundle = REPORT_BUNDLES[key];
  const fullPrice = bundle.products.reduce(
    (sum, product) => sum + REPORT_PRODUCTS[product].credits,
    0,
  );
  const missingPrice = missing.reduce(
    (sum, product) => sum + REPORT_PRODUCTS[product].credits,
    0,
  );
  return Math.max(1, Math.ceil((missingPrice * bundle.credits) / fullPrice));
}
