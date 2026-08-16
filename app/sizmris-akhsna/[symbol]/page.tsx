import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularSearches } from "@/components/seo/popular-searches";
import { DreamSymbolPageEn } from "@/components/seo/dreams-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ALL_DREAM_SLUGS,
  DREAM_BY_SLUG,
  DREAM_SYMBOLS,
  isDreamSlug,
} from "@/lib/seo/dreams";
import { DREAM_EN_BY_SLUG } from "@/lib/seo/dreams-en";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

type Params = { symbol: string };

export function generateStaticParams() {
  return ALL_DREAM_SLUGS.map((symbol) => ({ symbol }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { symbol } = await params;
  if (!isDreamSlug(symbol)) return {};
  const s = DREAM_BY_SLUG[symbol];
  const locale = await getRequestLocale();
  if (locale === "en") {
    const content = DREAM_EN_BY_SLUG[symbol];
    if (!content) return {};
    const path = `/sizmris-akhsna/${symbol}`;
    const title = `${content.title} Dream Meaning: Symbolism and Common Scenarios`;
    const description = `${content.summary} Explore common scenarios, a positive reading, and what the dream may invite you to notice.`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: { images: [DEFAULT_OG_IMAGE], type: "article", url: `https://www.vividaastro.com${path}`, title, description, siteName: "Vivida", locale: "en_US" },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const url = `${SITE_URL}/sizmris-akhsna/${s.slug}`;
  const title = `${s.titleKa} სიზმარში — რას ნიშნავს, სიზმრის ახსნა`;
  const description = `${s.summaryKa} ${s.meaningKa.slice(0, 110)}… ნახე ყველა ვარიანტი: ${s.variantsKa
    .slice(0, 3)
    .map((v) => v.whenKa)
    .join(", ")}.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${s.titleKa} სიზმარში`,
      `სიზმრად ვნახე ${s.titleKa}`,
      `${s.titleKa} სიზმრის ახსნა`,
      `რას ნიშნავს ${s.titleKa} სიზმარში`,
      "სიზმრის ახსნა",
      "სიზმრების ახსნა",
      ...s.latin,
      "sizmris axsna",
    ],
    alternates: localizedAlternates(`/sizmris-akhsna/${symbol}`, `/sizmris-akhsna/${symbol}`, "ka"),
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

/**
 * One page per dream symbol. The `variantsKa` list is the point: it carries
 * the actual long-tail phrasings ("შავი გველი", "კბილი სისხლით ვარდება")
 * that people type verbatim, each as its own scannable answer block.
 */
export default async function DreamSymbolPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { symbol } = await params;
  if (!isDreamSlug(symbol)) notFound();
  const s = DREAM_BY_SLUG[symbol];
  if ((await getRequestLocale()) === "en") {
    const content = DREAM_EN_BY_SLUG[symbol];
    if (!content) notFound();
    return <DreamSymbolPageEn base={s} content={content} />;
  }
  const url = `${SITE_URL}/sizmris-akhsna/${s.slug}`;

  // The variants double as an FAQ — same content, but eligible for the
  // "People also ask" style rich result.
  const faq = s.variantsKa.map((v) => ({
    q: `რას ნიშნავს, თუ სიზმარში ${v.whenKa}?`,
    a: v.meansKa,
  }));

  const ld = [
    articleLd({
      url,
      headline: `${s.titleKa} სიზმარში — რას ნიშნავს`,
      description: s.summaryKa,
      datePublished: "2026-07-29T00:00:00.000Z",
      about: {
        "@type": "Thing",
        name: `${s.titleKa} სიზმარში`,
        alternateName: s.latin,
      },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "სიზმრის ახსნა", url: `${SITE_URL}/sizmris-akhsna` },
      { name: s.titleKa, url },
    ]),
    faqLd(faq),
  ];

  const related = s.related
    .map((slug) => DREAM_BY_SLUG[slug])
    .filter(Boolean);

  // A few more symbols to keep every page well-linked even when `related`
  // is short — orphan pages are the usual reason a cluster never indexes.
  const alsoSee = DREAM_SYMBOLS.filter(
    (x) => x.slug !== s.slug && !s.related.includes(x.slug)
  ).slice(0, 12);

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_265/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.28_0.14_300/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <Link href="/sizmris-akhsna" className="hover:text-foreground">
            სიზმრის ახსნა
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{s.titleKa}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 text-3xl ring-1 ring-[var(--vivida-violet)]/35">
              {s.glyph}
            </span>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {s.titleKa} სიზმარში
              </h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                სიზმრის ახსნა
              </p>
            </div>
          </div>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
            {s.summaryKa}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            ზოგადი მნიშვნელობა
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            {s.meaningKa}
          </p>
        </section>

        {/* The long-tail body. */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რას ნიშნავს კონკრეტულად — {s.titleKa} სიზმარში
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            იპოვე ის ვარიანტი, რომელიც შენს სიზმარს ყველაზე ახლოს დგას.
          </p>
          <div className="mt-4 space-y-3">
            {s.variantsKa.map((v) => (
              <article
                key={v.whenKa}
                className="rounded-2xl border border-border/70 bg-card/40 p-4 ring-1 ring-foreground/5 sm:p-5"
              >
                <h3 className="font-semibold text-foreground/95">
                  {v.whenKa}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">
                  {v.meansKa}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-cyan)]">
              კეთილი ნიშანი
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/88">
              {s.goodKa}
            </p>
          </section>
          <section className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-pink)]">
              რას უნდა მიაქციო ყურადღება
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/88">
              {s.warnKa}
            </p>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              მსგავსი სიმბოლოები
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/sizmris-akhsna/${r.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/45 px-3.5 py-2.5 text-sm transition-colors hover:bg-card/75"
                >
                  <span className="text-lg">{r.glyph}</span>
                  <span className="font-medium text-foreground/90">
                    {r.titleKa}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა სიზმრები
          </h2>
          <div className="flex flex-wrap gap-2">
            {alsoSee.map((r) => (
              <Link
                key={r.slug}
                href={`/sizmris-akhsna/${r.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:bg-card/80"
              >
                <span>{r.glyph}</span>
                {r.titleKa}
              </Link>
            ))}
            <Link
              href="/sizmris-akhsna"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-xs font-medium text-[var(--vivida-violet)]"
            >
              ყველა სიმბოლო
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            გაქვს კითხვა, რომელზეც სიზმარმა პასუხი არ გასცა?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            დაუსვი კითხვა ტაროს და მიიღე პერსონალური პასუხი ქართულად —
            პირველი გაშლა უფასოა.
          </p>
          <Link
            href="/taro"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ტაროზე მკითხაობა
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <PopularSearches
          queries={[
            ...s.latin,
            `${s.slug} sizmarshi`,
            "sizmris axsna",
            "sizmris axsna anbanis mixedvit",
          ]}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
