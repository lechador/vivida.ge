import type { Metadata } from "next";

import { ENGLISH_SITE_URL } from "@/lib/seo/locales";

export const metadata: Metadata = {
  metadataBase: new URL(ENGLISH_SITE_URL),
  title: {
    default: "Vivida in English — Natal Charts and Astrology",
    template: "%s · Vivida",
  },
  description:
    "Explore natal charts, zodiac signs, horoscopes, compatibility and self-discovery tools with Vivida's English guides.",
  openGraph: {
    siteName: "Vivida",
    locale: "en_US",
    alternateLocale: ["ka_GE"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The shared root layout defaults to Georgian. This route-level marker
          updates the document language as soon as the English subtree parses;
          the host also sends Content-Language: en before any HTML arrives. */}
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.lang="en"',
        }}
      />
      {children}
    </>
  );
}
