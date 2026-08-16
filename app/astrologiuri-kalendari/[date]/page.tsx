import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AstrologyCalendarDetail } from "@/components/seo/astrology-calendar-pages";
import { AstrologyCalendarDetailEn } from "@/components/seo/astrology-calendar-pages-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { calendarDateLabel, calendarWindow, parseCalendarDate } from "@/lib/seo/astrology-calendar";
import { calendarDateLabelEn } from "@/lib/seo/astrology-calendar-en";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
type Props = { params: Promise<{ date: string }> };
export const revalidate = 86400;
export function generateStaticParams() { return calendarWindow().map((day) => ({ date: day.iso })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { date: value } = await params; const date = parseCalendarDate(value); if (!date) return {}; const locale = await getRequestLocale(); const path = `/astrologiuri-kalendari/${value}`; if (locale === "en") { const label = calendarDateLabelEn(date); const title = `${label} Astrology Forecast: Planetary Aspects`; const description = `${label} astrology forecast with planetary aspects, a daily energy index, supportive themes, cautions, and practical guidance.`; return { title: { absolute: title }, description, alternates: localizedAlternates(path, path, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "article", url: `https://www.vividaastro.com${path}`, title, description, locale: "en_US", siteName: "Vivida" }, twitter: { card: "summary_large_image", title, description } }; } const label = calendarDateLabel(date); const title = `${label} — დღის ასტროლოგიური პროგნოზი`; const description = `${label}: დღის პლანეტარული ასპექტები, იღბლის ინდექსი, ხელსაყრელი და ფრთხილი თემები და პრაქტიკული ასტროლოგიური რჩევები.`; const url = `https://www.vivida.ge${path}`; return { title: { absolute: title }, description, alternates: localizedAlternates(path, path, "ka"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "article", url, title, description, locale: "ka_GE", siteName: "Vivida" } }; }
export default async function Page({ params }: Props) { const { date: value } = await params; const date = parseCalendarDate(value); if (!date) notFound(); return (await getRequestLocale()) === "en" ? <AstrologyCalendarDetailEn date={date} /> : <AstrologyCalendarDetail date={date} />; }
