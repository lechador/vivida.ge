import type { Metadata } from "next";
import { MoonPhaseHub } from "@/components/seo/moon-event-pages";
export const revalidate = 86400;
export const metadata: Metadata = { title: { absolute: "სავსე მთვარე — თარიღები, დრო და მნიშვნელობა" }, description: "შემდეგი სავსე მთვარის თარიღი და თბილისის დრო, ზოდიაქოს ნიშანი, განათება და სავსე მთვარის კალენდარი ქართულად.", alternates: { canonical: "https://www.vivida.ge/savse-mtvare" }, keywords: ["სავსე მთვარე", "როდის არის სავსე მთვარე", "შემდეგი სავსე მთვარე"] };
export default function Page() { return <MoonPhaseHub kind="full" />; }
