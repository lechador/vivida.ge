import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { ANGEL_NUMBERS, type AngelNumber } from "@/lib/seo/angel-numbers";
import {
  ANGEL_FAQ_PL,
  ANGEL_HUB_PL,
  ANGEL_NUMBERS_PL,
  type AngelNumberPl,
} from "@/lib/seo/angel-numbers-pl";
import { jsonLdString } from "@/lib/seo/jsonld";

export { ANGEL_HUB_PL };

const SITE = "https://www.vividaastro.com";

export function AngelNumbersHubPl() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: ANGEL_HUB_PL.title,
      description: ANGEL_HUB_PL.description,
      inLanguage: "pl",
      mainEntityOfPage: `${SITE}/pl/liczby-anielskie`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Znaczenie liczb anielskich",
      numberOfItems: ANGEL_NUMBERS_PL.length,
      itemListElement: ANGEL_NUMBERS_PL.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/pl/liczby-anielskie/${item.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ANGEL_FAQ_PL.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Background />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="pl" georgianPath="/angeluri-ricxvebi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span className="text-foreground/80">Liczby anielskie</span>
        </nav>
        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Współczesna numerologia
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Liczby anielskie i ich{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              znaczenie
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80">
            Zauważasz na zegarze 11:11, 222 albo 444? Poznaj ich symboliczną
            interpretację w miłości, życiu i karierze oraz potraktuj tę chwilę
            jako inspirację do świadomego działania.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {ANGEL_NUMBERS_PL.map((item) => {
            const base = ANGEL_NUMBERS.find(
              (number) => number.slug === item.slug,
            );
            return (
              <Link
                key={item.slug}
                href={`/angeluri-ricxvebi/${item.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5 transition-colors hover:bg-card/75"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    {item.slug}
                  </span>
                  {base?.clockKa && (
                    <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {base.clockKa}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                  {item.essence}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-violet)]">
                  Sprawdź znaczenie
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Dlaczego powtarzające się cyfry przyciągają uwagę?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Gdy dany wzorzec nabiera dla nas znaczenia, selektywna uwaga mózgu
            zaczyna natychmiast go wyłapywać. Symetria i rytm są naturalnie
            atrakcyjne dla ludzkiego oka, a telefony, zegary, rachunki i numery
            otaczają nas każdego dnia.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Praktyka symboliczna jest wartościowa, gdy stwarza przestrzeń na
            chwilę zatrzymania. Użyj tego momentu, by przyjrzeć się swoim myślom
            i podjąć świadomą decyzję zgodną z Twoimi wartościami.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Najczęściej zadawane pytania
          </h2>
          <div className="space-y-3">
            {ANGEL_FAQ_PL.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-border bg-card/50 p-5"
              >
                <summary className="cursor-pointer font-medium">
                  {item.q}
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Oblicz swoją Liczbę Drogi Życia
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Liczby anielskie opisują dany moment, natomiast Liczba Drogi Życia
            odzwierciedla stały archetyp obliczany z Twojej daty urodzenia.
          </p>
          <Link
            href="/numerologia"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Kalkulator Drogi Życia
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Liczby anielskie są symboliczną tradycją kulturową i nie stanowią
          naukowej prognozy przyszłości.
        </p>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}

export function AngelNumberPagePl({
  base,
  content,
}: {
  base: AngelNumber;
  content: AngelNumberPl;
}) {
  const url = `${SITE}/pl/liczby-anielskie/${base.slug}`;
  const faq = [
    { q: `Co oznacza liczba anielska ${base.slug}?`, a: content.meaning },
    { q: `Co oznacza ${base.slug} w miłości?`, a: content.love },
    { q: `Co zrobić, gdy widzę ${base.slug}?`, a: content.action },
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
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
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
          name: "Liczby anielskie",
          item: `${SITE}/pl/liczby-anielskie`,
        },
        { "@type": "ListItem", position: 3, name: base.slug, item: url },
      ],
    },
  ];
  const sections = [
    {
      title: "Miłość i relacje",
      body: content.love,
      accent: "var(--vivida-pink)",
    },
    {
      title: "Kariera i finanse",
      body: content.career,
      accent: "var(--vivida-cyan)",
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Background />
      <Starfield count={110} shooting={2} />
      <SmartHeader
        locale="pl"
        georgianPath={`/angeluri-ricxvebi/${base.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/angeluri-ricxvebi">Liczby anielskie</Link>
          <span>/</span>
          <span className="text-foreground/80">{base.slug}</span>
        </nav>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              {base.slug}
            </span>
            {base.clockKa && (
              <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground">
                {base.clockKa}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {content.title}
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-foreground/90">
            {content.essence}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            Co oznacza liczba {base.slug}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            {content.meaning}
          </p>
        </section>
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"
            >
              <h2
                className="text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: section.accent }}
              >
                {section.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                {section.body}
              </p>
            </section>
          ))}
          <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
              Co zrobić, gdy widzisz {base.slug}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {content.action}
            </p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Inne liczby anielskie
          </h2>
          <div className="flex flex-wrap gap-2">
            {ANGEL_NUMBERS.filter((item) => item.slug !== base.slug).map(
              (item) => (
                <Link
                  key={item.slug}
                  href={`/angeluri-ricxvebi/${item.slug}`}
                  className="rounded-xl border border-border bg-card/55 px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-card/85"
                >
                  {item.slug}
                </Link>
              ),
            )}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Poznaj swoją Liczbę Drogi Życia
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            Oblicz archetyp numerologiczny na podstawie swojej daty urodzenia i
            odkryj swój życiowy potencjał.
          </p>
          <Link
            href="/numerologia"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Oblicz moją liczbę
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Interpretacja ma charakter symboliczny i służy autorefleksji.
        </p>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}

function Background() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
    />
  );
}
