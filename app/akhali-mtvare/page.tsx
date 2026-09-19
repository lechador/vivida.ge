import type { Metadata } from "next";
import { MoonPhaseHub } from "@/components/seo/moon-event-pages";
import {
  MOON_PHASE_META_EN,
  MoonPhaseHubEn,
} from "@/components/seo/moon-event-pages-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const path = "/akhali-mtvare";
  const locale = await getRequestLocale();
  if (locale === "en") {
    const meta = MOON_PHASE_META_EN.new;
    return {
      title: { absolute: meta.title },
      description: meta.description,
      keywords: [
        "new moon calendar",
        "next new moon",
        "new moon dates",
        "new moon zodiac sign",
      ],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: englishSiteHref(path, false),
        title: meta.title,
        description: meta.description,
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
      },
    };
  }
  const title = "ახალი მთვარე — თარიღები, დრო და მნიშვნელობა";
  const description =
    "შემდეგი ახალი მთვარის თარიღი და თბილისის დრო, ზოდიაქოს ნიშანი და ახალი მთვარის კალენდარი და გზამკვლევი ქართულად.";
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(path, path, "ka"),
    keywords: [
      "ახალი მთვარე",
      "როდის არის ახალი მთვარე",
      "შემდეგი ახალი მთვარე",
    ],
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  if (locale === "en") return <MoonPhaseHubEn kind="new" />;
  return <MoonPhaseHub kind="new" />;
}
