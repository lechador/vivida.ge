import { EnglishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { LifePathCalculator } from "@/components/seo/life-path-calculator";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/en/editorial";
import { LIFE_PATH_NUMBERS, type LifePathNumber } from "@/lib/numerology";
import {
  LIFE_PATH_CONTENT_EN,
  NUMEROLOGY_FAQ_EN,
  type LifePathContentEn,
} from "@/lib/seo/numerology-content-en";

const SITE = "https://www.vividaastro.com";

export const NUMEROLOGY_HUB_EN = {
  title: "Life Path Number Calculator and Numerology Meanings",
  description:
    "Calculate your life path number from your birth date and explore the meanings of numbers 1–9 and Master Numbers 11, 22, and 33.",
};

export function NumerologyHubEn() {
  const archetypes = Object.fromEntries(
    LIFE_PATH_NUMBERS.map((number) => [
      number,
      LIFE_PATH_CONTENT_EN[number].archetype,
    ]),
  );
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: NUMEROLOGY_HUB_EN.title,
      description: NUMEROLOGY_HUB_EN.description,
      inLanguage: "en",
      mainEntityOfPage: `${SITE}/numerologia`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Life path number meanings",
      numberOfItems: LIFE_PATH_NUMBERS.length,
      itemListElement: LIFE_PATH_NUMBERS.map((number, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: LIFE_PATH_CONTENT_EN[number].title,
        url: `${SITE}/numerologia/${number}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: NUMEROLOGY_FAQ_EN.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="en" georgianPath="/numerologia" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Numerology</span>
        </nav>
        <header className="mb-8 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Numerological Almanac · 1–33
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-[-0.02em] sm:text-5xl">
            Numerology and your <Accent>life path number</Accent>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Calculate your number from your birth date, then explore the
            archetypal strengths, challenges, relationship style, and career
            themes traditionally associated with it.
          </p>
        </header>

        <LifePathCalculator archetypes={archetypes} locale="en" />

        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-normal tracking-tight">
              Life path number meanings
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Numbers 1–9 · 11, 22, 33
            </span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {LIFE_PATH_NUMBERS.map((number) => {
              const content = LIFE_PATH_CONTENT_EN[number];
              const master = number.length > 1;
              return (
                <Link
                  key={number}
                  href={`/numerologia/${number}`}
                  className="group relative flex flex-col justify-between bg-card p-6 transition-colors hover:bg-secondary/45"
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <NumberBadge number={number} master={master} />
                      <div>
                        <h3 className="font-semibold tracking-tight text-foreground">
                          {content.archetype}
                        </h3>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {master ? "Master Number" : `Life Path ${number}`}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {content.essence}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-primary">
                    <span>Read full meaning</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {NUMEROLOGY_FAQ_EN.map((item) => (
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

        <div className="mt-16 flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Natal Chart
            </p>
            <h2 className="font-display mt-2 text-balance text-2xl font-normal tracking-tight sm:text-3xl">
              Numbers are one lens; the sky adds another
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              A birth chart maps the Moon, rising sign, planets, houses, and
              aspects for your exact birth time and place.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/natal-chart">
              Explore my natal chart
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Numerology is a symbolic tradition, not a scientifically validated
          personality test or predictive method. Use these meanings for
          reflection rather than certainty.
        </p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

export function LifePathNumberPageEn({
  number,
  content,
}: {
  number: LifePathNumber;
  content: LifePathContentEn;
}) {
  const master = number.length > 1;
  const url = `${SITE}/numerologia/${number}`;
  const sections = [
    {
      title: "Natural strengths",
      body: content.strengths,
    },
    {
      title: "Growth challenges",
      body: content.challenges,
    },
    {
      title: "Love and relationships",
      body: content.love,
    },
    {
      title: "Career and work style",
      body: content.career,
    },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.essence,
      inLanguage: "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida", url: SITE },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Numerology",
          item: `${SITE}/numerologia`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `Life Path ${number}`,
          item: url,
        },
      ],
    },
  ];

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="en" georgianPath={`/numerologia/${number}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/numerologia" className="hover:text-foreground">
            Numerology
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Life Path {number}</span>
        </nav>
        <header className="mb-8 border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <NumberBadge number={number} master={master} large />
            <div>
              <h1 className="font-display text-balance text-3xl font-normal tracking-tight sm:text-4xl">
                {content.title}
              </h1>
              {master && (
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Master Number
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {content.essence}
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {content.traits.join(" · ")}
          </p>
        </header>

        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {sections.map((section) => (
            <section key={section.title} className="p-5 sm:p-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                {section.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                {section.body}
              </p>
            </section>
          ))}
          <section className="bg-secondary/35 p-5 sm:p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
              Advice for Life Path {number}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {content.advice}
            </p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Other life path numbers
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {LIFE_PATH_NUMBERS.filter((item) => item !== number).map((item) => (
              <Link
                key={item}
                href={`/numerologia/${item}`}
                className="grid size-10 place-items-center rounded-sm border border-border bg-card font-mono text-sm font-semibold tabular-nums transition-colors hover:border-primary/40 hover:bg-secondary/45"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-md">
            <h2 className="font-display text-balance text-2xl font-normal tracking-tight">
              One number is one part of the picture
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Explore a Western birth chart calculated from your exact birth time
              and place.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/natal-chart">
              Explore my natal chart
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          This interpretation reflects numerology tradition and is intended for
          self-reflection. It is not a scientific assessment, diagnosis, or
          prediction.
        </p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

function NumberBadge({
  number,
  master,
  large = false,
}: {
  number: string;
  master: boolean;
  large?: boolean;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-sm border font-mono font-semibold tabular-nums ${large ? "size-14 text-2xl" : "size-11 text-lg"} ${master ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background/60 text-foreground"}`}
    >
      {number}
    </span>
  );
}
