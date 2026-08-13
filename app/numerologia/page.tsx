import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LifePathCalculator } from "@/components/seo/life-path-calculator";
import { PopularSearches } from "@/components/seo/popular-searches";
import { NUMEROLOGY_HUB_EN, NumerologyHubEn } from "@/components/seo/numerology-en";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  LIFE_PATH_CONTENT,
  NUMEROLOGY_FAQ,
} from "@/lib/seo/numerology-content";
import { NUMEROLOGY_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "ნუმეროლოგია — ბედის რიცხვის გამოთვლა და მნიშვნელობა";
const DESCRIPTION =
  "ნუმეროლოგია ქართულად — გამოთვალე შენი ბედის რიცხვი დაბადების თარიღით (უფასო კალკულატორი) და წაიკითხე ყველა რიცხვის მნიშვნელობა: 1-დან 9-მდე და მასტერ-რიცხვები 11, 22, 33.";

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
    type: "website",
    url: `${SITE_URL}/numerologia`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export async function generateMetadata(): Promise<Metadata> {
  if ((await getRequestLocale()) !== "en") return KA_METADATA;
  const path = "/numerologia";
  return {
    title: { absolute: NUMEROLOGY_HUB_EN.title },
    description: NUMEROLOGY_HUB_EN.description,
    keywords: ["life path number", "life path calculator", "numerology meanings", "master numbers"],
    alternates: localizedAlternates(path, path, "en"),
    openGraph: { type: "website", url: `https://www.vividaastro.com${path}`, title: NUMEROLOGY_HUB_EN.title, description: NUMEROLOGY_HUB_EN.description, siteName: "Vivida", locale: "en_US" },
    twitter: { card: "summary_large_image", title: NUMEROLOGY_HUB_EN.title, description: NUMEROLOGY_HUB_EN.description },
  };
}

export default async function NumerologiaHubPage() {
  if ((await getRequestLocale()) === "en") return <NumerologyHubEn />;
  const archetypes = Object.fromEntries(
    LIFE_PATH_NUMBERS.map((n) => [n, LIFE_PATH_CONTENT[n].archetypeKa])
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
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ნუმეროლოგია</span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            ნუმეროლოგია —{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ბედის რიცხვი
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            ბედის რიცხვი დაბადების თარიღიდან ითვლება და შენი ცხოვრების მთავარ
            თემას აღწერს — ძლიერ მხარეებს, გამოწვევებსა და მიმართულებას.
            გამოთვალე შენი და წაიკითხე, რას ნიშნავს.
          </p>
        </header>

        <LifePathCalculator archetypes={archetypes} />

        {/* All numbers grid */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            რიცხვების მნიშვნელობა — 1-დან 33-მდე
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LIFE_PATH_NUMBERS.map((n) => {
              const c = LIFE_PATH_CONTENT[n];
              const master = n.length > 1;
              return (
                <Link
                  key={n}
                  href={`/numerologia/${n}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20 hover:bg-card/80"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-xl text-xl font-bold ${
                        master
                          ? "bg-[var(--vivida-gold,#eac358)]/15 text-[var(--vivida-gold,#eac358)] ring-1 ring-[var(--vivida-gold,#eac358)]/40"
                          : "bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] ring-1 ring-[var(--vivida-violet)]/40"
                      }`}
                    >
                      {n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold tracking-tight">
                        {c.archetypeKa}
                      </h3>
                      <div className="text-[11px] text-muted-foreground">
                        {master ? "მასტერ-რიცხვი" : `ბედის რიცხვი ${n}`}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/85">
                    {c.essenceKa}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    სრული აღწერა →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {NUMEROLOGY_FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA → natal chart */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            რიცხვები დასაწყისია — ცა გრძელდება
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი დაბადების თარიღი ბევრად მეტს ამბობს: მთვარე, ვენერა, ამომავალი
            ნიშანი და ცის 12 სახლი. შექმენი უფასო ნატალური რუკა Vivida-ზე.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
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
