import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeHubEn, thematicHubMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { ThematicHoroscopeHubAm, thematicHubMetadataAm } from "@/components/seo/thematic-horoscope-pages-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "am") return thematicHubMetadataAm("love");
  if (locale === "en") return thematicHubMetadataEn("love");
  return thematicHubMetadata("love");
}

export default async function LoveHoroscopePage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <ThematicHoroscopeHubAm theme="love" />;
  if (locale === "en") return <ThematicHoroscopeHubEn theme="love" />;
  return <ThematicHoroscopeHub theme="love" />;
}
