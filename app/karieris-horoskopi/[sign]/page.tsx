import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThematicHoroscopeDetail, thematicDetailMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
type Props = { params: Promise<{ sign: string }> };
function valid(sign: string): sign is ZodiacSlug { return (ALL_SLUGS as string[]).includes(sign); }
export function generateStaticParams() { return ALL_SLUGS.map((sign) => ({ sign })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { sign } = await params; return valid(sign) ? thematicDetailMetadata("career", sign) : {}; }
export default async function CareerSignPage({ params }: Props) { const { sign } = await params; if (!valid(sign)) notFound(); return <ThematicHoroscopeDetail theme="career" sign={sign} />; }
