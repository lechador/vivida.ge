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
import { TAROT_CARDS, TAROT_BY_SLUG } from "@/lib/tarot/deck";

const SITE_URL = "https://www.vivida.ge";

export const revalidate = 604800;

export function generateStaticParams() {
  return TAROT_CARDS.map((c) => ({ card: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ card: string }>;
}): Promise<Metadata> {
  const { card: slug } = await params;
  const card = TAROT_BY_SLUG[slug];
  if (!card) return {};
  const url = `${SITE_URL}/taro/${slug}`;
  const title = `${card.nameKa} — ტაროს კარტის მნიშვნელობა`;
  const description = `ტაროს კარტი „${card.nameKa}" (${card.nameEn}): პირდაპირი და შებრუნებული მნიშვნელობა, სიყვარული და კარიერა — ქართულად. ${card.keywordsKa
    .slice(0, 3)
    .join(", ")}.`;
  const og = `${SITE_URL}/api/og/page?t=${encodeURIComponent(
    card.nameKa
  )}&k=${encodeURIComponent("ტაროს კარტა")}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      "ტარო",
      card.nameKa,
      `ტარო ${card.nameKa}`,
      `${card.nameKa} მნიშვნელობა`,
      `${card.nameKa} ტაროს კარტი`,
      "ტაროს კარტები",
      card.nameEn,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
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
  const card = TAROT_BY_SLUG[slug];
  if (!card) notFound();

  const idx = TAROT_CARDS.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? TAROT_CARDS[idx - 1] : null;
  const next = idx < TAROT_CARDS.length - 1 ? TAROT_CARDS[idx + 1] : null;
  const url = `${SITE_URL}/taro/${slug}`;

  const faq = [
    { q: `რას ნიშნავს ტაროს კარტი „${card.nameKa}"?`, a: card.uprightKa },
    {
      q: `რას ნიშნავს შებრუნებული „${card.nameKa}"?`,
      a: card.reversedKa,
    },
    { q: `„${card.nameKa}" სიყვარულში რას ნიშნავს?`, a: card.loveKa },
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${card.nameKa} — ტაროს კარტის მნიშვნელობა`,
    description: card.uprightKa,
    inLanguage: "ka-GE",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    image: `${SITE_URL}/tarot/${slug}.webp`,
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
      { "@type": "ListItem", position: 1, name: "მთავარი", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ტარო",
        item: `${SITE_URL}/taro`,
      },
      { "@type": "ListItem", position: 3, name: card.nameKa, item: url },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
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

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/taro" className="hover:text-foreground">
            ტარო
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{card.nameKa}</span>
        </nav>

        {/* Hero */}
        <article className="relative flex flex-col gap-6 sm:flex-row sm:items-stretch">
          <CardImage
            slug={card.slug}
            nameKa={card.nameKa}
            glyph={card.glyph}
            priority
            className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-52"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              დიდი არკანა · {card.number} · {card.nameEn}
            </div>
            <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {card.nameKa}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.keywordsKa.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-1 text-sm text-foreground/85"
                >
                  {k}
                </span>
              ))}
            </div>
            <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/90">
              {card.uprightKa}
            </p>
          </div>
        </article>

        {/* Upright / reversed */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold tracking-tight">
              პირდაპირი მნიშვნელობა
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {card.keywordsKa.map((k) => (
                <span
                  key={k}
                  className="text-[11px] text-[var(--vivida-cyan)]"
                >
                  #{k}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {card.uprightKa}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="text-lg font-semibold tracking-tight">
              შებრუნებული მნიშვნელობა
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {card.keywordsRevKa.map((k) => (
                <span
                  key={k}
                  className="text-[11px] text-[var(--vivida-pink)]"
                >
                  #{k}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {card.reversedKa}
            </p>
          </article>
        </div>

        {/* Love / career */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Heart className="size-4 text-[var(--vivida-pink)]" />
              სიყვარული
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {card.loveKa}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Briefcase className="size-4 text-[var(--vivida-cyan)]" />
              კარიერა
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {card.careerKa}
            </p>
          </article>
        </div>

        {/* CTA → reader */}
        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Wand2 className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            დაუსვი კითხვა ტაროს
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            გაშალე 3-კარტიანი განლაგება და მიიღე ცოცხალი, პერსონალური პასუხი
            ქართულად. პირველი კითხვა უფასოა.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/taro">
              გაშალე კარტები
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
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
                  წინა
                </span>
                <span className="block truncate font-medium">
                  {prev.nameKa}
                </span>
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
                  შემდეგი
                </span>
                <span className="block truncate font-medium">
                  {next.nameKa}
                </span>
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
            ტაროს ყველა კარტი
          </h2>
          <div className="flex flex-wrap gap-2">
            {TAROT_CARDS.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                href={`/taro/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                <span aria-hidden>{c.glyph}</span>
                {c.nameKa}
              </Link>
            ))}
          </div>
        </section>

        <PopularSearches
          queries={[
            `ტარო ${card.nameKa}`,
            `${card.nameKa} მნიშვნელობა`,
            `${card.nameKa} შებრუნებული`,
            "ტარო ქართულად",
            "ტაროს კარტების მნიშვნელობა",
          ]}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
