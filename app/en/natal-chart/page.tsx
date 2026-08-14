import type { Metadata } from "next";

import { NatalChartPageEn } from "@/components/seo/natal-chart-page-en";
import { ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/natal-chart";
const URL = `${ENGLISH_SITE_URL}/natal-chart`;
const TITLE = "What Is a Natal Chart? A Beginner's Birth Chart Guide";
const DESCRIPTION = "Learn what a natal chart shows, why birth time matters, and how planets, zodiac signs, houses and aspects combine in a birth chart.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/nataluri-ruka", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, locale: "en_US", alternateLocale: ["ka_GE"] },
};

export default function EnglishNatalChartPage() {
  return <NatalChartPageEn />;
}
