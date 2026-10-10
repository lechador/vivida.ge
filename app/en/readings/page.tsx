import type { Metadata } from "next";
import { Suspense } from "react";

import { EnglishShell } from "@/components/en/english-shell";
import { ReadingsApp } from "@/components/bazaar/readings-app";
import { DEFAULT_OG_IMAGE, ENGLISH_SITE_URL } from "@/lib/seo/locales";

const URL = `${ENGLISH_SITE_URL}/readings`;
const TITLE = "Insight Bazaar — Book a Personal Astrology Reading";
const DESCRIPTION =
  "Commission a one-off tarot reading, birth-chart interpretation, or compatibility session from a vetted Vivida reader. Pay in USDC on Solana; birth details stay private and off-chain.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
    languages: { en: URL, "x-default": URL },
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: "en_US",
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function ReadingsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    inLanguage: "en",
  };
  return (
    <EnglishShell georgianPath="/">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Suspense>
        <ReadingsApp />
      </Suspense>
    </EnglishShell>
  );
}
