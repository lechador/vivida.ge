import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { SiteFooter } from "@/components/site-footer";
import { Starfield } from "@/components/landing/starfield";
import { BigFiveTestClient } from "@/components/big-five/big-five-test-client";

import { BIG5_QUESTION_COUNT, BIG5_TRAITS } from "@/lib/big-five/questions";
import {
  BIG5_META_DESCRIPTION,
  BIG5_META_DESCRIPTION_EN,
  BIG5_META_DESCRIPTION_PL,
  BIG5_INTRO,
  BIG5_INTRO_EN,
  BIG5_INTRO_PL,
  BIG5_FAQ,
  BIG5_FAQ_EN,
  BIG5_FAQ_PL,
} from "@/lib/big-five/content";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  POLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const TITLE_KA = "Big Five ტესტი, დიდი ხუთეული, პიროვნების ტესტი ქართულად";
const TITLE_EN = "Free Big Five Personality Test, OCEAN Profile";
const TITLE_PL = "Darmowy Test Osobowości Big Five (Wielka Piątka) | Vivida";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const en = locale === "en";
  const title = pl ? TITLE_PL : en ? TITLE_EN : TITLE_KA;
  const description = pl
    ? BIG5_META_DESCRIPTION_PL
    : en
      ? BIG5_META_DESCRIPTION_EN
      : BIG5_META_DESCRIPTION;
  const siteUrl = pl
    ? POLISH_SITE_URL
    : en
      ? ENGLISH_SITE_URL
      : GEORGIAN_SITE_URL;

  return {
    title: { absolute: title },
    description,
    keywords: pl
      ? [
          "test osobowości big five",
          "wielka piątka test",
          "test ocean",
          "darmowy test osobowości",
          "cechy osobowości test",
        ]
      : en
        ? [
            "free Big Five test",
            "Big Five personality test",
            "OCEAN personality test",
            "personality traits test",
          ]
        : ["big five ტესტი", "დიდი ხუთეული", "პიროვნების ტესტი", "ocean ტესტი"],
    alternates: localizedAlternates("/big-five", "/big-five", locale),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${siteUrl}/big-five`,
      title,
      description,
      siteName: "Vivida",
      locale: pl ? "pl_PL" : en ? "en_US" : "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Free Big Five (OCEAN) personality test. Anyone can take it; the profile is
 * computed client-side (see /big-five/shedegi), the per-trait analysis is gated
 * behind login / a one-time credit unlock.
 */
export default async function BigFiveTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const en = locale === "en";
  const siteUrl = pl
    ? POLISH_SITE_URL
    : en
      ? ENGLISH_SITE_URL
      : GEORGIAN_SITE_URL;
  const description = pl
    ? BIG5_META_DESCRIPTION_PL
    : en
      ? BIG5_META_DESCRIPTION_EN
      : BIG5_META_DESCRIPTION;
  const faq = pl ? BIG5_FAQ_PL : en ? BIG5_FAQ_EN : BIG5_FAQ;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: pl
        ? "Test osobowości Wielkiej Piątki Vivida (Big Five)"
        : en
          ? "Vivida Big Five Personality Test"
          : "Vivida Big Five ტესტი",
      description,
      inLanguage: pl ? "pl" : en ? "en" : "ka-GE",
      url: `${siteUrl}/big-five`,
      educationalLevel: "beginner",
      numberOfQuestions: BIG5_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: pl
          ? "Cechy osobowości Wielkiej Piątki"
          : en
            ? "Big Five personality traits"
            : "დიდი ხუთეული (Big Five)",
        alternateName: "OCEAN",
      },
    },
    faqLd(faq),
    breadcrumbLd([
      { name: pl ? "Strona główna" : en ? "Home" : "მთავარი", url: siteUrl },
      {
        name: pl ? "Testy" : en ? "Tests" : "ტესტები",
        url: `${siteUrl}/tests`,
      },
      {
        name: pl ? "Test Big Five" : en ? "Big Five Test" : "Big Five ტესტი",
        url: `${siteUrl}/big-five`,
      },
    ]),
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_265/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.15_200/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader active="tests" locale={locale} georgianPath="/big-five" />
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida · Big Five
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {pl ? (
              <>
                Twój profil{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                  Wielkiej Piątki
                </span>
              </>
            ) : en ? (
              <>
                Your{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                  Big Five profile
                </span>
              </>
            ) : (
              <>
                დიდი{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                  ხუთეული
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {pl
              ? `${BIG5_QUESTION_COUNT} pytań · ok. 7 minut · darmowy`
              : en
                ? `${BIG5_QUESTION_COUNT} questions · about 7 minutes · free`
                : `${BIG5_QUESTION_COUNT} კითხვა · ~7 წუთი · უფასო`}
          </p>
        </header>

        <BigFiveTestClient locale={locale} />
      </section>

      {/* SEO / informational content, below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {pl
              ? "Czym jest Wielka Piątka?"
              : en
                ? "What is the Big Five?"
                : "რა არის დიდი ხუთეული?"}
          </h2>
          {(pl ? BIG5_INTRO_PL : en ? BIG5_INTRO_EN : BIG5_INTRO).map(
            (p, i) => (
              <p
                key={i}
                className="mt-3 text-[15px] leading-relaxed text-foreground/85"
              >
                {p}
              </p>
            ),
          )}

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            {pl
              ? "Pięć cech, które mierzy ten test"
              : en
                ? "The five traits"
                : "ხუთი თვისება, რომელსაც ტესტი ზომავს"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BIG5_TRAITS.map((t) => (
              <div
                key={t.key}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{t.glyph}</span>
                  {pl ? t.namePl : en ? t.nameEn : t.nameKa}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {pl ? t.taglinePl : en ? t.taglineEn : t.taglineKa}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {pl
              ? "Często zadawane pytania"
              : en
                ? "Frequently asked questions"
                : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
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
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
