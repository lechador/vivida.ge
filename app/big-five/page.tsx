import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { BigFiveTestClient } from "@/components/big-five/big-five-test-client";
import { PopularSearches } from "@/components/seo/popular-searches";
import { BIG5_QUESTION_COUNT, BIG5_TRAITS } from "@/lib/big-five/questions";
import { BIG5_META_DESCRIPTION, BIG5_INTRO, BIG5_FAQ } from "@/lib/big-five/content";
import { BIGFIVE_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "Big Five ტესტი — დიდი ხუთეული, პიროვნების ტესტი ქართულად";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: BIG5_META_DESCRIPTION,
  keywords: [
    "big five ტესტი",
    "დიდი ხუთეული",
    "big five ქართულად",
    "პიროვნების ტესტი",
    "პიროვნების ტესტი ქართულად",
    "ocean ტესტი",
    "big five personality test",
    "ხასიათის ტესტი",
  ],
  alternates: { canonical: `${SITE_URL}/big-five` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/big-five`,
    title: TITLE,
    description: BIG5_META_DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: BIG5_META_DESCRIPTION,
  },
};

/**
 * Free Big Five (OCEAN) personality test. Anyone can take it; the profile is
 * computed client-side (see /big-five/shedegi), the per-trait analysis is gated
 * behind login / a one-time credit unlock.
 */
export default async function BigFiveTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Vivida Big Five ტესტი",
      description: BIG5_META_DESCRIPTION,
      inLanguage: "ka-GE",
      url: `${SITE_URL}/big-five`,
      educationalLevel: "beginner",
      numberOfQuestions: BIG5_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: "დიდი ხუთეული (Big Five)",
        alternateName: ["Big Five", "OCEAN", "დიდი ხუთეული", "პიროვნების ტესტი"],
      },
    },
    faqLd(BIG5_FAQ),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "Big Five ტესტი", url: `${SITE_URL}/big-five` },
    ]),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_265/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.15_200/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida · Big Five
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            დიდი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ხუთეული
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {BIG5_QUESTION_COUNT} კითხვა · ~7 წუთი · უფასო
          </p>
        </header>

        <BigFiveTestClient />
      </section>

      {/* SEO / informational content — below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რა არის დიდი ხუთეული?
          </h2>
          {BIG5_INTRO.map((p, i) => (
            <p
              key={i}
              className="mt-3 text-[15px] leading-relaxed text-foreground/85"
            >
              {p}
            </p>
          ))}

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            ხუთი თვისება, რომელსაც ტესტი ზომავს
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BIG5_TRAITS.map((t) => (
              <div
                key={t.key}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{t.glyph}</span>
                  {t.nameKa}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t.taglineKa}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="mt-4 space-y-3">
            {BIG5_FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <PopularSearches queries={BIGFIVE_LATIN_QUERIES} />
        </div>
      </section>
    </main>
  );
}
