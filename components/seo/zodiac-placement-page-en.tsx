import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Moon, Sparkles, Sunrise } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import {
  placementEnglish,
  type PlacementKind,
} from "@/lib/zodiac-placement-en";
import { serializeLd } from "@/lib/seo/jsonld";
import { englishSiteHref } from "@/lib/seo/locales";

export function ZodiacPlacementPageEn({
  kind,
  sign,
}: {
  kind: PlacementKind;
  sign: ZodiacSlug;
}) {
  const path = kind === "moon" ? "/zodiac/mtvare" : "/zodiac/amomavali";
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelEn;
  const copy = placementEnglish(kind, sign);
  const accent = signColor(meta);
  const Icon = kind === "moon" ? Moon : Sunrise;
  const pageName = kind === "moon" ? `Moon in ${name}` : `${name} rising`;
  const hubName = kind === "moon" ? "Moon signs" : "Rising signs";
  const faq = [
    { q: `What does ${pageName} mean?`, a: copy.intro },
    {
      q: `How do I know if I have ${pageName}?`,
      a: `Calculate a natal chart with your birth date, birthplace, and exact birth time. ${kind === "rising" ? "The Ascendant changes quickly, so birth-time accuracy is especially important." : "The Moon changes signs every two to three days, and time matters near a sign change."}`,
    },
    {
      q: `Is ${pageName} the same as a Sun sign?`,
      a: `No. The Sun represents conscious identity and direction. The ${kind === "moon" ? "Moon describes emotional needs and instinctive reactions" : "Ascendant describes your approach, first impressions, and the structure of the chart houses"}.`,
    },
  ];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: copy.title,
      description: copy.description,
      inLanguage: "en",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": englishSiteHref(`${path}/${sign}`, false),
      },
      author: { "@type": "Organization", name: "Vivida" },
      publisher: { "@type": "Organization", name: "Vivida" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
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
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="en" georgianPath={`${path}/${sign}`} />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeLd(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            Zodiac signs
          </Link>
          <span>/</span>
          <Link href={path} className="hover:text-foreground">
            {hubName}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{name}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="relative grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                color: accent,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
              <span
                aria-hidden
                className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full border border-border bg-card/95 text-foreground/70"
              >
                <Icon className="size-4" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {kind === "moon" ? "Moon sign" : "Rising sign · Ascendant"}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {pageName}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {copy.tagline}
              </p>
            </div>
          </div>
        </article>

        <p className="mt-12 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {copy.intro}
        </p>
        {copy.sections.map((section) => (
          <section key={section.title} className="mt-12 max-w-3xl">
            <h2 className="font-display mb-3 text-2xl font-medium tracking-tight sm:text-3xl">
              {section.title}
            </h2>
            <p className="text-pretty text-base leading-relaxed text-foreground/90">
              {section.body}
            </p>
          </section>
        ))}

        {copy.famous && copy.famous.length > 0 && (
          <section className="mt-12 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Famous People with {pageName}
            </h2>
            <div className="flex flex-wrap gap-2">
              {copy.famous.map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground/90"
                >
                  ✦ {person}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 max-w-3xl">
          <h2 className="font-display mb-5 text-2xl font-medium tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {(copy.faq?.length ? copy.faq : faq).map((item) => (
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

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/zodiac/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Sun sign
            </div>
            <div className="mt-1 text-lg font-semibold">{name} Sun</div>
            <p className="mt-1 text-sm text-foreground/80">
              Explore identity, motivation, traits, love, and work.
            </p>
          </Link>
          <Link
            href={`${kind === "moon" ? "/zodiac/amomavali" : "/zodiac/mtvare"}/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {kind === "moon" ? "Rising sign" : "Moon sign"}
            </div>
            <div className="mt-1 text-lg font-semibold">
              {kind === "moon" ? `${name} rising` : `Moon in ${name}`}
            </div>
            <p className="mt-1 text-sm text-foreground/80">
              {kind === "moon"
                ? "Explore first impressions and outward style."
                : "Explore emotional needs and inner reactions."}
            </p>
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Other {hubName.toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((slug) => slug !== sign).map((slug) => {
              const other = signMetaBySlug(slug)!;
              return (
                <Link
                  key={slug}
                  href={`${path}/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{SIGNS_CONTENT[slug].symbol}</span>
                  {kind === "moon"
                    ? `Moon in ${other.labelEn}`
                    : `${other.labelEn} rising`}
                </Link>
              );
            })}
          </div>
        </section>

        <ReportPromo className="mt-16" />
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="font-display text-balance text-2xl font-medium tracking-tight sm:text-3xl">
            Confirm your {kind === "moon" ? "Moon" : "rising"} sign
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Calculate your complete chart from your birth date, exact time, and
            place.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Calculate my birth chart</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
