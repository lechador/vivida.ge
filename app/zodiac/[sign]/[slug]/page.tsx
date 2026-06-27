import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_YEARLY_YEARS,
  SIGNS_CONTENT,
  paragraphs,
  yearlyContentFor,
  type YearlyContent,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { yearlyPageLatinQueries } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import {
  anchorForView,
  periodForView,
  signHoroscopePeriodLabel,
  viewFromPath,
} from "@/lib/sign-horoscope";
import { HoroscopeView } from "./horoscope-view";

const SITE_URL = "https://www.vivida.ge";

/**
 * `[slug]` is a polymorphic segment so we don't have two parallel
 * dynamic params at the same depth (Next.js prohibits). It matches:
 *   - 4-digit year ("2026")             → yearly horoscope (static, prebuilt)
 *   - "dghes" / "kviris-horoskopi" /    → period horoscope (ISR, AI-generated)
 *     "tvis-horoskopi"
 * Anything else → notFound().
 */

type Params = { sign: string; slug: string };

/**
 * Horoscope (day/week/month) pages refresh hourly. The underlying
 * (sign, period, periodKey) row is cached in Postgres so the typical
 * request only re-renders the page chrome; the AI cost is paid once
 * per period rollover.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const out: { sign: string; slug: string }[] = [];
  for (const year of ALL_YEARLY_YEARS) {
    for (const sign of ALL_SLUGS) {
      if (yearlyContentFor(sign, year)) {
        out.push({ sign, slug: String(year) });
      }
    }
  }
  return out;
}

function isSlug(s: string): s is ZodiacSlug {
  return (ALL_SLUGS as string[]).includes(s);
}

function parseYear(s: string): number | null {
  if (!/^\d{4}$/.test(s)) return null;
  const y = Number(s);
  return Number.isFinite(y) ? y : null;
}

const VIEW_TITLE_KA = {
  today: "დღევანდელი ჰოროსკოპი",
  tomorrow: "ხვალინდელი ჰოროსკოპი",
  week: "ამ კვირის ჰოროსკოპი",
  month: "ამ თვის ჰოროსკოპი",
  nextWeek: "მომავალი კვირის ჰოროსკოპი",
  nextMonth: "მომავალი თვის ჰოროსკოპი",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sign, slug } = await params;
  if (!isSlug(sign)) return {};

  const view = viewFromPath(slug);
  if (view) {
    const sc = SIGNS_CONTENT[sign];
    const url = `${SITE_URL}/zodiac/${sign}/${slug}`;
    const anchor = anchorForView(view);
    const periodLabel = signHoroscopePeriodLabel(anchor, periodForView(view));
    const title = `${sc.labelKa} — ${VIEW_TITLE_KA[view]}`;
    const description = `${sc.labelKa}-ის ${VIEW_TITLE_KA[view]} (${periodLabel}). ცის ფონი, კონკრეტული რჩევა და ნიშნისთვის გასაღები მომენტები.`;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        siteName: "Vivida",
        locale: "ka_GE",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const yearNum = parseYear(slug);
  if (yearNum == null) return {};
  const c = yearlyContentFor(sign, yearNum);
  if (!c) return {};
  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    alternates: { canonical: `${SITE_URL}/zodiac/${sign}/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/zodiac/${sign}/${slug}`,
      title: c.pageTitle,
      description: c.metaDescription,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title: c.pageTitle,
      description: c.metaDescription,
    },
  };
}

export default async function ZodiacSignSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sign, slug } = await params;
  if (!isSlug(sign)) notFound();

  const view = viewFromPath(slug);
  if (view) {
    return <HoroscopeView sign={sign} view={view} />;
  }

  const yearNum = parseYear(slug);
  if (yearNum == null) notFound();
  const c = yearlyContentFor(sign, yearNum);
  if (!c) notFound();
  const year = slug;

  const sc = SIGNS_CONTENT[sign];
  const meta = signMetaBySlug(sign);
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";
  const dates = ZODIAC_DATES[sign];
  const latinQueries = yearlyPageLatinQueries(sign, yearNum);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.pageTitle,
    description: c.metaDescription,
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/zodiac/${sign}/${year}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    about: {
      "@type": "Thing",
      name: `${c.labelKa} ${yearNum}`,
      alternateName: latinQueries,
    },
    datePublished: `${yearNum}-01-01`,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ცის ნიშნები",
        item: `${SITE_URL}/zodiac`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: c.labelKa,
        item: `${SITE_URL}/zodiac/${sign}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${yearNum} წლიური ჰოროსკოპი`,
        item: `${SITE_URL}/zodiac/${sign}/${year}`,
      },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <Link href={`/zodiac/${sign}`} className="hover:text-foreground">
            {c.labelKa}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{yearNum}</span>
        </nav>

        {/* Hero */}
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
              className="grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent), 0 0 60px -12px ${accent}`,
                color: accent,
              }}
            >
              {sc.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                წლიური ჰოროსკოპი · {yearNum} · {dates.rangeKa}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {c.labelKa} — {yearNum} წლის ჰოროსკოპი
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {c.tagline}
              </p>
            </div>
          </div>
        </article>

        {/* Overview */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.overview).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {/* Months strip */}
        {(c.bestMonths.length > 0 || c.hardMonths.length > 0) && (
          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.bestMonths.length > 0 && (
              <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  ხელსაყრელი თვეები
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {c.bestMonths.map((m, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
                      style={{
                        borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                        background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                        color: accent,
                      }}
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </article>
            )}
            {c.hardMonths.length > 0 && (
              <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  გამომწვევი თვეები
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {c.hardMonths.map((m, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-foreground/85"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </section>
        )}

        <YearlySection title={c.love.title} body={c.love.body} />
        <YearlySection title={c.career.title} body={c.career.body} />
        <YearlySection title={c.money.title} body={c.money.body} />
        <YearlySection title={c.health.title} body={c.health.body} />
        <YearlySection title={c.growth.title} body={c.growth.body} />

        {/* Key dates */}
        {c.keyDates.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              მნიშვნელოვანი თარიღები {yearNum}-ში
            </h2>
            <ul className="space-y-3">
              {c.keyDates.map((kd, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      color: accent,
                    }}
                    aria-hidden
                  >
                    <Calendar className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                      {kd.date}
                    </div>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-foreground/85">
                      {kd.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Advice */}
        <section className="mt-14 max-w-3xl rounded-2xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            წლის რჩევა
          </div>
          <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {c.advice}
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    ✦
                  </span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            წლიური ჰოროსკოპი მზის ნიშანზე საუბრობს
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            სრული წლის სცენარი ნატალურ რუკაშია — მთვარე, ვენერა, მარსი და ცის
            12 სახლი. Vivida უფასოდ აერთიანებს ყველაფერს.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი სრული რუკა</Link>
          </Button>
        </div>

        {/* Other signs same year */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ნიშნების {yearNum} ჰოროსკოპი
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((s) => s !== sign).map((s) => {
              const other = SIGNS_CONTENT[s];
              const otherMeta = signMetaBySlug(s);
              const otherAccent = otherMeta
                ? signColor(otherMeta)
                : "var(--vivida-violet)";
              const has = !!yearlyContentFor(s, yearNum);
              if (!has) return null;
              return (
                <Link
                  key={s}
                  href={`/zodiac/${s}/${year}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span style={{ color: otherAccent }}>{other.symbol}</span>
                  {other.labelKa}
                </Link>
              );
            })}
          </div>
        </section>

        <PopularSearches queries={latinQueries} />
      </section>

      <SiteFooter />
    </main>
  );
}

function YearlySection({ title, body }: YearlyContent["love"]) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
        {paragraphs(body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
