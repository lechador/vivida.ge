import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LifePathCalculator } from "@/components/seo/life-path-calculator";
import {
  NUMEROLOGY_HUB_EN,
  NumerologyHubEn,
} from "@/components/seo/numerology-en";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  LIFE_PATH_CONTENT,
  NUMEROLOGY_FAQ,
} from "@/lib/seo/numerology-content";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "ნუმეროლოგია, ბედის რიცხვის გამოთვლა და მნიშვნელობა";
const DESCRIPTION =
  "ნუმეროლოგია ქართულად, გამოთვალე შენი ბედის რიცხვი დაბადების თარიღით (უფასო კალკულატორი) და წაიკითხე ყველა რიცხვის მნიშვნელობა: 1-დან 9-მდე და მასტერ-რიცხვები 11, 22, 33.";

const KA_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "ნუმეროლოგია",
    "ბედის რიცხვი",
    "ბედის რიცხვის გამოთვლა",
    "ცხოვრების გზის რიცხვი",
    "ნუმეროლოგია დაბადების თარიღით",
    "რიცხვების მნიშვნელობა",
    "მასტერ რიცხვები",
    "numerologia",
    "bedis ricxvi",
    "bedis rickhvi",
  ],
  alternates: localizedAlternates("/numerologia", "/numerologia", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/numerologia`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "en") {
    const path = "/numerologia";
    return {
      title: { absolute: NUMEROLOGY_HUB_EN.title },
      description: NUMEROLOGY_HUB_EN.description,
      keywords: [
        "life path number",
        "life path calculator",
        "numerology meanings",
        "master numbers",
      ],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: englishSiteHref(path, false),
        title: NUMEROLOGY_HUB_EN.title,
        description: NUMEROLOGY_HUB_EN.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: NUMEROLOGY_HUB_EN.title,
        description: NUMEROLOGY_HUB_EN.description,
      },
    };
  }
  return KA_METADATA;
}

export default async function NumerologiaHubPage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <NumerologyHubEn />;
  const archetypes = Object.fromEntries(
    LIFE_PATH_NUMBERS.map((n) => [n, LIFE_PATH_CONTENT[n].archetypeKa]),
  );

  const ld = [
    articleLd({
      url: `${SITE_URL}/numerologia`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-13T00:00:00.000Z",
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ნუმეროლოგია", url: `${SITE_URL}/numerologia` },
    ]),
    faqLd(NUMEROLOGY_FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: LIFE_PATH_NUMBERS.map((n, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/numerologia/${n}`,
        name: LIFE_PATH_CONTENT[n].titleKa,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <Starfield count={48} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ნუმეროლოგია</span>
        </nav>

        <header className="mb-8 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            ნუმეროლოგიური ალმანახი · 1–33
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            ნუმეროლოგია,{" "}
            <span className="text-primary">ბედის რიცხვი</span>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            ბედის რიცხვი დაბადების თარიღიდან ითვლება და შენი ცხოვრების მთავარ
            თემას აღწერს, ძლიერ მხარეებს, გამოწვევებსა და მიმართულებას.
            გამოთვალე შენი და წაიკითხე, რას ნიშნავს.
          </p>
        </header>

        <LifePathCalculator archetypes={archetypes} />

        {/* All numbers grid */}
        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              რიცხვების მნიშვნელობა · 1-დან 33-მდე
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              12 Archetypes
            </span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {LIFE_PATH_NUMBERS.map((n) => {
              const c = LIFE_PATH_CONTENT[n];
              const master = n.length > 1;
              return (
                <Link
                  key={n}
                  href={`/numerologia/${n}`}
                  className="group relative flex flex-col justify-between bg-card p-6 transition-colors hover:bg-secondary/45"
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-sm border font-mono text-lg font-semibold tabular-nums ${
                          master
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-background/60 text-foreground"
                        }`}
                      >
                        {n}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-foreground">
                          {c.archetypeKa}
                        </h3>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {master ? "მასტერ-რიცხვი" : `ბედის რიცხვი ${n}`}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {c.essenceKa}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-primary">
                    <span>სრული აღწერა</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {NUMEROLOGY_FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-border/60 bg-background/40 px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA → natal chart */}
        <div className="mt-16 flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ნატალური რუკა
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              რიცხვები დასაწყისია, ცა გრძელდება
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              შენი დაბადების თარიღი ბევრად მეტს ამბობს: მთვარე, ვენერა, ამომავალი
              ნიშანი და ცის 12 სახლი. შექმენი უფასო ნატალური რუკა Vivida-ზე.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">
              ჩემი ნატალური რუკა
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
