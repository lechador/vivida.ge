import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeHubEn, thematicHubMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { ThematicHoroscopeHubAm, thematicHubMetadataAm } from "@/components/seo/thematic-horoscope-pages-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "am") return thematicHubMetadataAm("finance");
  if (locale === "en") return thematicHubMetadataEn("finance");
  return thematicHubMetadata("finance");
}

export default async function FinanceHoroscopePage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <ThematicHoroscopeHubAm theme="finance" />;
  if (locale === "en") return <ThematicHoroscopeHubEn theme="finance" />;
  return <ThematicHoroscopeHub theme="finance" />;
}
