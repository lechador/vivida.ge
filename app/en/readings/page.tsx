import type { Metadata } from "next";
import { Suspense } from "react";

import { auth } from "@/auth";
import { EnglishShell } from "@/components/en/english-shell";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SiteFooter } from "@/components/site-footer";
import { ReadingsApp } from "@/components/bazaar/readings-app";
import { DEFAULT_OG_IMAGE, ENGLISH_SITE_URL } from "@/lib/seo/locales";

export const dynamic = "force-dynamic";

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

/**
 * Public marketplace, auth-aware shell — the /taro pattern on the English
 * host. Guests get the English marketing shell (header/footer, the landing);
 * signed-in users get the app space: left sidebar, top bar, mobile tab bar,
 * starfield. Crawlers are always guests, so SEO sees the same landing markup
 * either way, and every sub-view still rides query params (?service=,
 * ?provider=, ?view=) on this one public path.
 */
export default async function ReadingsPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    inLanguage: "en",
  };
  const ldScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );

  if (!authed) {
    return (
      <EnglishShell georgianPath="/">
        {ldScript}
        <Suspense>
          <ReadingsApp />
        </Suspense>
      </EnglishShell>
    );
  }

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />

      <AppHeader authed active="readings" />

      {ldScript}

      <div className="relative z-10 flex-1">
        <Suspense>
          <ReadingsApp />
        </Suspense>
      </div>

      <SiteFooter locale="en" />
    </main>
  );
}
