import type { Metadata } from "next";
import { MoonPhaseHub } from "@/components/seo/moon-event-pages";
import { MOON_PHASE_META_EN, MoonPhaseHubEn } from "@/components/seo/moon-event-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
export const revalidate = 86400;
export async function generateMetadata(): Promise<Metadata> { const path = "/savse-mtvare"; if ((await getRequestLocale()) === "en") { const meta = MOON_PHASE_META_EN.full; return { title: { absolute: meta.title }, description: meta.description, keywords: ["full moon calendar", "next full moon", "full moon dates", "full moon zodiac sign"], alternates: localizedAlternates(path, path, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title: meta.title, description: meta.description, locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title: meta.title, description: meta.description } }; } const title = "სავსე მთვარე — თარიღები, დრო და მნიშვნელობა"; const description = "შემდეგი სავსე მთვარის თარიღი და თბილისის დრო, ზოდიაქოს ნიშანი, განათება და სავსე მთვარის კალენდარი ქართულად."; return { title: { absolute: title }, description, alternates: localizedAlternates(path, path, "ka"), keywords: ["სავსე მთვარე", "როდის არის სავსე მთვარე", "შემდეგი სავსე მთვარე"] }; }
export default async function Page() { return (await getRequestLocale()) === "en" ? <MoonPhaseHubEn kind="full" /> : <MoonPhaseHub kind="full" />; }
