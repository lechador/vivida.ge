import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeHubEn, thematicHubMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
export async function generateMetadata(): Promise<Metadata> { return (await getRequestLocale()) === "en" ? thematicHubMetadataEn("career") : thematicHubMetadata("career"); }
export default async function CareerHoroscopePage() { return (await getRequestLocale()) === "en" ? <ThematicHoroscopeHubEn theme="career" /> : <ThematicHoroscopeHub theme="career" />; }
