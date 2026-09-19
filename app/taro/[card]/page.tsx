import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, Briefcase, Wand2 } from "lucide-react";

import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { CardImage } from "@/components/tarot/card-image";
import {
  tarotDetailCard,
  tarotDetailDeck,
  tarotDetailSlugs,
} from "@/lib/tarot/detail";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

export const revalidate = 604800;

export function generateStaticParams() {
  return tarotDetailSlugs().map((slug) => ({ card: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ card: string }>;
}): Promise<Metadata> {
  const { card: slug } = await params;
  const locale = await getRequestLocale();

  const en = locale === "en";
  const card = tarotDetailCard(slug, en ? "en" : "ka");
  if (!card) return {};
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const url = `${siteUrl}/taro/${slug}`;
  const arcanaEn = card.arcana === "major" ? "Major Arcana" : "Minor Arcana";
  const title = en
    ? `${card.name} Tarot Card Meaning — Upright and Reversed`
    : `${card.name} — ტაროს კარტის მნიშვნელობა`;
  const description = en
    ? `Explore The ${card.name.replace(/^The /, "")} tarot card: upright and reversed meanings for love, career and personal reflection. ${card.keywords.slice(0, 3).join(", ")}.`
    : `ტაროს კარტი „${card.name}" (${card.nameEn}): პირდაპირი და შებრუნებული მნიშვნელობა, სიყვარული და კარიერა — ქართულად. ${card.keywords.slice(0, 3).join(", ")}.`;
  const og = `${siteUrl}/api/og/page?t=${encodeURIComponent(card.name)}&k=${encodeURIComponent(en ? "Tarot card" : "ტაროს კარტა")}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      ...(en
        ? [
            card.name,
            `${card.name} tarot meaning`,
            `${card.name} reversed`,
            "tarot card meanings",
            arcanaEn,
          ]
        : [
            "ტარო",
            card.name,
            `ტარო ${card.name}`,
            `${card.name} მნიშვნელობა`,
            `${card.name} ტაროს კარტი`,
            "ტაროს კარტები",
            card.nameEn,
          ]),
    ],
    alternates: localizedAlternates(
      `/taro/${slug}`,
      `/taro/${slug}`,
      en ? "en" : "ka",
    ),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function TarotCardPage({
  params,
}: {
  params: Promise<{ card: string }>;
}) {
  const { card: slug } = await params;
  const locale = await getRequestLocale();
  const en = locale === "en";

  const card = tarotDetailCard(slug, en ? "en" : "ka");
  if (!card) notFound();

  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const deck = tarotDetailDeck(en ? "en" : "ka");
  const idx = deck.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? deck[idx - 1] : null;
  const next = idx < deck.length - 1 ? deck[idx + 1] : null;
  const url = `${siteUrl}/taro/${slug}`;

  const faq = [
    {
      q: en
        ? `What does ${card.name} mean in tarot?`
        : `რას ნიშნავს ტაროს კარტი „${card.name}"?`,
      a: card.upright,
    },
    {
      q: en
        ? `What does ${card.name} reversed mean?`
        : `რას ნიშნავს შებრუნებული „${card.name}"?`,
      a: card.reversed,
    },
    {
      q: en
        ? `What does ${card.name} mean in love?`
        : `„${card.name}" სიყვარულში რას ნიშნავს?`,
      a: card.love,
    },
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: en
      ? `${card.name} tarot card meaning`
      : `${card.name} — ტაროს კარტის მნიშვნელობა`,
    description: card.upright,
    inLanguage: en ? "en" : "ka-GE",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Vivida", url: siteUrl },
    publisher: { "@type": "Organization", name: "Vivida", url: siteUrl },
    image: card.image,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: en ? "Home" : "მთავარი",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: en ? "Tarot" : "ტარო",
        item: `${siteUrl}/taro`,
      },
      { "@type": "ListItem", position: 3, name: card.name, item: url },
    ],
  };

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader
        active="taro"
        locale={locale}
        georgianPath={`/taro/${slug}`}
      />

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

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/taro" className="hover:text-foreground">
            {en ? "Tarot" : "ტარო"}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{card.name}</span>
        </nav>

        {/* Hero */}
        <article className="relative flex flex-col gap-6 sm:flex-row sm:items-stretch">
          <CardImage
            slug={card.slug}
            name={card.name}
            glyph={card.glyph}
            src={card.image}
            priority
            locale={locale}
            className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-52"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {card.eyebrow}
              {!en && ` · ${card.nameEn}`}
            </div>
            <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {card.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.keywords.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-1 text-sm text-foreground/85"
                >
                  {k}
                </span>
              ))}
            </div>
            <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/90">
              {card.upright}
            </p>
          </div>
        </article>

        {/* Upright / reversed */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold tracking-tight">
              {en ? "Upright meaning" : "პირდაპირი მნიშვნელობა"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {card.keywords.map((k) => (
                <span key={k} className="text-[11px] text-[var(--vivida-cyan)]">
                  #{k}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {card.upright}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold tracking-tight">
              {en ? "Reversed meaning" : "შებრუნებული მნიშვნელობა"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {card.reversedKeywords.map((k) => (
                <span key={k} className="text-[11px] text-[var(--vivida-pink)]">
                  #{k}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {card.reversed}
            </p>
          </article>
        </div>

        {/* Love / career */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Heart className="size-4 text-[var(--vivida-pink)]" />
              {en ? "Love" : "სიყვარული"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {card.love}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Briefcase className="size-4 text-[var(--vivida-cyan)]" />
              {en ? "Career" : "კარიერა"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {card.career}
            </p>
          </article>
        </div>

        {/* CTA → reader */}
        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Wand2 className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {en ? "Ask the tarot" : "დაუსვი კითხვა ტაროს"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            {en
              ? "Draw a three-card spread and receive a thoughtful, personal reading. Your first question is free."
              : "გაშალე 3-კარტიანი განლაგება და მიიღე ცოცხალი, პერსონალური პასუხი ქართულად. პირველი კითხვა უფასოა."}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/taro">
              {en ? "Draw the cards" : "გაშალე კარტები"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
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

        {/* Prev / next */}
        <div className="mt-12 flex items-stretch justify-between gap-3">
          {prev ? (
            <Link
              href={`/taro/${prev.slug}`}
              className="group flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 transition-colors hover:bg-card/80"
            >
              <span className="text-2xl">{prev.glyph}</span>
              <span className="min-w-0">
                <span className="block text-[11px] text-muted-foreground">
                  {en ? "Previous" : "წინა"}
                </span>
                <span className="block truncate font-medium">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/taro/${next.slug}`}
              className="group flex flex-1 items-center justify-end gap-3 rounded-2xl border border-border bg-card/55 p-4 text-right transition-colors hover:bg-card/80"
            >
              <span className="min-w-0">
                <span className="block text-[11px] text-muted-foreground">
                  {en ? "Next" : "შემდეგი"}
                </span>
                <span className="block truncate font-medium">{next.name}</span>
              </span>
              <span className="text-2xl">{next.glyph}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </div>

        {/* All cards */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "All tarot cards" : "ტაროს ყველა კარტი"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {deck
              .filter((c) => c.slug !== slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/taro/${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span aria-hidden>{c.glyph}</span>
                  {c.name}
                </Link>
              ))}
          </div>
        </section>

        <PopularSearches
          locale={locale}
          queries={
            en
              ? [
                  `${card.name} tarot meaning`,
                  `${card.name} reversed`,
                  `${card.name} love meaning`,
                  card.arcana === "major"
                    ? "Major Arcana meanings"
                    : "Minor Arcana meanings",
                ]
              : [
                  `ტარო ${card.name}`,
                  `${card.name} მნიშვნელობა`,
                  `${card.name} შებრუნებული`,
                  "ტარო ქართულად",
                  "ტაროს კარტების მნიშვნელობა",
                ]
          }
        />
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
