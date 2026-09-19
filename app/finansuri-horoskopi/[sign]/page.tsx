import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ThematicHoroscopeDetail,
  thematicDetailMetadata,
} from "@/components/seo/thematic-horoscope-pages";
import {
  ThematicHoroscopeDetailEn,
  thematicDetailMetadataEn,
} from "@/components/seo/thematic-horoscope-pages-en";

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
  if (locale === "en") return thematicDetailMetadataEn("finance", sign);
  return thematicDetailMetadata("finance", sign);
}

export default async function FinanceSignPage({ params }: Props) {
  const { sign } = await params;
  if (!valid(sign)) notFound();
  const locale = await getRequestLocale();
  if (locale === "en")
    return <ThematicHoroscopeDetailEn theme="finance" sign={sign} />;
  return <ThematicHoroscopeDetail theme="finance" sign={sign} />;
}
