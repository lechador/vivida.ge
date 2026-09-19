import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  PAIRS_CONTENT,
  SIGNS_CONTENT,
  paragraphs,
  type CompatibilityScore,
} from "@/lib/seo/zodiac-content";
import {
  ALL_PAIR_SLUGS,
  parsePairSlug,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { pairPageLatinQueries } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  englishSiteHref,
  localizedAlternates,
} from "@/lib/seo/locales";
import { zodiacPairEnglish } from "@/lib/zodiac-pair-en";

import { ZodiacPairPageEn } from "@/components/seo/zodiac-pair-page-en";

const SITE_URL = "https://www.vivida.ge";

const SCORE_COLOR: Record<CompatibilityScore, string> = {
  ძლიერი: "oklch(0.78 0.18 305)",
  ჰარმონიული: "oklch(0.78 0.16 200)",
  გამომწვევი: "oklch(0.7 0.22 30)",
};

type Params = { pair: string };

export async function generateStaticParams() {
  return ALL_PAIR_SLUGS.map((pair) => ({ pair }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) return {};
  const locale = await getRequestLocale();
  const path = `/zodiac/tavsebadoba/${pair}`;

  if (locale === "en") {
    const english = zodiacPairEnglish(...parsed);
    const url = englishSiteHref(path, false);
    return {
      title: { absolute: english.title },
      description: english.description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url,
        title: english.title,
        description: english.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: english.title,
        description: english.description,
      },
    };
  }

  if (!PAIRS_CONTENT) return {};
  const c = PAIRS_CONTENT[pair];
  if (!c) return {};

  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    alternates: localizedAlternates(path, path, "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article",
      url: `${SITE_URL}/zodiac/tavsebadoba/${pair}`,
      title: c.pageTitle,
      description: c.metaDescription,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title: c.pageTitle,
      description: c.metaDescription,
    },
  };
}

export default async function PairPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();

  const [a, b] = parsed;
  const locale = await getRequestLocale();
  if (locale === "en") return <ZodiacPairPageEn a={a} b={b} />;
  if (!PAIRS_CONTENT) notFound();
  const c = PAIRS_CONTENT[pair];
  if (!c) notFound();
  const aSign = SIGNS_CONTENT[a];
  const bSign = SIGNS_CONTENT[b];
  const aMeta = signMetaBySlug(a);
  const bMeta = signMetaBySlug(b);
  const aColor = aMeta ? signColor(aMeta) : "var(--vivida-violet)";
  const bColor = bMeta ? signColor(bMeta) : "var(--vivida-violet)";
  const scoreColor = SCORE_COLOR[c.overallScore];
  const latinQueries = pairPageLatinQueries(a, b);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.pageTitle,
    description: c.metaDescription,
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/zodiac/tavsebadoba/${pair}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    about: [
      { "@type": "Thing", name: c.labelA },
      { "@type": "Thing", name: c.labelB },
    ],
    alternateName: latinQueries,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (c.faq ?? []).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ცის ნიშნები",
        item: `${SITE_URL}/zodiac`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "თავსებადობა",
        item: `${SITE_URL}/zodiac/tavsebadoba`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${c.labelA} × ${c.labelB}`,
        item: `${SITE_URL}/zodiac/tavsebadoba/${pair}`,
      },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <Link href="/zodiac/tavsebadoba" className="hover:text-foreground">
            თავსებადობა
          </Link>
          <span>/</span>
          <span className="text-foreground/80">
            {c.labelA} × {c.labelB}
          </span>
        </nav>

        {/* Hero */}
        <article
          className="relative overflow-hidden rounded-3xl border p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10"
          style={{
            borderColor: `color-mix(in oklch, ${scoreColor} 35%, transparent)`,
            background: `linear-gradient(135deg, color-mix(in oklch, ${aColor} 14%, transparent), color-mix(in oklch, ${bColor} 14%, transparent))`,
          }}
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `conic-gradient(from 0deg, ${aColor}, ${bColor}, ${aColor})`,
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href={`/zodiac/${a}`}
                className="grid size-16 shrink-0 place-items-center rounded-2xl text-3xl transition-transform hover:scale-105 sm:size-20 sm:text-4xl"
                style={{
                  background: `color-mix(in oklch, ${aColor} 18%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${aColor} 35%, transparent)`,
                  color: aColor,
                }}
                title={aSign.labelKa}
              >
                {aSign.symbol}
              </Link>
              <span className="text-2xl text-muted-foreground/60">×</span>
              <Link
                href={`/zodiac/${b}`}
                className="grid size-16 shrink-0 place-items-center rounded-2xl text-3xl transition-transform hover:scale-105 sm:size-20 sm:text-4xl"
                style={{
                  background: `color-mix(in oklch, ${bColor} 18%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${bColor} 35%, transparent)`,
                  color: bColor,
                }}
                title={bSign.labelKa}
              >
                {bSign.symbol}
              </Link>
            </div>
            <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              თავსებადობა
            </div>
            <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {c.labelA} <span className="text-muted-foreground/70">×</span>{" "}
              {c.labelB}
            </h1>
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              style={{
                borderColor: `color-mix(in oklch, ${scoreColor} 40%, transparent)`,
                background: `color-mix(in oklch, ${scoreColor} 12%, transparent)`,
                color: scoreColor,
              }}
            >
              <span className="font-semibold">{c.overallScore}</span>
              <span className="text-foreground/70">თავსებადობა</span>
            </div>
            <p className="mt-4 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
              {c.tagline}
            </p>
          </div>
        </article>

        {/* Overall */}
        <Section title="ზოგადი თავსებადობა">
          {paragraphs(c.overall ?? "").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Love */}
        <Section title="სიყვარული">
          {paragraphs(c.love ?? "").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Friendship + communication side-by-side */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              მეგობრობა
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
              {paragraphs(c.friendship ?? "").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              კომუნიკაცია
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
              {paragraphs(c.communication ?? "").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        </section>

        {/* Strengths × challenges */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              რა გამოგდით კარგად
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {(c.strengths ?? []).map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: scoreColor }}>✦</span>
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              რას უნდა მიხედოთ
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {(c.challenges ?? []).map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground/85">{w}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* Verdict */}
        <Section title="დასკვნა">
          {paragraphs(c.verdict ?? "").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {(c.faq ?? []).map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    ✦
                  </span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Sign cross-links */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სრული აღწერა ცალ-ცალკე
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/zodiac/${a}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80"
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-xl"
                style={{
                  background: `color-mix(in oklch, ${aColor} 18%, transparent)`,
                  color: aColor,
                }}
              >
                {aSign.symbol}
              </span>
              <div>
                <div className="text-base font-medium">{aSign.labelKa}</div>
                <div className="text-xs text-muted-foreground">
                  სრული აღწერა →
                </div>
              </div>
            </Link>
            <Link
              href={`/zodiac/${b}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80"
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-xl"
                style={{
                  background: `color-mix(in oklch, ${bColor} 18%, transparent)`,
                  color: bColor,
                }}
              >
                {bSign.symbol}
              </span>
              <div>
                <div className="text-base font-medium">{bSign.labelKa}</div>
                <div className="text-xs text-muted-foreground">
                  სრული აღწერა →
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            მზის ნიშანი მხოლოდ პირველი ფენაა
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი ნამდვილი თავსებადობა მთვარეებსა და ვენერებზე ფიქსირდება. ნახე
            სინასტრიული ანალიზი ცოცხალ პროფილზე.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">დაიწყე უფასოდ</Link>
          </Button>
        </div>

        <PopularSearches queries={latinQueries} />
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
