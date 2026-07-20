import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
const title = "ასტროლოგიური კალენდარი — იღბლიანი და ფრთხილი დღეები";
const description = "ასტროლოგიური კალენდარი ქართულად: დღის პლანეტარული ასპექტები, იღბლიანი და ფრთხილი დღეები, 30-დღიანი პროგნოზი და პრაქტიკული რჩევები.";
export const revalidate = 86400;
export const metadata: Metadata = { title: { absolute: title }, description, keywords: ["ასტროლოგიური კალენდარი", "იღბლიანი დღეები", "ფრთხილი დღეები", "დღის ასტროლოგიური პროგნოზი"], alternates: { canonical: "https://www.vivida.ge/astrologiuri-kalendari" }, openGraph: { type: "website", url: "https://www.vivida.ge/astrologiuri-kalendari", title, description, locale: "ka_GE", siteName: "Vivida" } };
export default function Page() { return <AstrologyCalendarHub />; }
