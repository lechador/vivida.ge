import { PolishLink as Link } from "@/components/i18n/international-link";

import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Accent } from "@/components/en/editorial";
import { jsonLdString } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vividaastro.com";
const PAGE_URL = `${SITE_URL}/pl/horoskop-urodzeniowy`;

const FAQ = [
  {
    q: "Czym jest horoskop urodzeniowy (kosmogram)?",
    a: "Horoskop urodzeniowy, powszechnie nazywany kosmogramem, to precyzyjna mapa nieba z dokładnego momentu i miejsca Twoich narodzin. Ukazuje rozmieszczenie Słońca, Księżyca oraz planet w 12 znakach zodiaku i 12 domach astrologicznych, a także kątowe relacje między nimi (aspekty).",
  },
  {
    q: "Czy ten darmowy kosmogram online wymaga rejestracji?",
    a: "Nie. Wystarczy podać datę, godzinę oraz miasto urodzenia, aby natychmiast i bez zakładania konta poznać pozycje planet, ascendent, domy i aspekty. Darmowe konto pozwala zapisać wykres i korzystać z osobistych interpretacji astrologa AI.",
  },
  {
    q: "Czy potrzebuję dokładnej godziny urodzenia?",
    a: "Pozycje większości planet (Słońce, Merkury, Wenus, Mars i dalsze) można precyzyjnie ustalić bez godziny. Jednak kalkulator ascendentu oraz wierzchołki 12 domów astrologicznych zmieniają się co kilka minut. Dokładna godzina z metryki urodzenia gwarantuje stuprocentową rzetelność tych elementów.",
  },
  {
    q: "Jakie dane są potrzebne do obliczenia kosmogramu?",
    a: "Potrzebujesz daty urodzenia, godziny (jeśli ją znasz) oraz miasta urodzenia. Nasz system automatycznie dopasuje współrzędne geograficzne oraz historyczną strefę czasową z uwzględnieniem czasu letniego.",
  },
  {
    q: "Czym są domy astrologiczne w horoskopie?",
    a: "12 domów astrologicznych reprezentuje różne sfery Twojego życia: od tożsamości (dom 1) i finansów (dom 2), przez relacje partnerskie (dom 7), po karierę i powołanie (dom 10). Znaki mówią 'jak' energia działa, a domy wskazują 'gdzie'.",
  },
];

export function NatalChartPagePl() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Darmowy Kosmogram Online i Horoskop Urodzeniowy, Vivida",
      url: PAGE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      inLanguage: "pl",
      offers: { "@type": "Offer", price: "0", priceCurrency: "PLN" },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
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
          item: `${SITE_URL}/pl`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Horoskop urodzeniowy",
          item: PAGE_URL,
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
      <SmartHeader locale="pl" georgianPath="/nataluri-ruka" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="border-b border-border pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            EFEMERYDY ASTRONOMICZNE · DARMOWY KOSMOGRAM ONLINE
          </p>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Darmowy <Accent>horoskop urodzeniowy</Accent> online
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Wprowadź datę, godzinę i miasto urodzenia, aby natychmiast poznać
            pozycje planet, kalkulator ascendentu, 12 domów astrologicznych i
            główne aspekty — za darmo, bez konieczności rejestracji.
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator locale="pl" />
        </div>

        <article className="mt-16 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Czym jest horoskop urodzeniowy i kosmogram?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              Horoskop urodzeniowy to unikalny zapis układu ciał niebieskich w
              chwili, w której przyszedłeś na świat. Przyporządkowuje Słońce,
              Księżyc i planety do 12 znaków zodiaku oraz 12 domów
              astrologicznych. Taka mapa opisuje Twój wrodzony potencjał, wzorce
              emocjonalne, sposób komunikacji, potrzeby w relacjach oraz życiowe
              powołanie.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Jak czytać swój kosmogram: 4 filary astrologii
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">Planety</strong>{" "}
                reprezentują konkretne siły psychiczne: tożsamość (Słońce),
                emocje (Księżyc), umysł (Merkury), miłość i wartości (Wenus),
                napęd i wolę (Mars).
              </li>
              <li>
                <strong className="text-foreground">Znaki zodiaku</strong>{" "}
                określają, w jaki sposób dana planeta się manifestuje (np. Mars
                w Baranie działa bezpośrednio, a w Wadze – dyplomatycznie).
              </li>
              <li>
                <strong className="text-foreground">
                  12 domów astrologicznych
                </strong>{" "}
                pokazuje, w których obszarach życia ta energia jest najbardziej
                aktywna: od pieniędzy po karierę i partnerstwo.
              </li>
              <li>
                <strong className="text-foreground">Aspekty</strong> to
                geometryczne kąty pomiędzy planetami, które tworzą harmonię,
                dynamikę lub twórcze napięcie.
              </li>
            </ul>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/85">
              Nasz kalkulator dostarcza pełne dane efemerydalne.{" "}
              <Link
                href="/signup"
                className="text-primary underline-offset-4 hover:underline"
              >
                Załóż darmowe konto
              </Link>{" "}
              aby odblokować osobiste interpretacje i głęboką analizę AI.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Kalkulator ascendentu: dlaczego godzina urodzenia ma znaczenie
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Ascendent to znak wschodzący na wschodnim horyzoncie w minucie
              Twoich narodzin. Wyznacza początek 1. domu i decyduje o Twoim
              zewnętrznym stylu bycia, pierwszym wrażeniu oraz filtrze, przez
              który odbierasz świat. Ponieważ Ziemia obraca się w ciągu doby o
              360°, ascendent zmienia znak średnio co dwie godziny. Znajomość
              dokładnej godziny urodzenia pozwala na precyzyjne ustalenie osi
              kosmogramu.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Co po kosmogramie: tranzyty planet i horoskop codzienny
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Twój horoskop urodzeniowy pozostaje niezmienny przez całe życie,
              lecz planety na niebie nieustannie się poruszają. Te bieżące
              przejścia to tranzyty. Odwiedź nasz{" "}
              <Link
                href="/pl/horoskop-dzienny"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                horoskop dzienny
              </Link>
              , aby sprawdzić, jak dzisiejsza pogoda kosmiczna współgra z Twoim
              znakiem.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Najczęściej zadawane pytania
            </h2>
            <div className="mt-5 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
              {FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="font-mono text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/85 sm:text-base">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-6">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Powiązane narzędzia i przewodniki
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {[
                { href: "/pl/znaki-zodiaku", label: "Znaki zodiaku" },
                {
                  href: "/pl/horoskop-partnerski",
                  label: "Horoskop partnerski",
                },
                { href: "/pl/horoskop-dzienny", label: "Horoskop dzienny" },
                { href: "/pl/tarot", label: "Tarot online" },
                { href: "/pl/tests", label: "Testy osobowości" },
              ].map((item, idx) => (
                <span
                  key={item.href}
                  className="inline-flex items-center gap-3"
                >
                  {idx > 0 && <span aria-hidden>·</span>}
                  <Link
                    href={item.href}
                    className="hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </div>
          </section>
        </article>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}
