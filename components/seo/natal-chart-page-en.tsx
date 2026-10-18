import { EnglishLink as Link } from "@/components/i18n/international-link";

import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Accent } from "@/components/en/editorial";

const SITE_URL = "https://www.vividaastro.com";
const PAGE_URL = `${SITE_URL}/natal-chart`;

const FAQ = [
  {
    q: "What is a natal chart?",
    a: "A natal chart, or birth chart, maps the sky at the exact moment you were born. It shows each planet's zodiac sign, house, and major connections to other planets.",
  },
  {
    q: "Is the birth chart calculator free?",
    a: "Yes. Enter your birth date, time, and city to calculate your placements for free without registering. A free account unlocks personal interpretations and AI insights.",
  },
  {
    q: "Do I need my exact birth time?",
    a: "Most planetary signs can be calculated without an exact time. Your rising sign and the 12 houses change throughout the day, so an accurate birth time makes those parts much more reliable.",
  },
  {
    q: "What information do I need?",
    a: "You need your birth date, birth time if known, and birth city. Vivida automatically resolves the city's coordinates and historical time zone.",
  },
];

export function NatalChartPageEn() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Free Birth Chart Calculator, Vivida",
      url: PAGE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Birth chart",
          item: PAGE_URL,
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
      <SmartHeader locale="en" georgianPath="/nataluri-ruka" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="border-b border-border pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            NATAL CHART EPHEMERIS · FREE CALCULATOR
          </p>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Free <Accent>birth chart</Accent> calculator
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Enter your birth date, time, and place to calculate your planets,
            rising sign, 12 houses, and major aspects — free, with no
            registration required.
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator locale="en" />
        </div>

        <article className="mt-16 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              What is a birth chart?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              A birth chart is a precise picture of the sky at the moment you
              were born. It places the Sun, Moon, planets, and sensitive points
              within the 12 zodiac signs and 12 astrological houses. Together,
              these layers describe temperament, emotional patterns,
              relationships, motivation, and the areas of life that receive the
              most emphasis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              How to read your chart
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">Planets</strong> describe
                what is acting: identity, emotions, communication, love, drive,
                growth, and responsibility.
              </li>
              <li>
                <strong className="text-foreground">Signs</strong> describe how
                each planet expresses itself.
              </li>
              <li>
                <strong className="text-foreground">Houses</strong> show where
                in life that energy is most active, from identity and money to
                relationships and career.
              </li>
              <li>
                <strong className="text-foreground">Aspects</strong> show how
                planets cooperate, intensify one another, or create productive
                tension.
              </li>
            </ul>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/85">
              The calculator gives you the complete placement data.{" "}
              <Link
                href="/signup"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create a free account
              </Link>{" "}
              for personal interpretations and AI analysis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Why birth time matters
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Your rising sign and houses depend on the local horizon at the
              moment of birth and can change quickly. If you do not know your
              exact time, Vivida can still calculate most planetary signs using
              noon, but the rising sign and house placements should be treated
              as uncertain.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              After the chart: your changing sky
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Your natal chart stays fixed, while the planets keep moving. Those
              current movements are called transits. Explore the{" "}
              <Link
                href="/horoscope"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                daily horoscope
              </Link>{" "}
              to see how today&apos;s sky changes the tone around each zodiac
              sign.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Frequently asked questions
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
              Related guides
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {[
                { href: "/zodiac", label: "Zodiac signs" },
                { href: "/compatibility", label: "Compatibility" },
                { href: "/horoscope", label: "Daily horoscope" },
                { href: "/tests", label: "Personality tests" },
              ].map((item, idx) => (
                <span key={item.href} className="inline-flex items-center gap-3">
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
      <SiteFooter locale="en" />
    </main>
  );
}
