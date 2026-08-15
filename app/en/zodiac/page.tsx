import type { Metadata } from "next";

import { ZodiacHubEn } from "@/components/seo/zodiac-hub-en";
import { ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const PATH = "/en/zodiac";
const TITLE = "The 12 Zodiac Signs: Elements, Modalities and Rulers";
const DESCRIPTION = "A clear English introduction to all twelve zodiac signs, their date ranges, elements, modalities and traditional planetary rulers.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` }, description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/zodiac", "en"),
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${ENGLISH_SITE_URL}/zodiac`, locale: "en_US", alternateLocale: ["ka_GE"] },
};

/**
 * The English zodiac hub. The host rewrite sends vividaastro.com/zodiac here,
 * so this file — not the English branch inside app/zodiac/page.tsx — is what
 * the international domain actually serves. Both now render the same
 * component, so there is one English zodiac hub rather than a thin served one
 * and a rich unreachable one.
 */
export default function EnglishZodiacPage() {
  return <ZodiacHubEn />;
}
