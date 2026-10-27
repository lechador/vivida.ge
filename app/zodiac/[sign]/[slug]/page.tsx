import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
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
import { genitiveKa } from "@/lib/georgian";
import { ELEMENT_COLOR } from "@/lib/pdf/theme";
import {
  articleLd as buildArticleLd,
  breadcrumbLd as buildBreadcrumbLd,
  faqLd as buildFaqLd,
  serializeLd,
} from "@/lib/seo/jsonld";
import { SIGN_LATIN_NAMES } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import {
  anchorForView,
  periodForView,
  signHoroscopePeriodLabel,
  viewFromPath,
} from "@/lib/sign-horoscope";
import { HoroscopeView } from "./horoscope-view";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  SignHoroscopePageEn,
  signHoroscopeSeoEn,
  VIEW_LABEL_EN,
} from "@/components/seo/sign-horoscope-page-en";
import { YearlyHoroscopePageEn } from "@/components/seo/yearly-horoscope-page-en";

import { yearlyHoroscopeEnglish } from "@/lib/yearly-horoscope-en";

import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { internationalPublicPath } from "@/lib/seo/public-paths";

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
  const locale = await getRequestLocale();
  const en = locale === "en";

  const view = viewFromPath(slug);
  if (view) {
    const sc = SIGNS_CONTENT[sign];
    const url = `${SITE_URL}/zodiac/${sign}/${slug}`;
    const anchor = anchorForView(view);
    const periodLabel = signHoroscopePeriodLabel(anchor, periodForView(view));
    // Lead with "<sign> ჰოროსკოპი", the exact shape of the query ("ვერძი
    // ჰოროსკოპი", "verdzi horoskopi"), then the view + live period label.
    const name = en ? (signMetaBySlug(sign)?.labelEn ?? sign) : sc.labelKa;
    const englishSeo = en ? signHoroscopeSeoEn(name, view) : null;
    const title = en
      ? englishSeo!.title
      : `${sc.labelKa} ჰოროსკოპი, ${VIEW_TITLE_KA[view]} (${periodLabel})`;
    const description = en
      ? englishSeo!.description
      : `${sc.labelKa}-ის ${VIEW_TITLE_KA[view]} (${periodLabel}). ცის ფონი, კონკრეტული რჩევა და ნიშნისთვის გასაღები მომენტები, რეალურ ტრანზიტებზე დაყრდნობით, ქართულად.`;
    return {
      title: { absolute: title },
      description,
      keywords: en
        ? [
            `${name} horoscope`,
            `${name} horoscope today`,
            VIEW_LABEL_EN[view],
            "daily horoscope",
          ]
        : [
            `${sc.labelKa} ჰოროსკოპი`,
            `${genitiveKa(sc.labelKa)} ჰოროსკოპი`,
            `${sc.labelKa} ${VIEW_TITLE_KA[view]}`,
            "ჰოროსკოპი",
            "დღის ჰოროსკოპი",
            "ზოდიაქოს ნიშნები",
            "horoskopi",
          ],
      alternates: localizedAlternates(
        `/zodiac/${sign}/${slug}`,
        `/zodiac/${sign}/${slug}`,
        en ? "en" : "ka",
      ),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url: en
          ? `https://www.vividaastro.com${internationalPublicPath(`/zodiac/${sign}/${slug}`)}`
          : url,
        title,
        description,
        siteName: "Vivida",
        locale: en ? "en_US" : "ka_GE",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const yearNum = parseYear(slug);
  if (yearNum == null) return {};
  const c = yearlyContentFor(sign, yearNum);
  if (!c) return {};
  const meta = signMetaBySlug(sign);
  const accentHex = (meta && ELEMENT_COLOR[meta.element]) || "#b884f2";
  if (en) {
    const english = yearlyHoroscopeEnglish(sign, yearNum);
    const nameEn = meta?.labelEn ?? sign;
    const url = `${ENGLISH_SITE_URL}/zodiac/${sign}/${slug}`;
    const ogEn = `${ENGLISH_SITE_URL}/api/og/page?t=${encodeURIComponent(`${nameEn} ${yearNum}`)}&k=${encodeURIComponent("Yearly Horoscope")}&a=${encodeURIComponent(accentHex)}`;
    return {
      title: { absolute: english.title },
      description: english.description,
      keywords: [
        `${nameEn} ${yearNum} horoscope`,
        `${nameEn} yearly horoscope ${yearNum}`,
        `${nameEn} ${yearNum} astrology`,
        `${nameEn} love career money ${yearNum}`,
      ],
      alternates: localizedAlternates(
        `/zodiac/${sign}/${slug}`,
        `/zodiac/${sign}/${slug}`,
        "en",
      ),
      openGraph: {
        images: [{ url: ogEn, width: 1200, height: 630 }],
        type: "article",
        url,
        title: english.title,
        description: english.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: english.title,
        description: english.description,
        images: [ogEn],
      },
    };
  }
  const og = `${SITE_URL}/api/og/page?t=${encodeURIComponent(`${c.labelKa} ${yearNum}`)}&k=${encodeURIComponent("წლიური ჰოროსკოპი")}&a=${encodeURIComponent(accentHex)}`;
  const genLabel = genitiveKa(c.labelKa);
  const latins = SIGN_LATIN_NAMES[sign] ?? [];
  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    keywords: [
      `${c.labelKa} ${yearNum}`,
      `${c.labelKa} ${yearNum} წლის ჰოროსკოპი`,
      `${genLabel} ${yearNum} წლის ჰოროსკოპი`,
      `${c.labelKa} წლიური ჰოროსკოპი ${yearNum}`,
      `${yearNum} წლის ჰოროსკოპი`,
      `${c.labelKa} სიყვარული კარიერა ფინანსები ${yearNum}`,
      ...latins.map((l) => `${l} ${yearNum} horoskopi`),
      ...latins.map((l) => `${l} ${yearNum}`),
    ],
    alternates: localizedAlternates(
      `/zodiac/${sign}/${slug}`,
      `/zodiac/${sign}/${slug}`,
      "ka",
    ),
    openGraph: {
      images: [{ url: og, width: 1200, height: 630 }],
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
      images: [og],
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
    const locale = await getRequestLocale();
    if (locale === "en") return <SignHoroscopePageEn sign={sign} view={view} />;
    return <HoroscopeView sign={sign} view={view} />;
  }

  const yearNum = parseYear(slug);
  if (yearNum == null) notFound();
  const c = yearlyContentFor(sign, yearNum);
  if (!c) notFound();
  const locale = await getRequestLocale();
  if (locale === "en")
    return <YearlyHoroscopePageEn sign={sign} year={yearNum} />;
  const year = slug;

  const sc = SIGNS_CONTENT[sign];
  const meta = signMetaBySlug(sign);
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";
  const accentHex = (meta && ELEMENT_COLOR[meta.element]) || "#b884f2";
  const dates = ZODIAC_DATES[sign];
  const availableYears = ALL_YEARLY_YEARS.filter((y) =>
    yearlyContentFor(sign, y),
  );
  const ogImage = `${SITE_URL}/api/og/page?t=${encodeURIComponent(`${c.labelKa} ${yearNum}`)}&k=${encodeURIComponent("წლიური ჰოროსკოპი")}&a=${encodeURIComponent(accentHex)}`;

  const articleJsonLd = buildArticleLd({
    headline: c.pageTitle,
    description: c.metaDescription,
    url: `${SITE_URL}/zodiac/${sign}/${year}`,
    datePublished: yearNum >= 2027 ? "2026-10-01" : `${yearNum}-01-01`,
    dateModified: "2026-10-27",
    image: ogImage,
    about: {
      "@type": "Thing",
      name: `${c.labelKa} — ${yearNum} წლის ჰოროსკოპი`,
    },
  });

  const faqJsonLd = buildFaqLd(c.faq);

  const breadcrumbJsonLd = buildBreadcrumbLd([
    { name: "მთავარი", url: SITE_URL },
    { name: "ცის ნიშნები", url: `${SITE_URL}/zodiac` },
    { name: c.labelKa, url: `${SITE_URL}/zodiac/${sign}` },
    {
      name: `${yearNum} წლის ჰოროსკოპი`,
      url: `${SITE_URL}/zodiac/${sign}/${year}`,
    },
  ]);

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
        dangerouslySetInnerHTML={{ __html: serializeLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(breadcrumbJsonLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Link href="/zodiac" className="hover:text-foreground">
              ცის ნიშნები
            </Link>
            <span>/</span>
            <Link href={`/zodiac/${sign}`} className="hover:text-foreground">
              {c.labelKa}
            </Link>
            <span>/</span>
            <span className="text-foreground/80">{yearNum} წლის ჰოროსკოპი</span>
          </nav>

          {availableYears.length > 1 && (
            <nav
              aria-label="წლების გადამრთველი"
              className="flex items-center gap-1.5"
            >
              {availableYears.map((y) => {
                const active = y === yearNum;
                return (
                  <Link
                    key={y}
                    href={`/zodiac/${sign}/${y}`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                        : "inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
                    }
                    style={
                      active
                        ? {
                            borderColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
                            background: `color-mix(in oklch, ${accent} 16%, transparent)`,
                            color: accent,
                          }
                        : undefined
                    }
                  >
                    {y} წელი
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

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
                {c.labelKa}, {yearNum} წლის ჰოროსკოპი
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
            სრული წლის სცენარი ნატალურ რუკაშია, მთვარე, ვენერა, მარსი და ცის 12
            სახლი. Vivida უფასოდ აერთიანებს ყველაფერს.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი სრული რუკა</Link>
          </Button>
        </div>

        <div className="mt-10">
          <ReportPromo />
        </div>

        {/* Same sign related horoscopes & almanac */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {c.labelKa} · სხვა ჰოროსკოპები და გზამკვლევები
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/zodiac/${sign}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              <span style={{ color: accent }}>{sc.symbol}</span>
              {c.labelKa} — ნიშნის დახასიათება
            </Link>
            {availableYears
              .filter((y) => y !== yearNum)
              .map((y) => (
                <Link
                  key={y}
                  href={`/zodiac/${sign}/${y}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  {c.labelKa} — {y} წლის ჰოროსკოპი
                </Link>
              ))}
            <Link
              href={`/zodiac/${sign}/dghes`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              დღის ჰოროსკოპი
            </Link>
            <Link
              href={`/zodiac/${sign}/kviris-horoskopi`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              კვირის ჰოროსკოპი
            </Link>
            <Link
              href={`/zodiac/${sign}/tvis-horoskopi`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              თვის ჰოროსკოპი
            </Link>
            <Link
              href={`/siyvarulis-horoskopi/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              სიყვარულის ჰოროსკოპი
            </Link>
            <Link
              href={`/finansuri-horoskopi/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ფინანსური ჰოროსკოპი
            </Link>
            <Link
              href={`/karieris-horoskopi/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              კარიერის ჰოროსკოპი
            </Link>
            <Link
              href={`/moon/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              მთვარე {c.labelKa}-ში
            </Link>
            <Link
              href={`/rising/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              {c.labelKa} ამომავალი
            </Link>
            <Link
              href="/dabnelebebi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              დაბნელებების კალენდარი
            </Link>
            <Link
              href="/merkuri-retrogradi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3.5 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              მერკური რეტროგრადში
            </Link>
          </div>
        </section>

        {/* Other signs same year */}
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ნიშნების {yearNum} წლის ჰოროსკოპი
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
