import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThematicHoroscopeDetail, thematicDetailMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeDetailEn, thematicDetailMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { getRequestLocale } from "@/lib/i18n/request-locale";
type Props = { params: Promise<{ sign: string }> };
function valid(sign: string): sign is ZodiacSlug { return (ALL_SLUGS as string[]).includes(sign); }
export function generateStaticParams() { return ALL_SLUGS.map((sign) => ({ sign })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { sign } = await params; if (!valid(sign)) return {}; return (await getRequestLocale()) === "en" ? thematicDetailMetadataEn("love", sign) : thematicDetailMetadata("love", sign); }
export default async function LoveSignPage({ params }: Props) { const { sign } = await params; if (!valid(sign)) notFound(); return (await getRequestLocale()) === "en" ? <ThematicHoroscopeDetailEn theme="love" sign={sign} /> : <ThematicHoroscopeDetail theme="love" sign={sign} />; }
