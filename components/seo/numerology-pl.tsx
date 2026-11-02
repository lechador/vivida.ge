import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { LifePathCalculator } from "@/components/seo/life-path-calculator";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { LIFE_PATH_NUMBERS, type LifePathNumber } from "@/lib/numerology";
import {
  LIFE_PATH_CONTENT_PL,
  NUMEROLOGY_FAQ_PL,
  NUMEROLOGY_HUB_PL,
  type LifePathContentPl,
} from "@/lib/seo/numerology-content-pl";

export { NUMEROLOGY_HUB_PL };

const SITE = "https://www.vividaastro.com";

export function NumerologyHubPl() {
  const archetypes = Object.fromEntries(
    LIFE_PATH_NUMBERS.map((number) => [
      number,
      LIFE_PATH_CONTENT_PL[number].archetype,
    ]),
  );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: NUMEROLOGY_HUB_PL.title,
      description: NUMEROLOGY_HUB_PL.description,
      inLanguage: "pl",
      mainEntityOfPage: `${SITE}/pl/numerologia`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Znaczenie liczb drogi życia w numerologii",
      numberOfItems: LIFE_PATH_NUMBERS.length,
      itemListElement: LIFE_PATH_NUMBERS.map((number, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: LIFE_PATH_CONTENT_PL[number].title,
        url: `${SITE}/pl/numerologia/${number}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: NUMEROLOGY_FAQ_PL.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="pl" georgianPath="/numerologia" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Strona główna
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Numerologia</span>
        </nav>
        <header className="mb-8 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Almanach Numerologiczny · 1–33
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Numerologia i Twoja{" "}
            <span className="text-primary">Droga Życia</span>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Oblicz swoją Liczbę Drogi Życia z daty urodzenia i poznaj swoje
            wrodzone talenty, wyzwania rozwojowe, styl relacji oraz optymalne
            ścieżki kariery.
          </p>
        </header>

        <LifePathCalculator archetypes={archetypes} locale="pl" />

        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Znaczenie liczb · od 1 do 33
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              12 Archetypów
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIFE_PATH_NUMBERS.map((number) => {
              const item = LIFE_PATH_CONTENT_PL[number];
              const master = number.length > 1;
              return (
                <Link
                  key={number}
                  href={`/numerologia/${number}`}
                  className={`group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-secondary/45 ${
                    master
                      ? "border-[color-mix(in_oklab,var(--vivida-gold)_45%,var(--border))] hover:border-[var(--vivida-gold)]"
                      : "border-border hover:border-primary/45"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <NumberBadge number={number} master={master} />
                      <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-foreground">
                          {item.archetype}
                        </h3>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {master
                            ? "Liczba Mistrzowska"
                            : `Droga Życia ${number}`}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {item.essence}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-primary">
                    <span>Pełny opis</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Najczęściej zadawane pytania o numerologię
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {NUMEROLOGY_FAQ_PL.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30">
                  {item.q}
                  <span className="font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-border/60 bg-background/50 px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col justify-between gap-6 rounded-xl border border-primary/35 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Horoskop urodzeniowy
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Liczby to początek, niebo sięga dalej
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Twoja data urodzenia mówi znacznie więcej: poznaj pozycję
              Księżyca, Wenus, swój Ascendent oraz 12 domów astrologicznych.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">
              Mój kosmogram urodzeniowy
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}

export function LifePathNumberPagePl({
  number,
  content,
}: {
  number: LifePathNumber;
  content: LifePathContentPl;
}) {
  const master = number.length > 1;
  const url = `${SITE}/pl/numerologia/${number}`;
  const sections = [
    {
      title: "Mocne strony i talenty",
      body: content.strengths,
    },
    {
      title: "Wyzwania rozwojowe i lekcje",
      body: content.challenges,
    },
    {
      title: "Miłość i relacje partnerskie",
      body: content.love,
    },
    {
      title: "Kariera i styl pracy",
      body: content.career,
    },
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.essence,
      inLanguage: "pl",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida", url: SITE },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Strona główna",
          item: `${SITE}/pl`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Numerologia",
          item: `${SITE}/pl/numerologia`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `Droga Życia ${number}`,
          item: url,
        },
      ],
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="pl" georgianPath={`/numerologia/${number}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Strona główna
          </Link>
          <span>/</span>
          <Link href="/numerologia" className="hover:text-foreground">
            Numerologia
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Droga Życia {number}</span>
        </nav>
        <header className="mb-8 border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <NumberBadge number={number} master={master} large />
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {content.title}
              </h1>
              {master && (
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Liczba Mistrzowska
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
              Wskazówka dla Drogi Życia {number}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {content.advice}
            </p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Pozostałe liczby drogi życia
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
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Jedna liczba to część większej układanki
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Poznaj pełny horoskop urodzeniowy obliczony na podstawie Twojej
              dokładnej daty, godziny i miejsca urodzenia.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">
              Mój kosmogram urodzeniowy
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Interpretacja opiera się na tradycji numerologicznej i służy
          samopoznaniu. Nie stanowi diagnozy psychologicznej ani naukowej oceny.
        </p>
      </section>
      <SiteFooter locale="pl" />
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
