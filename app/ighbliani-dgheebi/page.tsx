import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
const title = "იღბლიანი დღეები — უახლოესი ხელსაყრელი თარიღები";
const description = "ნახე მომდევნო 90 დღის იღბლიანი და ხელსაყრელი თარიღები პლანეტარული ასპექტების მიხედვით — საქმეებისთვის, სიყვარულისა და ახალი დასაწყისისთვის.";
export const revalidate = 86400;
export const metadata: Metadata = { title: { absolute: title }, description, keywords: ["იღბლიანი დღეები", "იღბლიანი დღე", "ხელსაყრელი დღეები", "კარგი დღე დასაწყისისთვის"], alternates: { canonical: "https://www.vivida.ge/ighbliani-dgheebi" }, openGraph: { type: "website", url: "https://www.vivida.ge/ighbliani-dgheebi", title, description, locale: "ka_GE", siteName: "Vivida" } };
export default function Page() { return <AstrologyCalendarHub filter="lucky" />; }
