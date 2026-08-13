import Link from "next/link";

import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";

const SITE_URL = "https://vividaastro.com";
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
      name: "Free Birth Chart Calculator — Vivida",
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
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={150} shooting={3} />
      <SmartHeader locale="en" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Free{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              birth chart
            </span>{" "}
            calculator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-foreground/80 sm:text-lg">
            Enter your birth date, time, and place to calculate your planets,
            rising sign, 12 houses, and major aspects—free, with no registration
            required.
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator locale="en" />
        </div>

        <article className="mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
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
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
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
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                Create a free account
              </Link>{" "}
              for personal interpretations and AI analysis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
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

          <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              After the chart: your changing sky
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Your natal chart stays fixed, while the planets keep moving. Those
              current movements are called transits. Explore the{" "}
              <Link
                href="/horoskopi"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                daily horoscope
              </Link>{" "}
              to see how today&apos;s sky changes the tone around each zodiac
              sign.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-5 space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl open:bg-card/80 sm:p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      ✦
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-2">
            {[
              { href: "/zodiac", label: "Zodiac signs" },
              { href: "/zodiac/tavsebadoba", label: "Compatibility" },
              { href: "/horoskopi", label: "Daily horoscope" },
              { href: "/tests", label: "Personality tests" },
              { href: "/numerologia", label: "Numerology" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                {item.label}
              </Link>
            ))}
          </section>
        </article>

        <PopularSearches
          queries={[
            "free birth chart",
            "natal chart calculator",
            "astrology birth chart",
            "calculate rising sign",
            "birth chart houses",
          ]}
        />
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
