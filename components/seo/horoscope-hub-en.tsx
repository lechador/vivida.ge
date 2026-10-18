import { EnglishLink as Link } from "@/components/i18n/international-link";
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
import { internationalPublicPath } from "@/lib/seo/public-paths";
import { serializeLd } from "@/lib/seo/jsonld";

const SIGN_SUMMARY: Record<string, string> = {
  aries:
    "Move with purpose today, but leave enough space to hear what others are actually asking for.",
  taurus:
    "Steady progress matters more than speed. Protect your energy and invest it in what can truly last.",
  gemini:
    "A conversation can unlock the next step. Ask the direct question and stay curious about the answer.",
  cancer:
    "Your emotional radar is sharp today. Use it to set a clear boundary rather than carrying every mood around you.",
  leo: "Visibility brings opportunity when it is paired with generosity. Let confidence make room for collaboration.",
  virgo:
    "A practical adjustment can simplify the whole day. Focus on the one detail that improves everything downstream.",
  libra:
    "Balance does not mean avoiding a choice. Name what matters to you and let the relationship respond honestly.",
  scorpio:
    "Intensity becomes useful when it has a direction. Put your focus into one meaningful task or conversation.",
  sagittarius:
    "A wider perspective is available, but the next move still needs a concrete plan. Turn inspiration into action.",
  capricorn:
    "Structure supports you today. Define the priority, protect the time, and let consistent effort do the work.",
  aquarius:
    "A fresh idea deserves testing. Share it with someone who will challenge it constructively rather than simply agree.",
  pisces:
    "Sensitivity is information, not an instruction. Notice the feeling, then choose the response that serves you best.",
};

const FAQ = [
  {
    q: "How is a daily horoscope created?",
    a: "Vivida uses current planetary positions and major aspects to describe the day's tone for each Sun sign. A personal forecast goes further by comparing those transits with your complete birth chart.",
  },
  {
    q: "Where can I find tomorrow's horoscope?",
    a: "Open your zodiac sign and switch from today's reading to tomorrow's forecast.",
  },
  {
    q: "How are daily, weekly, and monthly horoscopes different?",
    a: "Daily readings respond to fast-moving influences, especially the Moon. Weekly and monthly forecasts focus on wider cycles and slower planetary changes.",
  },
  {
    q: "Is the horoscope free?",
    a: "Yes. Daily, weekly, and monthly sign horoscopes are free. You can also create a free birth chart for a more personal view.",
  },
];

export function HoroscopeHubEn() {
  const today = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Daily Horoscope for Every Zodiac Sign",
    url: "https://www.vividaastro.com/daily-horoscope",
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ALL_SLUGS.map((slug, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: signMetaBySlug(slug)?.labelEn ?? slug,
        url: `https://www.vividaastro.com${internationalPublicPath(`/zodiac/${slug}/${VIEW_PATH.today}`)}`,
      })),
    },
  };

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="en" georgianPath="/horoskopi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Horoscope</span>
        </nav>

        <header className="mb-8 border-b border-border pb-6">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {today}
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
            Today&apos;s <Accent>horoscope</Accent>
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            A practical snapshot of today&apos;s planetary transits for all 12
            zodiac signs. Choose your sign for a closer reading.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-px overflow-hidden rounded-md border border-border bg-border sm:w-fit">
          {[
            {
              href: "/daily-horoscope",
              label: "Daily",
              active: true,
            },
            { href: "/weekly-horoscope", label: "Weekly" },
            { href: "/monthly-horoscope", label: "Monthly" },
            { href: "/love-horoscope", label: "Love" },
            { href: "/money-horoscope", label: "Money" },
            { href: "/moon-calendar", label: "Moon calendar" },
            { href: "/mercury-retrograde", label: "Mercury retrograde" },
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
            locale="en"
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
                href={internationalPublicPath(
                  `/zodiac/${slug}/${VIEW_PATH.today}`,
                )}
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
                        {meta?.labelEn ?? slug}
                      </h2>
                      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {ZODIAC_DATES[slug].rangeEn}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                    {SIGN_SUMMARY[slug]}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground group-hover:text-foreground">
                  <span>Full horoscope</span>
                  <span aria-hidden>→</span>
                </div>
              </Link>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {FAQ.map((item) => (
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
                PERSONAL NATAL CHART
              </p>
              <h2 className="font-display mt-2 text-balance text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
                Your Sun sign is only the beginning
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                A personal forecast includes your Moon, rising sign, houses, and
                every natal planet. Calculate your complete chart for free.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/natal-chart">
                Calculate my birth chart
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
