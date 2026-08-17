import type { Metadata } from "next";

import {
  PeriodHoroscopeHub,
  periodHubMetadata,
} from "@/components/seo/period-horoscope-hub";
import { PERIOD_EN, PeriodHoroscopeHubEn } from "@/components/seo/period-horoscope-hub-en";
import { PeriodHoroscopeHubAm, periodHubMetadataAm } from "@/components/seo/period-horoscope-hub-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

// ISR hourly — the underlying weekly horoscope rows are cached per ISO week.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "am") return periodHubMetadataAm("week");
  if (locale === "en") {
    const config = PERIOD_EN.week;
    return {
      title: { absolute: config.title },
      description: config.description,
      alternates: localizedAlternates(config.path, config.path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `https://www.vividaastro.com${config.path}`,
        title: config.title,
        description: config.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title: config.title, description: config.description },
    };
  }
  return periodHubMetadata("week");
}

export default async function WeeklyHoroscopeHubPage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <PeriodHoroscopeHubAm period="week" />;
  if (locale === "en") return <PeriodHoroscopeHubEn period="week" />;
  return <PeriodHoroscopeHub period="week" />;
}
