import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import {
  signColor,
  ELEMENT_LABELS_PL,
  MODALITY_LABELS_PL,
  bodyLabel,
  signLabel,
} from "@/lib/zodiac";
import { ZODIAC_SIGN_PL } from "@/lib/seo/zodiac-sign-pl";

const SITE = "https://www.vividaastro.com";

const POLISH_DATE_RANGES: Record<string, string> = {
  aries: "21 marca – 19 kwietnia",
  taurus: "20 kwietnia – 20 maja",
  gemini: "21 maja – 20 czerwca",
  cancer: "21 czerwca – 22 lipca",
  leo: "23 lipca – 22 sierpnia",
  virgo: "23 sierpnia – 22 września",
  libra: "23 września – 22 października",
  scorpio: "23 października – 21 listopada",
  sagittarius: "22 listopada – 21 grudnia",
  capricorn: "22 grudnia – 19 stycznia",
  aquarius: "20 stycznia – 18 lutego",
  pisces: "19 lutego – 20 marca",
};

export function ZodiacSignPagePl({ sign }: { sign: ZodiacSlug }) {
  const meta = signMetaBySlug(sign)!;
  const content = ZODIAC_SIGN_PL[sign];
  const name = meta ? signLabel(meta, "pl") : sign;
  const accent = signColor(meta);
  const dateRange = POLISH_DATE_RANGES[sign];
  const elementPl = ELEMENT_LABELS_PL[meta.element];
  const modalityPl = MODALITY_LABELS_PL[meta.modality];
  const rulerPl = meta.ruler ? bodyLabel(meta.ruler, "pl") : "";

  const faq = [
    {
      q: `Jakie są daty znaku ${name}?`,
      a: `Znak ${name} przypada tradycyjnie na okres ${dateRange}. Jeśli urodziłeś się na przełomie znaków, warto obliczyć dokładny kosmogram, ponieważ moment przejścia Słońca zmienia się nieznacznie z roku na rok.`,
    },
    {
      q: `Jaki żywioł reprezentuje ${name}?`,
      a: `${name} to znak reprezentujący żywioł ${elementPl}. Żywioł opisuje podstawowy styl, w jaki znak przetwarza życiowe doświadczenia i manifestuje swoją energię.`,
    },
    {
      q: `Jaki jest ${name} w miłości?`,
      a: content.love,
    },
    {
      q: `Czy znak słoneczny decyduje o całej osobowości?`,
      a: `Nie. Znak ${name} opisuje pozycję Słońca, natomiast znak Księżyca, Ascendent, pozostałe planety, domy i aspekty tworzą pełny i wielowymiarowy portret astrologiczny w Twoim kosmogramie.`,
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${name} – Znak Zodiaku: Daty, Cechy, Miłość i Kariera`,
      description: content.tagline,
      inLanguage: "pl",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE}/pl/znaki-zodiaku/${sign}`,
      },
      author: { "@type": "Organization", name: "Vivida" },
      about: {
        "@type": "Thing",
        name,
        description: `${name} (${dateRange}), ${content.tagline}`,
      },
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
          name: "Znaki Zodiaku",
          item: `${SITE}/pl/znaki-zodiaku`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name,
          item: `${SITE}/pl/znaki-zodiaku/${sign}`,
        },
      ],
    },
  ];

  const coreParagraphs = content.core
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="pl" georgianPath={`/zodiac/${sign}`} />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            Znaki zodiaku
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{name}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="grid size-24 shrink-0 place-items-center rounded-3xl text-6xl shadow-sm"
              style={{
                backgroundColor: `${accent}15`,
                color: accent,
                border: `1px solid ${accent}35`,
              }}
            >
              {meta.symbol}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>{elementPl}</span>
                <span>·</span>
                <span>{modalityPl}</span>
                {rulerPl && (
                  <>
                    <span>·</span>
                    <span>Władca: {rulerPl}</span>
                  </>
                )}
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                {name}
              </h1>
              <p className="mt-1 font-mono text-sm text-primary">{dateRange}</p>
            </div>
          </div>

          <p className="mt-6 text-lg font-medium leading-relaxed text-foreground sm:text-xl">
            {content.tagline}
          </p>

          <div className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {coreParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--vivida-cyan)]">
                Mocne strony
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {content.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--vivida-cyan)]">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
                Wyzwania i lekcje
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {content.challenges.map((chl, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--vivida-pink)]">•</span>
                    <span>{chl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-border/70 bg-background/40 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {name} w miłości i relacjach
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {content.love}
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/40 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Kariera, praca i powołanie
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {content.career}
              </p>
            </section>
          </div>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Często zadawane pytania
            </h2>
            <div className="mt-4 space-y-3">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="rounded-xl border border-border/80 bg-background/50 p-4"
                >
                  <summary className="cursor-pointer font-medium text-foreground">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wszystkie znaki zodiaku
            </h2>
            <div className="flex flex-wrap gap-2">
              {ALL_SLUGS.map((otherSlug) => {
                const otherMeta = signMetaBySlug(otherSlug);
                const otherName = otherMeta
                  ? signLabel(otherMeta, "pl")
                  : otherSlug;
                const active = otherSlug === sign;
                return (
                  <Link
                    key={otherSlug}
                    href={`/zodiac/${otherSlug}`}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background/50 text-foreground/80 hover:bg-background"
                    }`}
                  >
                    {otherName}
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="mt-12 flex flex-col justify-between gap-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-4" />
                <span>Twój pełny horoskop</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Odkryj swój kosmogram
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Znak {name} to Twój znak słoneczny. Oblicz bezpłatnie pozycję
                Księżyca, Ascendentu i planet w momencie Twojego urodzenia.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/nataluri-ruka">
                Oblicz kosmogram
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </article>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}
