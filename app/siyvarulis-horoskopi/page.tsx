import type { Metadata } from "next";
import {
  ThematicHoroscopeHub,
  thematicHubMetadata,
} from "@/components/seo/thematic-horoscope-pages";
import {
  ThematicHoroscopeHubEn,
  thematicHubMetadataEn,
} from "@/components/seo/thematic-horoscope-pages-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") return thematicHubMetadataEn("love");
  return thematicHubMetadata("love");
}

export default async function LoveHoroscopePage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <ThematicHoroscopeHubEn theme="love" />;
  return <ThematicHoroscopeHub theme="love" />;
}
