import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Accent } from "@/components/en/editorial";
import { Calendar, Sparkles } from "lucide-react";

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
/**
 * Ruling planets are stored in Georgian on SIGNS, like element and modality.
 * The page title promises "Elements, Modalities and Rulers", so the sign
 * cards carry all three.
 */
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
    a: "Every sign belongs to one of four elements—Fire, Earth, Air, or Water—and one of three modalities—Cardinal, Fixed, or Mutable. Together they describe a sign's basic style and rhythm.",
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
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <SmartHeader locale="en" georgianPath="/zodiac" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Astrology guide
        </div>
        <h1 className="font-display mb-4 text-balance text-3xl font-medium tracking-tight sm:text-5xl">
          The 12 <Accent>zodiac signs</Accent>
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Explore every zodiac sign—dates, symbols, elements, modalities,
          personality patterns, relationships, and the deeper layers behind your
          Sun sign.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="mystic" size="lg">
            <Link href="/zodiac/datit">
              <Calendar className="size-4" />
              Find my zodiac sign
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/natal-chart">
              <Sparkles className="size-4" />
              Calculate my birth chart
            </Link>
          </Button>
        </div>

        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
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

        <h2 className="font-display mb-5 mt-16 text-2xl font-medium tracking-tight sm:text-3xl">
          All zodiac signs
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {ALL_SLUGS.map((slug) => {
            const content = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 sm:p-5"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  }}
                />
                <div
                  className="relative text-3xl sm:text-4xl"
                  style={{ color: accent }}
                >
                  {content.symbol}
                </div>
                <div className="relative mt-2 text-base font-semibold sm:text-lg">
                  {meta?.labelEn ?? slug}
                </div>
                <div className="relative mt-0.5 text-xs text-muted-foreground">
                  {ZODIAC_DATES[slug].rangeEn}
                </div>
                <div className="relative mt-2 text-xs text-muted-foreground/80">
                  {ELEMENT_EN[content.element] ?? content.element} ·{" "}
                  {MODALITY_EN[content.modality] ?? content.modality}
                </div>
                {meta?.ruler && (
                  <div className="relative mt-0.5 text-xs text-muted-foreground/70">
                    Ruler: {RULER_EN[meta.ruler] ?? meta.ruler}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <article className="mt-16 grid gap-8 lg:grid-cols-3">
          <section>
            <h2 className="font-display text-2xl font-medium tracking-tight">
              What is the zodiac?
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/85">
              In Western tropical astrology, the zodiac begins at the March
              equinox with Aries and follows the changing seasonal cycle. The
              twelve signs provide a symbolic language for describing
              temperament and expression.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Four elements
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/85">
              Fire signs act through inspiration, Earth through practicality,
              Air through ideas and connection, and Water through feeling and
              intuition. Most charts contain a personal mixture of all four.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Three modalities
            </h2>
            <p className="mt-3 leading-relaxed text-foreground/85">
              Cardinal signs initiate, Fixed signs stabilize, and Mutable signs
              adapt. Each season begins, peaks, and transitions through this
              repeating rhythm.
            </p>
          </section>
        </article>

        <section className="mt-16">
          <h2 className="font-display mb-5 text-2xl font-medium tracking-tight sm:text-3xl">
            Explore deeper
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                // /zodiac/tavsebadoba 308s to /compatibility on the English
                // hosts (ENGLISH_LEGACY_CONTENT_REDIRECTS) — link the
                // destination directly rather than spending a hop.
                href: "/compatibility",
                eyebrow: "Compatibility",
                title: "Every zodiac pairing",
                body: "Explore love compatibility across all 78 unique sign combinations.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:bg-card/80"
              >
                <div className="relative text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {card.eyebrow}
                </div>
                <h3 className="relative mt-1 text-xl font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/85">
                  {card.body}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-display mb-5 text-2xl font-medium tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"
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

        <ReportPromo className="mt-16" />
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="font-display text-balance text-2xl font-medium tracking-tight sm:text-3xl">
            Your zodiac sign is only one part of the chart
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Discover your Moon, rising sign, 12 houses, planets, and aspects in
            one interactive birth chart.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Calculate my chart for free</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
