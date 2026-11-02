import type { Metadata } from "next";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  return {
    metadataBase: new URL(ENGLISH_SITE_URL),
    title: {
      default: pl
        ? "Vivida po polsku – Horoskopy Urodzeniowe, Tarot i Astrologia"
        : "Vivida in English, Natal Charts and Astrology",
      template: "%s · Vivida",
    },
    description: pl
      ? "Odkryj swój horoskop urodzeniowy, znaki zodiaku, tarot online, synastrię partnerską i narzędzia samopoznania z Vivida."
      : "Explore natal charts, zodiac signs, horoscopes, compatibility and self-discovery tools with Vivida's English guides.",
    openGraph: {
      siteName: "Vivida",
      locale: pl ? "pl_PL" : "en_US",
      alternateLocale: pl ? ["en_US", "ka_GE"] : ["ka_GE", "pl_PL"],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const docLang = locale === "pl" ? "pl" : "en";
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(docLang)}`,
        }}
      />
      {children}
    </>
  );
}
