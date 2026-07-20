import type { Metadata } from "next";
import { MoonPhaseHub } from "@/components/seo/moon-event-pages";
export const revalidate = 86400;
export const metadata: Metadata = { title: { absolute: "ახალი მთვარე — თარიღები, დრო და მნიშვნელობა" }, description: "შემდეგი ახალი მთვარის თარიღი და თბილისის დრო, ზოდიაქოს ნიშანი და ახალი მთვარის კალენდარი და გზამკვლევი ქართულად.", alternates: { canonical: "https://www.vivida.ge/akhali-mtvare" }, keywords: ["ახალი მთვარე", "როდის არის ახალი მთვარე", "შემდეგი ახალი მთვარე"] };
export default function Page() { return <MoonPhaseHub kind="new" />; }
