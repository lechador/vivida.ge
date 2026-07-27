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
  COMPATIBILITY_HUB_CONTENT,
  PAIRS_CONTENT,
  SIGNS_CONTENT,
  paragraphs,
  type CompatibilityScore,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { COMPAT_HUB_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import { localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac/tavsebadoba";

const SCORE_COLOR: Record<CompatibilityScore, string> = {
  ძლიერი: "oklch(0.78 0.18 305)",
  ჰარმონიული: "oklch(0.78 0.16 200)",
  გამომწვევი: "oklch(0.7 0.22 30)",
};

export const metadata: Metadata = COMPATIBILITY_HUB_CONTENT
  ? {
      title: { absolute: COMPATIBILITY_HUB_CONTENT.pageTitle },
      description: COMPATIBILITY_HUB_CONTENT.metaDescription,
      alternates: localizedAlternates(PATH, "/en/compatibility", "ka"),
      openGraph: {
        type: "website",
        url: `${SITE_URL}${PATH}`,
        title: COMPATIBILITY_HUB_CONTENT.pageTitle,
        description: COMPATIBILITY_HUB_CONTENT.metaDescription,
        siteName: "Vivida",
        locale: "ka_GE",
      },
      twitter: {
        card: "summary_large_image",
        title: COMPATIBILITY_HUB_CONTENT.pageTitle,
        description: COMPATIBILITY_HUB_CONTENT.metaDescription,
      },
    }
  : {};

export default function CompatibilityHubPage() {
  if (!COMPATIBILITY_HUB_CONTENT || !PAIRS_CONTENT) notFound();
  const c = COMPATIBILITY_HUB_CONTENT;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ცის ნიშნები", item: `${SITE_URL}/zodiac` },
      { "@type": "ListItem", position: 2, name: "თავსებადობა", item: `${SITE_URL}${PATH}` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <SmartHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">ცის ნიშნები</Link>
          <span>/</span>
          <span className="text-foreground/80">თავსებადობა</span>
        </nav>

        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ცის თავსებადობა
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {c.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {c.tagline}
        </p>

        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Pair table — 12×12 grid where each cell links to canonical pair */}
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            ყველა წყვილი
          </h2>
          <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
            აირჩიე ორი ნიშანი ცხრილიდან, რომ ნახო მათი დეტალური თავსებადობა.
            ერთი და იგივე წყვილი მუშაობს ორივე მიმართულებით.
          </p>
          <PairTable />
        </section>

        {/* How it works */}
        <article className="mt-12 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {c.howItWorks.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(c.howItWorks.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>

        <article className="mt-10 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {c.elementsRule.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(c.elementsRule.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>

        <article className="mt-10 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {c.beyondSun.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(c.beyondSun.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">
              <Sparkles className="size-4" />
              შენი სინასტრიის ანალიზი
            </Link>
          </Button>
        </article>

        {/* FAQ */}
        <section className="mt-14 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span aria-hidden className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45">✦</span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <PopularSearches queries={COMPAT_HUB_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}

function PairTable() {
  if (!PAIRS_CONTENT) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card/40 ring-1 ring-foreground/5">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-card/60">
            <th className="sticky left-0 z-10 bg-card/80 px-2 py-2 text-left font-medium text-muted-foreground sm:px-3 sm:py-3"></th>
            {ALL_SLUGS.map((slug) => {
              const sc = SIGNS_CONTENT[slug];
              const meta = signMetaBySlug(slug);
              const sa = meta ? signColor(meta) : "var(--vivida-violet)";
              return (
                <th
                  key={slug}
                  className="px-2 py-2 text-center font-medium sm:px-3 sm:py-3"
                  title={sc.labelKa}
                >
                  <span className="text-base sm:text-lg" style={{ color: sa }}>
                    {sc.symbol}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ALL_SLUGS.map((rowSlug, ri) => {
            const rowSign = SIGNS_CONTENT[rowSlug];
            const rowMeta = signMetaBySlug(rowSlug);
            const rowAccent = rowMeta ? signColor(rowMeta) : "var(--vivida-violet)";
            return (
              <tr key={rowSlug} className={ri % 2 === 0 ? "" : "bg-card/20"}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card/80 px-2 py-2 text-left text-xs font-medium sm:px-3 sm:py-3"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span style={{ color: rowAccent }}>{rowSign.symbol}</span>
                    <span className="hidden sm:inline">{rowSign.labelKa}</span>
                  </span>
                </th>
                {ALL_SLUGS.map((colSlug) => {
                  const slug = pairKey(rowSlug, colSlug);
                  const pair = PAIRS_CONTENT?.[slug];
                  if (!pair) {
                    return <td key={colSlug} className="px-2 py-2 text-center text-muted-foreground/50 sm:px-3 sm:py-3">·</td>;
                  }
                  const sc = SCORE_COLOR[pair.overallScore];
                  return (
                    <td key={colSlug} className="px-1 py-1 text-center sm:px-2 sm:py-2">
                      <Link
                        href={`/zodiac/tavsebadoba/${slug}`}
                        className="grid h-7 w-full place-items-center rounded-md text-[10px] font-semibold transition-colors hover:opacity-80 sm:h-8 sm:text-xs"
                        style={{
                          background: `color-mix(in oklch, ${sc} 18%, transparent)`,
                          color: sc,
                          boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${sc} 30%, transparent)`,
                        }}
                        title={`${pair.labelA} × ${pair.labelB}: ${pair.overallScore}`}
                      >
                        {scoreShort(pair.overallScore)}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function pairKey(a: ZodiacSlug, b: ZodiacSlug): string {
  const ia = ALL_SLUGS.indexOf(a);
  const ib = ALL_SLUGS.indexOf(b);
  return ia <= ib ? `${a}-${b}` : `${b}-${a}`;
}

function scoreShort(s: CompatibilityScore): string {
  if (s === "ძლიერი") return "★★★";
  if (s === "ჰარმონიული") return "★★";
  return "★";
}
