import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AstrologyCalendarDetail } from "@/components/seo/astrology-calendar-pages";
import { calendarDateLabel, calendarWindow, parseCalendarDate } from "@/lib/seo/astrology-calendar";
type Props = { params: Promise<{ date: string }> };
export const revalidate = 86400;
export function generateStaticParams() { return calendarWindow().map((day) => ({ date: day.iso })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { date: value } = await params; const date = parseCalendarDate(value); if (!date) return {}; const label = calendarDateLabel(date); const title = `${label} — დღის ასტროლოგიური პროგნოზი`; const description = `${label}: დღის პლანეტარული ასპექტები, იღბლის ინდექსი, ხელსაყრელი და ფრთხილი თემები და პრაქტიკული ასტროლოგიური რჩევები.`; const url = `https://www.vivida.ge/astrologiuri-kalendari/${value}`; return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { type: "article", url, title, description, locale: "ka_GE", siteName: "Vivida" } }; }
export default async function Page({ params }: Props) { const { date: value } = await params; const date = parseCalendarDate(value); if (!date) notFound(); return <AstrologyCalendarDetail date={date} />; }
