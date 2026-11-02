import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ALL_SLUGS, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  signColor,
  ELEMENT_LABELS_PL,
  MODALITY_LABELS_PL,
  bodyLabel,
  signLabel,
} from "@/lib/zodiac";
import { ZODIAC_HUB_PL } from "@/lib/seo/zodiac-sign-pl";

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

export function ZodiacHubPl() {
  const ld = [
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
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: ZODIAC_HUB_PL.title,
      description: ZODIAC_HUB_PL.description,
      url: `${SITE}/pl/znaki-zodiaku`,
      inLanguage: "pl",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((slug, index) => {
          const meta = signMetaBySlug(slug);
          return {
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE}/pl/znaki-zodiaku/${slug}`,
            name: meta ? signLabel(meta, "pl") : slug,
          };
        }),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ZODIAC_HUB_PL.faq.map((item) => ({
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
      <SmartHeader locale="pl" georgianPath="/zodiac" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="border-b border-border pb-8">
          <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            PRZEWODNIK ASTROLOGICZNY · ALMANACH ZODIAKU
          </div>
          <h1 className="mb-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            12 <span className="text-primary">znaków zodiaku</span>
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            Poznaj każdy znak zodiaku: daty, symbole, żywioły, jakości, wzorce
            osobowości, relacje partnerskie oraz głębsze warstwy kryjące się za
            Twoim znakiem słonecznym.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/zodiac/datit">
                <Calendar className="size-4" />
                Sprawdź znak po dacie
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/nataluri-ruka">
                Oblicz swój kosmogram
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="mt-10 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          <p>
            Zodiak to dwunastoczęściowa mapa rocznej drogi Słońca na tle
            nieboskłonu. Twój znak słoneczny opisuje fundament Twojej tożsamości
            i siłę witalną, ale stanowi tylko jeden z wielu elementów Twojego
            pełnego horoskopu urodzeniowego.
          </p>
          <p>
            Każdy znak łączy w sobie żywioł i jakość (modalność). Żywioł określa
            rodzaj energii, a jakość opisuje, jak ta energia inicjuje, utrwala
            lub dostosowuje się do zmian. Wybierz znak poniżej, aby poznać jego
            pełny opis.
          </p>
        </div>

        <h2 className="mb-4 mt-14 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Wszystkie znaki zodiaku
        </h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {ALL_SLUGS.map((slug) => {
            const content = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--primary)";
            const namePl = meta ? signLabel(meta, "pl") : slug;
            const elementPl = ELEMENT_LABELS_PL[meta?.element ?? "ცეცხლი"];
            const modalityPl =
              MODALITY_LABELS_PL[meta?.modality ?? "კარდინალური"];
            const rulerPl = meta?.ruler
              ? bodyLabel(meta.ruler, "pl")
              : undefined;

            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}`}
                className="group flex flex-col justify-between bg-card p-5 transition-colors duration-150 hover:bg-secondary/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="grid size-10 place-items-center rounded-sm border border-border bg-background text-2xl"
                      style={{ color: accent }}
                    >
                      {content.symbol}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {elementPl}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
                    {namePl}
                  </div>
                  <div className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    {POLISH_DATE_RANGES[slug]}
                  </div>
                </div>
                <div className="mt-4 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                  {elementPl} · {modalityPl}
                  {rulerPl && <span> · {rulerPl}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        <article className="mt-16 grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-3">
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              01 · FUNDAMENTY
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Czym jest zodiak?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              W zachodniej astrologii tropikalnej zodiak rozpoczyna się w
              punkcie równonocy wiosennej znakiem Barana i podąża za naturalnym
              cyklem pór roku. Dwanaście znaków tworzy symboliczny język
              opisujący ludzki temperament i potencjał.
            </p>
          </section>
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              02 · ŻYWIOŁY
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Cztery żywioły
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              Znaki Ognia działają poprzez pasję i inspirację, Ziemia przez
              praktyczność i stabilność, Powietrze przez idee i komunikację, a
              Woda przez uczucia i intuicję. Większość kosmogramów zawiera
              unikalną mieszankę wszystkich czterech żywiołów.
            </p>
          </section>
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              03 · MODALNOŚCI
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Trzy jakości
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              Znaki Kardynalne inicjują działanie, Stałe stabilizują i budują, a
              Zmienne dostosowują się do okoliczności. Każda pora roku zaczyna
              się, rozwija i przechodzi w kolejną w tym powtarzającym się
              rytmie.
            </p>
          </section>
        </article>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Najczęściej zadawane pytania
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {ZODIAC_HUB_PL.faq.map((item) => (
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
              Kosmogram urodzeniowy
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Znak słoneczny to zaledwie początek
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Oblicz swój pełny horoskop urodzeniowy: odkryj znak Księżyca,
              Ascendent, pozycje planet oraz 12 domów astrologicznych.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">
              Oblicz kosmogram za darmo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}
