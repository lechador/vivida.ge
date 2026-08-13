import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeHubEn, thematicHubMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
export async function generateMetadata(): Promise<Metadata> { return (await getRequestLocale()) === "en" ? thematicHubMetadataEn("love") : thematicHubMetadata("love"); }
export default async function LoveHoroscopePage() { return (await getRequestLocale()) === "en" ? <ThematicHoroscopeHubEn theme="love" /> : <ThematicHoroscopeHub theme="love" />; }
