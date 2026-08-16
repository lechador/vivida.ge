import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
import { AstrologyCalendarHubEn, CALENDAR_META_EN } from "@/components/seo/astrology-calendar-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
const title = "იღბლიანი დღეები — უახლოესი ხელსაყრელი თარიღები";
const description = "ნახე მომდევნო 90 დღის იღბლიანი და ხელსაყრელი თარიღები პლანეტარული ასპექტების მიხედვით — საქმეებისთვის, სიყვარულისა და ახალი დასაწყისისთვის.";
export const revalidate = 86400;
export async function generateMetadata(): Promise<Metadata> { const locale = await getRequestLocale(); const path = "/ighbliani-dgheebi"; if (locale === "en") { const en = CALENDAR_META_EN.lucky; return { title: { absolute: en.title }, description: en.description, alternates: localizedAlternates(path, path, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title: en.title, description: en.description, locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title: en.title, description: en.description } }; } return { title: { absolute: title }, description, keywords: ["იღბლიანი დღეები", "იღბლიანი დღე", "ხელსაყრელი დღეები", "კარგი დღე დასაწყისისთვის"], alternates: localizedAlternates(path, path, "ka"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vivida.ge${path}`, title, description, locale: "ka_GE", siteName: "Vivida" } }; }
export default async function Page() { return (await getRequestLocale()) === "en" ? <AstrologyCalendarHubEn filter="lucky" /> : <AstrologyCalendarHub filter="lucky" />; }
