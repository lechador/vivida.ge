import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_HOROSCOPE_VIEWS,
  VIEW_PATH,
  anchorForView,
  type HoroscopeView,
} from "@/lib/sign-horoscope";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import { ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { internationalPublicPath } from "@/lib/seo/public-paths";

export const VIEW_LABEL_EN: Record<HoroscopeView, string> = {
  today: "Today's horoscope",
  tomorrow: "Tomorrow's horoscope",
  week: "This week's horoscope",
  month: "This month's horoscope",
  nextWeek: "Next week's horoscope",
  nextMonth: "Next month's horoscope",
};

function dateLabel(view: HoroscopeView, now = new Date()): string {
  const date = anchorForView(view, now);
  if (view === "today" || view === "tomorrow")
    return new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  if (view === "week" || view === "nextWeek")
    return `Week of ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" }).format(date)}`;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function signHoroscopeSeoEn(
  name: string,
  view: HoroscopeView,
  now = new Date(),
) {
  const period = dateLabel(view, now);
  const phrase =
    view === "today"
      ? "Horoscope Today"
      : view === "tomorrow"
        ? "Horoscope Tomorrow"
        : view === "week"
          ? "Weekly Horoscope"
          : view === "month"
            ? "Monthly Horoscope"
            : view === "nextWeek"
              ? "Horoscope Next Week"
              : "Horoscope Next Month";
  const horizon =
    view === "today"
      ? "today"
      : view === "tomorrow"
        ? "tomorrow"
        : view === "week"
          ? "this week"
          : view === "month"
            ? "this month"
            : view === "nextWeek"
              ? "next week"
              : "next month";

  return {
    period,
    horizon,
    heading: `${name} ${phrase}`,
    title: `${name} ${phrase} — ${period}`,
    description: `${name} horoscope ${horizon}: practical astrology guidance for love, relationships, career, priorities, and personal growth for ${period}.`,
  };
}

function forecast(sign: ZodiacSlug, view: HoroscopeView) {
  const profile = ZODIAC_SIGN_EN[sign];
  const horizon =
    view === "today"
      ? "today"
      : view === "tomorrow"
        ? "tomorrow"
        : view === "week"
          ? "this week"
          : view === "nextWeek"
            ? "next week"
            : view === "month"
              ? "this month"
              : "next month";
  const headline =
    view === "today" || view === "tomorrow"
      ? "Choose direction before speed"
      : "Build momentum around what matters most";
  return {
    headline,
    summary: `For ${horizon}, your strongest results come from using your natural gifts without letting familiar pressure patterns take control.`,
    paragraphs: [
      `${profile.core} ${horizon[0].toUpperCase() + horizon.slice(1)}, notice where this familiar style helps you move forward—and where a more flexible response would create a better result.`,
      `In relationships, ${profile.love} Keep the conversation grounded in what is happening now instead of reacting to an old expectation.`,
      `For work and practical decisions, ${profile.career} Select one priority that can produce visible progress, and let consistency carry more weight than intensity.`,
    ],
    sectionTitles: [
      `Overview for ${horizon}`,
      `Love and relationships ${horizon}`,
      `Career and priorities ${horizon}`,
    ],
    themes: ["Clear priorities", "Honest connection", "Sustainable progress"],
  };
}

export function SignHoroscopePageEn({
  sign,
  view,
}: {
  sign: ZodiacSlug;
  view: HoroscopeView;
}) {
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelEn;
  const accent = signColor(meta);
  const reading = forecast(sign, view);
  const label = VIEW_LABEL_EN[view];
  const seo = signHoroscopeSeoEn(name, view);
  const period = seo.period;
  const internalPath = `/zodiac/${sign}/${VIEW_PATH[view]}`;
  const publicPath = internationalPublicPath(internalPath);
  const url = `https://www.vividaastro.com${publicPath}`;
  const faq = [
    { q: `What can ${name} expect ${seo.horizon}?`, a: reading.summary },
    { q: `Should I read my ${name} Sun sign or rising sign?`, a: "Start with your Sun sign, then read your rising sign for another perspective on timing and life areas. A personal forecast uses the complete birth chart." },
    { q: "Is this horoscope a guaranteed prediction?", a: "No. A Sun-sign horoscope offers general themes and reflection prompts. Your choices, circumstances, complete birth chart, and exact transits all matter." },
  ];
  const ld = [
    articleLd({ url, headline: seo.heading, description: seo.description, datePublished: "2026-08-13T00:00:00Z", dateModified: new Date().toISOString(), about: { "@type": "Thing", name: seo.heading } }),
    breadcrumbLd([{ name: "Home", url: "https://www.vividaastro.com" }, { name: "Zodiac signs", url: "https://www.vividaastro.com/zodiac" }, { name, url: `https://www.vividaastro.com/zodiac/${sign}` }, { name: seo.heading, url }]),
    faqLd(faq),
  ];

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="en" georgianPath={internalPath} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            Zodiac signs
          </Link>
          <span>/</span>
          <Link href={`/zodiac/${sign}`} className="hover:text-foreground">
            {name}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{label}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex items-start gap-5 sm:gap-6">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl sm:size-20 sm:text-5xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                color: accent,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Calendar className="size-3.5" />
                {period}
              </div>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {seo.heading}
              </h1>
              <p
                className="mt-3 text-pretty text-base sm:text-lg"
                style={{ color: accent }}
              >
                {reading.headline}
              </p>
              <p className="mt-2 text-pretty text-sm text-foreground/85 sm:text-base">
                {reading.summary}
              </p>
            </div>
          </div>
        </article>

        <section className="mt-10 max-w-2xl space-y-8 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {reading.paragraphs.map((paragraph, index) => (
            <div key={paragraph}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {reading.sectionTitles[index]}
              </h2>
              <p className="mt-3">{paragraph}</p>
            </div>
          ))}
        </section>
        <section className="mt-8">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Key themes
          </div>
          <ul className="flex flex-wrap gap-2">
            {reading.themes.map((theme) => (
              <li
                key={theme}
                className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
                style={{
                  borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                  background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                  color: accent,
                }}
              >
                {theme}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            More {name} horoscopes
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_HOROSCOPE_VIEWS.filter((item) => item !== view).map((item) => (
              <Link
                key={item}
                href={internationalPublicPath(`/zodiac/${sign}/${VIEW_PATH[item]}`)}
                className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
              >
                {VIEW_LABEL_EN[item]}
              </Link>
            ))}
            <Link
              href={`/zodiac/${sign}`}
              className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
            >
              Complete {name} profile
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label} for other signs
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((slug) => slug !== sign).map((slug) => {
              const other = signMetaBySlug(slug)!;
              return (
                <Link
                  key={slug}
                  href={internationalPublicPath(`/zodiac/${slug}/${VIEW_PATH[view]}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{SIGNS_CONTENT[slug].symbol}</span>
                  {other.labelEn}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <div className="mt-5 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/78">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Your personal horoscope goes beyond the Sun sign
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Your complete birth chart includes your Moon, Venus, Mars, rising
            sign, and all 12 houses.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Calculate my complete chart</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
