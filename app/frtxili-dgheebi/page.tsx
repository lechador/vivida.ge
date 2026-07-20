import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
const title = "ფრთხილი დღეები — როდის გვჭირდება მეტი ყურადღება";
const description = "მომდევნო 90 დღის ფრთხილი თარიღები დაძაბული პლანეტარული ასპექტების მიხედვით — დაგეგმვის, გადამოწმებისა და მშვიდი რეაგირებისთვის.";
export const revalidate = 86400;
export const metadata: Metadata = { title: { absolute: title }, description, keywords: ["ფრთხილი დღეები", "არახელსაყრელი დღეები", "რთული დღეები", "ასტროლოგიური პროგნოზი"], alternates: { canonical: "https://www.vivida.ge/frtxili-dgheebi" }, openGraph: { type: "website", url: "https://www.vivida.ge/frtxili-dgheebi", title, description, locale: "ka_GE", siteName: "Vivida" } };
export default function Page() { return <AstrologyCalendarHub filter="careful" />; }
