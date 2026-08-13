import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
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
import { VIEW_PATH } from "@/lib/sign-horoscope";

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
    url: "https://vividaastro.com/horoscope",
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ALL_SLUGS.map((slug, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: signMetaBySlug(slug)?.labelEn ?? slug,
        url: `https://vividaastro.com/zodiac/${slug}/${VIEW_PATH.today}`,
      })),
    },
  };

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Horoscope</span>
        </nav>
        <header className="mb-10 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {today}
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Today&apos;s{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              horoscope
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            A practical snapshot of today&apos;s energy for all 12 zodiac signs.
            Choose your sign for a closer reading.
          </p>
        </header>

        <div className="mb-10 flex flex-wrap gap-2">
          {[
            { href: "/horoskopi", label: "Daily horoscope", active: true },
            { href: "/horoskopi/kvireuli", label: "Weekly horoscope" },
            { href: "/horoskopi/tviuri", label: "Monthly horoscope" },
            { href: "/siyvarulis-horoskopi", label: "Love horoscope" },
            { href: "/finansuri-horoskopi", label: "Money horoscope" },
            { href: "/mtvaris-kalendari", label: "Moon calendar" },
            { href: "/merkuri-retrogradi", label: "Mercury retrograde" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.active
                  ? "rounded-full border border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15 px-4 py-1.5 text-sm"
                  : "rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((slug) => {
            const content = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20 hover:bg-card/80"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-36 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl"
                    style={{
                      color: accent,
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                    }}
                  >
                    {content.symbol}
                  </div>
                  <div>
                    <h2 className="font-semibold">{meta?.labelEn ?? slug}</h2>
                    <div className="text-[11px] text-muted-foreground">
                      {ZODIAC_DATES[slug].rangeEn}
                    </div>
                  </div>
                </div>
                <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                  {SIGN_SUMMARY[slug]}
                </p>
                <div className="relative mt-3 text-xs text-muted-foreground group-hover:text-foreground">
                  Full horoscope →
                </div>
              </Link>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
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

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Your Sun sign is only the beginning
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            A personal forecast includes your Moon, rising sign, houses, and
            every natal planet. Calculate your complete chart for free.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/nataluri-ruka">Calculate my birth chart</Link>
          </Button>
        </div>
        <PopularSearches
          queries={[
            "daily horoscope",
            "today horoscope",
            "zodiac horoscope",
            "weekly horoscope",
            "monthly horoscope",
          ]}
        />
      </section>
      <SiteFooter />
    </main>
  );
}
