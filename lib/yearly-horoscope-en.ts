import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { YEARLY_CONTENT_EN, type YearlyContentEn } from "@/lib/seo/zodiac-content-en";

export type YearlyHoroscopeEnglish = {
  title: string;
  description: string;
  tagline: string;
  overview: string[];
  supportiveMonths: string[];
  reflectiveMonths: string[];
  sections: Array<{ title: string; body: string }>;
  keyDates?: Array<{ date: string; note: string }>;
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

export function yearlyHoroscopeEnglish(sign: ZodiacSlug, year: number): YearlyHoroscopeEnglish {
  const name = signMetaBySlug(sign)!.labelEn;
  const yearlyData: YearlyContentEn | undefined = YEARLY_CONTENT_EN[String(year)]?.[sign];

  if (yearlyData) {
    const overviewParagraphs = (yearlyData.overview || "")
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const sections = [
      {
        title: yearlyData.love?.title || "Love and Relationships",
        body: yearlyData.love?.body || "",
      },
      {
        title: yearlyData.career?.title || "Career and Direction",
        body: yearlyData.career?.body || "",
      },
      {
        title: yearlyData.money?.title || "Money and Resources",
        body: yearlyData.money?.body || "",
      },
      {
        title: yearlyData.health?.title || "Wellbeing and Energy",
        body: yearlyData.health?.body || "",
      },
      {
        title: yearlyData.growth?.title || "Personal Growth",
        body: yearlyData.growth?.body || "",
      },
    ].filter((s) => Boolean(s.body));

    return {
      title: yearlyData.pageTitle || `${name} Horoscope ${year}: Love, Career and Year Ahead`,
      description: yearlyData.metaDescription || `${name} ${year} horoscope: explore the year's central themes.`,
      tagline: yearlyData.tagline || `${year} forecast for ${name}`,
      overview: overviewParagraphs.length > 0 ? overviewParagraphs : [yearlyData.overview],
      supportiveMonths: yearlyData.bestMonths || ["April", "July", "October"],
      reflectiveMonths: yearlyData.hardMonths || ["February", "August"],
      sections,
      keyDates: yearlyData.keyDates || [],
      advice: yearlyData.growth?.body || `Trust your steady growth and align actions with your core values throughout ${year}.`,
      faq: yearlyData.faq || [],
    };
  }

  // Fallback
  return {
    title: `${name} Horoscope ${year}`,
    description: `${name} ${year} horoscope`,
    tagline: `${year} is a year of growth for ${name}.`,
    overview: [`${year} forecast for ${name}.`],
    supportiveMonths: ["April", "July", "October"],
    reflectiveMonths: ["February", "August"],
    sections: [],
    advice: `Focus on consistent daily habits in ${year}.`,
    faq: [],
  };
}
