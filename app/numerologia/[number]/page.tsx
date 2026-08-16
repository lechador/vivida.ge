import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { LifePathNumberPageEn } from "@/components/seo/numerology-en";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { LIFE_PATH_NUMBERS, isLifePathNumber } from "@/lib/numerology";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { LIFE_PATH_CONTENT } from "@/lib/seo/numerology-content";
import { LIFE_PATH_CONTENT_EN } from "@/lib/seo/numerology-content-en";
import { NUMEROLOGY_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { articleLd, breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

type Params = { number: string };

export function generateStaticParams() {
  return LIFE_PATH_NUMBERS.map((number) => ({ number }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { number } = await params;
  if (!isLifePathNumber(number)) return {};
  const locale = await getRequestLocale();
  if (locale === "en") {
    const content = LIFE_PATH_CONTENT_EN[number];
    const path = `/numerologia/${number}`;
    const title = `${content.title}: Meaning, Love, Career and Strengths`;
    const description = `${content.essence} Explore Life Path ${number} strengths, challenges, relationships, career themes, and practical advice.`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: { images: [DEFAULT_OG_IMAGE], type: "article", url: `https://www.vividaastro.com${path}`, title, description, siteName: "Vivida", locale: "en_US" },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const c = LIFE_PATH_CONTENT[number];
  const url = `${SITE_URL}/numerologia/${number}`;
  const title = `${c.titleKa} — მნიშვნელობა ნუმეროლოგიაში`;
  const description = `რას ნიშნავს ბედის რიცხვი ${number} (${c.archetypeKa}) — ხასიათი, ძლიერი მხარეები, სიყვარული, კარიერა და რჩევა. ${c.essenceKa}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      `ბედის რიცხვი ${number}`,
      `რიცხვი ${number} მნიშვნელობა`,
      "ნუმეროლოგია",
      "ბედის რიცხვი",
      "ცხოვრების გზის რიცხვი",
      "numerologia",
      "bedis ricxvi",
    ],
    alternates: localizedAlternates(`/numerologia/${number}`, `/numerologia/${number}`, "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LifePathNumberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { number } = await params;
  if (!isLifePathNumber(number)) notFound();
  if ((await getRequestLocale()) === "en") {
    return <LifePathNumberPageEn number={number} content={LIFE_PATH_CONTENT_EN[number]} />;
  }
  const c = LIFE_PATH_CONTENT[number];
  const master = number.length > 1;
  const url = `${SITE_URL}/numerologia/${number}`;

  const ld = [
    articleLd({
      url,
      headline: c.titleKa,
      description: c.essenceKa,
      datePublished: "2026-07-13T00:00:00.000Z",
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ნუმეროლოგია", url: `${SITE_URL}/numerologia` },
      { name: c.titleKa, url },
    ]),
  ];

  const sections = [
    { title: "ძლიერი მხარეები", body: c.strengthsKa, accent: "var(--vivida-cyan)" },
    { title: "გამოწვევები", body: c.challengesKa, accent: "var(--vivida-pink)" },
    { title: "სიყვარული და ურთიერთობები", body: c.loveKa, accent: "var(--vivida-violet)" },
    { title: "კარიერა და ფული", body: c.careerKa, accent: "var(--vivida-gold, #eac358)" },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <Link href="/numerologia" className="hover:text-foreground">
            ნუმეროლოგია
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{number}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span
              className={`grid size-16 shrink-0 place-items-center rounded-2xl text-3xl font-bold ${
                master
                  ? "bg-[var(--vivida-gold,#eac358)]/15 text-[var(--vivida-gold,#eac358)] ring-1 ring-[var(--vivida-gold,#eac358)]/40"
                  : "bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] ring-1 ring-[var(--vivida-violet)]/40"
              }`}
            >
              {number}
            </span>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {c.titleKa}
              </h1>
              {master && (
                <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--vivida-gold,#eac358)]">
                  მასტერ-რიცხვი
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
            {c.essenceKa}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {c.traitsKa.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border bg-card/55 px-3 py-1 text-sm text-foreground/85"
              >
                {t}
              </li>
            ))}
          </ul>
        </header>

        <div className="space-y-4">
          {sections.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6"
            >
              <h2
                className="text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: s.accent }}
              >
                {s.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                {s.body}
              </p>
            </section>
          ))}

          <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
              რჩევა {number}-ისთვის
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {c.adviceKa}
            </p>
          </section>
        </div>

        {/* Other numbers */}
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა რიცხვები
          </h2>
          <div className="flex flex-wrap gap-2">
            {LIFE_PATH_NUMBERS.filter((n) => n !== number).map((n) => (
              <Link
                key={n}
                href={`/numerologia/${n}`}
                className="grid size-11 place-items-center rounded-xl border border-border bg-card/55 text-sm font-semibold text-foreground/85 transition-colors hover:bg-card/80 hover:text-foreground"
              >
                {n}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            რიცხვი ერთი შტრიხია — ნახე მთელი სურათი
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            შენი დაბადების თარიღი და დრო მთლიან კოსმიურ რუკას ხატავს. შექმენი
            უფასოდ და შეადარე შენს ბედის რიცხვს.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href="/nataluri-ruka">
              ჩემი ნატალური რუკა
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <PopularSearches queries={NUMEROLOGY_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
