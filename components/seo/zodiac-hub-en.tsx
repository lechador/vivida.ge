import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Accent } from "@/components/en/editorial";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};
const MODALITY_EN: Record<string, string> = {
  კარდინალური: "Cardinal",
  ფიქსირებული: "Fixed",
  მუტაბელური: "Mutable",
};
const RULER_EN: Record<string, string> = {
  მზე: "Sun",
  მთვარე: "Moon",
  მერკური: "Mercury",
  ვენერა: "Venus",
  მარსი: "Mars",
  იუპიტერი: "Jupiter",
  სატურნი: "Saturn",
  ურანი: "Uranus",
  ნეპტუნი: "Neptune",
  პლუტონი: "Pluto",
};

const FAQ = [
  {
    q: "What are the 12 zodiac signs?",
    a: "The tropical zodiac divides the Sun's apparent annual path into 12 signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.",
  },
  {
    q: "Is my zodiac sign the same as my Sun sign?",
    a: "Usually, yes. When people ask for your zodiac sign, they generally mean the sign occupied by the Sun on your birth date. A complete birth chart also includes your Moon, rising sign, planets, houses, and aspects.",
  },
  {
    q: "Why can zodiac dates vary by a day?",
    a: "The exact moment the Sun changes signs shifts slightly from year to year and depends on time zone. If you were born near a cusp, calculate your birth chart for the precise result.",
  },
  {
    q: "What are zodiac elements and modalities?",
    a: "Every sign belongs to one of four elements, Fire, Earth, Air, or Water, and one of three modalities, Cardinal, Fixed, or Mutable. Together they describe a sign's basic style and rhythm.",
  },
];

export function ZodiacHubEn() {
  const ld = [
    breadcrumbLd([
      { name: "Home", url: ENGLISH_SITE_URL },
      { name: "Zodiac", url: `${ENGLISH_SITE_URL}/zodiac` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "The 12 Zodiac Signs",
      description:
        "Explore all 12 zodiac signs, their dates, elements, modalities, and meanings.",
      url: "https://www.vividaastro.com/zodiac",
      inLanguage: "en",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((slug, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.vividaastro.com/zodiac/${slug}`,
          name: signMetaBySlug(slug)?.labelEn ?? slug,
        })),
      },
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
  ];

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="en" georgianPath="/zodiac" />
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
            ASTROLOGY GUIDE · ZODIAC ALMANAC
          </div>
          <h1 className="font-display mb-4 text-balance text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            The 12 <Accent>zodiac signs</Accent>
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            Explore every zodiac sign — dates, symbols, elements, modalities,
            personality patterns, relationships, and the deeper layers behind
            your Sun sign.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/zodiac/datit">
                <Calendar className="size-4" />
                Find my zodiac sign
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/natal-chart">
                Calculate my birth chart
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="mt-10 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          <p>
            The zodiac is a twelve-part map of the Sun&apos;s annual path
            through the sky. Your Sun sign describes a central part of your
            identity and vitality, but it is only one piece of your natal chart.
          </p>
          <p>
            Each sign combines an element and a modality. The element describes
            the kind of energy; the modality describes how that energy begins,
            sustains, or adapts. Select a sign below for its complete guide.
          </p>
        </div>

        <h2 className="font-display mb-4 mt-14 text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
          All zodiac signs
        </h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {ALL_SLUGS.map((slug) => {
            const content = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--primary)";
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
                      {ELEMENT_EN[content.element] ?? content.element}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
                    {meta?.labelEn ?? slug}
                  </div>
                  <div className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    {ZODIAC_DATES[slug].rangeEn}
                  </div>
                </div>
                <div className="mt-4 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                  {ELEMENT_EN[content.element] ?? content.element} ·{" "}
                  {MODALITY_EN[content.modality] ?? content.modality}
                  {meta?.ruler && (
                    <span> · {RULER_EN[meta.ruler] ?? meta.ruler}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <article className="mt-16 grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-3">
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              01 · FOUNDATION
            </p>
            <h2 className="font-display mt-2 text-2xl font-normal tracking-tight text-foreground">
              What is the zodiac?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              In Western tropical astrology, the zodiac begins at the March
              equinox with Aries and follows the changing seasonal cycle. The
              twelve signs provide a symbolic language for describing
              temperament and expression.
            </p>
          </section>
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              02 · ELEMENTS
            </p>
            <h2 className="font-display mt-2 text-2xl font-normal tracking-tight text-foreground">
              Four elements
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              Fire signs act through inspiration, Earth through practicality,
              Air through ideas and connection, and Water through feeling and
              intuition. Most charts contain a personal mixture of all four.
            </p>
          </section>
          <section className="bg-card p-6 sm:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              03 · MODALITIES
            </p>
            <h2 className="font-display mt-2 text-2xl font-normal tracking-tight text-foreground">
              Three modalities
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              Cardinal signs initiate, Fixed signs stabilize, and Mutable signs
              adapt. Each season begins, peaks, and transitions through this
              repeating rhythm.
            </p>
          </section>
        </article>

        <section className="mt-16">
          <h2 className="font-display mb-4 text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
            Explore deeper
          </h2>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/zodiac/mtvare",
                eyebrow: "Moon sign",
                title: "Your emotional core",
                body: "The inner needs and instincts beneath your Sun sign.",
              },
              {
                href: "/zodiac/amomavali",
                eyebrow: "Rising sign",
                title: "How you meet the world",
                body: "Your Ascendant shapes first impressions and outward style.",
              },
              {
                href: "/zodiac/elementebi",
                eyebrow: "Elements",
                title: "Fire · Earth · Air · Water",
                body: "See how the four elements shape every zodiac sign.",
              },
              {
                href: "/compatibility",
                eyebrow: "Compatibility",
                title: "Every zodiac pairing",
                body: "Explore love compatibility across all 78 unique sign combinations.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col justify-between bg-card p-6 transition-colors duration-150 hover:bg-secondary/40"
              >
                <div>
                  <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                    {card.eyebrow}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                </div>
                <span className="mt-4 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-display mb-4 text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
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

        <ReportPromo className="mt-16" />
        <div className="mt-16 rounded-md border border-border bg-card p-7 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                COMPLETE NATAL CHART
              </p>
              <h2 className="font-display mt-2 text-balance text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
                Your zodiac sign is only one part of the chart
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                Discover your Moon, rising sign, 12 houses, planets, and aspects
                in one interactive birth chart.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/natal-chart">
                Calculate my chart for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
