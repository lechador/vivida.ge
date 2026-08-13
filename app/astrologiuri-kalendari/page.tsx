import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
import { AstrologyCalendarHubEn, CALENDAR_META_EN } from "@/components/seo/astrology-calendar-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { localizedAlternates } from "@/lib/seo/locales";
const title = "ასტროლოგიური კალენდარი — იღბლიანი და ფრთხილი დღეები";
const description = "ასტროლოგიური კალენდარი ქართულად: დღის პლანეტარული ასპექტები, იღბლიანი და ფრთხილი დღეები, 30-დღიანი პროგნოზი და პრაქტიკული რჩევები.";
export const revalidate = 86400;
export async function generateMetadata(): Promise<Metadata> { const locale = await getRequestLocale(); const path = "/astrologiuri-kalendari"; if (locale === "en") { const en = CALENDAR_META_EN.all; return { title: { absolute: en.title }, description: en.description, keywords: ["astrology calendar", "lucky astrology days", "planetary aspects today", "challenging astrology days"], alternates: localizedAlternates(path, path, "en"), openGraph: { type: "website", url: `https://www.vividaastro.com${path}`, title: en.title, description: en.description, locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title: en.title, description: en.description } }; } return { title: { absolute: title }, description, keywords: ["ასტროლოგიური კალენდარი", "იღბლიანი დღეები", "ფრთხილი დღეები", "დღის ასტროლოგიური პროგნოზი"], alternates: localizedAlternates(path, path, "ka"), openGraph: { type: "website", url: `https://www.vivida.ge${path}`, title, description, locale: "ka_GE", siteName: "Vivida" } }; }
export default async function Page() { return (await getRequestLocale()) === "en" ? <AstrologyCalendarHubEn /> : <AstrologyCalendarHub />; }
