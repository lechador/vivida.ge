import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThematicHoroscopeDetail, thematicDetailMetadata } from "@/components/seo/thematic-horoscope-pages";
import { ThematicHoroscopeDetailEn, thematicDetailMetadataEn } from "@/components/seo/thematic-horoscope-pages-en";
import { ThematicHoroscopeDetailAm, thematicDetailMetadataAm } from "@/components/seo/thematic-horoscope-pages-am";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type Props = { params: Promise<{ sign: string }> };

function valid(sign: string): sign is ZodiacSlug {
  return (ALL_SLUGS as string[]).includes(sign);
}

export function generateStaticParams() {
  return ALL_SLUGS.map((sign) => ({ sign }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sign } = await params;
  if (!valid(sign)) return {};
  const locale = await getRequestLocale();
  if (locale === "am") return thematicDetailMetadataAm("career", sign);
  if (locale === "en") return thematicDetailMetadataEn("career", sign);
  return thematicDetailMetadata("career", sign);
}

export default async function CareerSignPage({ params }: Props) {
  const { sign } = await params;
  if (!valid(sign)) notFound();
  const locale = await getRequestLocale();
  if (locale === "am") return <ThematicHoroscopeDetailAm theme="career" sign={sign} />;
  if (locale === "en") return <ThematicHoroscopeDetailEn theme="career" sign={sign} />;
  return <ThematicHoroscopeDetail theme="career" sign={sign} />;
}
