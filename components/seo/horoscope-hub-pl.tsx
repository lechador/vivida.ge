import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularTools } from "@/components/nav/popular-tools";
import { Accent } from "@/components/en/editorial";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import { VIEW_PATH } from "@/lib/sign-horoscope";
import { localizedHref } from "@/lib/seo/public-paths";
import { serializeLd } from "@/lib/seo/jsonld";

const SIGN_SUMMARY_PL: Record<string, string> = {
  aries:
    "Działaj dziś zdecydowanie, ale zostaw przestrzeń na wysłuchanie tego, o co naprawdę proszą inni.",
  taurus:
    "Stabilny postęp liczy się bardziej niż pośpiech. Chroń swoją energię i inwestuj ją w to, co trwałe.",
  gemini:
    "Szczera rozmowa może odblokować kolejny krok. Zadaj bezpośrednie pytanie i bądź otwarty na odpowiedź.",
  cancer:
    "Twoja intuicja emocjonalna jest dziś wyjątkowo wyostrzona. Wykorzystaj ją, by postawić jasne granice.",
  leo: "Widoczność przynosi szanse, gdy łączy się z wielkodusznością. Pozwól, by pewność siebie zrobiła miejsce na współpracę.",
  virgo:
    "Praktyczna korekta może uporządkować cały dzień. Skup się na jednym detalu, który ułatwi wszystko inne.",
  libra:
    "Równowaga nie oznacza unikania wyboru. Nazwij to, co dla Ciebie ważne, i pozwól relacji odpowiedzieć szczerze.",
  scorpio:
    "Intensywność staje się wielką siłą, gdy ma jasny kierunek. Skieruj uwagę na jedno kluczowe zadanie lub rozmowę.",
  sagittarius:
    "Szersza perspektywa jest na wyciągnięcie ręki, ale kolejny krok wymaga konkretnego planu. Przekuj inspirację w czyn.",
  capricorn:
    "Dobra struktura jest dziś Twoim sprzymierzeńcem. Zdefiniuj priorytet i pozwól, by konsekwencja przyniosła owoce.",
  aquarius:
    "Świeży pomysł zasługuje na próbę. Podziel się nim z kimś, kto konstruktywnie rzuci mu wyzwanie.",
  pisces:
    "Wrażliwość to cenna informacja, a nie przymus działania. Zauważ emocje, a potem wybierz najlepszą odpowiedź.",
};

const ZODIAC_DATES_PL: Record<string, string> = {
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

const FAQ_PL = [
  {
    q: "Jak powstaje horoskop dzienny?",
    a: "Vivida analizuje bieżące pozycje planet i główne aspekty astrologiczne, aby opisać ton dnia dla każdego znaku Słońca. Osobisty horoskop idzie dalej, porównując tranzyty z Twoim kompletnym kosmogramem urodzeniowym.",
  },
  {
    q: "Gdzie znajdę horoskop na jutro?",
    a: "Otwórz swój znak zodiaku i przełącz widok z prognozy na dziś na horoskop na jutro, tydzień lub miesiąc.",
  },
  {
    q: "Czym różnią się horoskopy dzienne, tygodniowe i miesięczne?",
    a: "Horoskopy dzienne skupiają się na szybko zmieniających się wpływach, zwłaszcza fazach i tranzytach Księżyca. Prognozy tygodniowe i miesięczne opisują szersze cykle planetarne i długoterminowe trendy.",
  },
  {
    q: "Czy horoskop w serwisie Vivida jest darmowy?",
    a: "Tak. Horoskopy dzienne, tygodniowe i miesięczne dla wszystkich znaków zodiaku są bezpłatne. Możesz także bezpłatnie obliczyć swój pełny kosmogram urodzeniowy.",
  },
];

export function HoroscopeHubPl() {
  const today = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date());

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Horoskop Dzienny na Dziś – Wszystkie Znaki Zodiaku",
    url: "https://www.vividaastro.com/pl/horoskop-dzienny",
    inLanguage: "pl",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ALL_SLUGS.map((slug, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: signMetaBySlug(slug)?.labelPl ?? slug,
        url: `https://www.vividaastro.com${localizedHref(`/zodiac/${slug}/${VIEW_PATH.today}`, "pl")}`,
      })),
    },
  };

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="pl" georgianPath="/horoskopi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Start
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Horoskop dzienny</span>
        </nav>

        <header className="mb-8 border-b border-border pb-6">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {today}
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Horoskop <Accent>na dziś</Accent>
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Praktyczna prognoza tranzytów planetarnych dla wszystkich 12 znaków
            zodiaku na dzisiejszy dzień. Wybierz swój znak, aby poznać
            szczegóły.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-px overflow-hidden rounded-md border border-border bg-border sm:w-fit">
          {[
            {
              href: "/horoskopi",
              label: "Dzienny",
              active: true,
            },
            { href: "/horoskopi/kvireuli", label: "Tygodniowy" },
            { href: "/horoskopi/tviuri", label: "Miesięczny" },
            { href: "/siyvarulis-horoskopi", label: "Miłosny" },
            { href: "/finansuri-horoskopi", label: "Finansowy" },
            { href: "/mtvaris-kalendari", label: "Kalendarz księżycowy" },
            { href: "/retrograduli-merkuri", label: "Retrogradacja Merkurego" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.active
                  ? "bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground sm:text-sm"
                  : "bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <PopularTools
            locale="pl"
            placement="horoscope_before_signs"
            publicEntry
          />
        </div>

        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((slug) => {
            const content = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--primary)";
            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                className="group flex flex-col justify-between bg-card p-5 transition-colors duration-150 hover:bg-secondary/40"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="grid size-11 shrink-0 place-items-center rounded-sm border border-border bg-background text-xl"
                      style={{ color: accent }}
                    >
                      {content.symbol}
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground group-hover:text-primary">
                        {meta?.labelPl ?? slug}
                      </h2>
                      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {ZODIAC_DATES_PL[slug] ?? ZODIAC_DATES[slug].rangeEn}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                    {SIGN_SUMMARY_PL[slug]}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                  <span>Pełny horoskop</span>
                  <span aria-hidden>→</span>
                </div>
              </Link>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Często zadawane pytania
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {FAQ_PL.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="font-mono text-muted-foreground transition-transform group-open:rotate-45">
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

        <div className="mt-14 rounded-md border border-border bg-card p-7 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                OSOBISTY HOROSKOP URODZENIOWY
              </p>
              <h2 className="font-display mt-2 text-balance text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
                Twój znak Słońca to dopiero początek
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Osobista prognoza astrologiczna uwzględnia Twój Księżyc,
                ascendent, domy i wszystkie planety w kosmogramie. Oblicz swój
                pełny horoskop za darmo.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/nataluri-ruka">
                Oblicz mój kosmogram
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}
