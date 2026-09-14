import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_YEARLY_YEARS,
  SIGNS_CONTENT,
  paragraphs,
  slugByLabelKa,
  yearlyContentFor,
  type CompatibilityLevel,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  elementSlugForSign,
  pairSlug,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signPageLatinQueries } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import { ELEMENT_COLOR } from "@/lib/pdf/theme";
import { cn } from "@/lib/utils";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ZodiacSignPageEn } from "@/components/seo/zodiac-sign-page-en";
import { ZodiacSignPageAm } from "@/components/seo/zodiac-sign-page-am";
import { ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";
import { ZODIAC_SIGN_AM } from "@/lib/zodiac-sign-am";
import {
  ARMENIAN_SITE_URL,
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

type Params = { sign: string };

export async function generateStaticParams() {
  return ALL_SLUGS.map((sign) => ({ sign }));
}

function isSlug(s: string): s is ZodiacSlug {
  return (ALL_SLUGS as string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sign } = await params;
  if (!isSlug(sign)) return {};
  const c = SIGNS_CONTENT[sign];
  const meta = signMetaBySlug(sign);
  const locale = await getRequestLocale();
  const accent = (meta && ELEMENT_COLOR[meta.element]) || "#b884f2";

  if (locale === "am") {
    const signInfo = signMetaBySlug(sign);
    const name = signInfo?.labelAm || meta?.labelKa || sign;
    const amContent = ZODIAC_SIGN_AM[sign];
    const title = `${name} կենդանակերպի նշան. Ամսաթվեր, բնավորություն, սեր և համատեղելիություն`;
    const description = `${name} կենդանակերպի նշանի ուղեցույց. ${amContent.tagline} Բացահայտիր ամսաթվերը, բնավորության գծերը, ուժեղ կողմերը, մարտահրավերները, սերը, կարիերան և համատեղելիությունը:`;
    const path = `/am/zodiac/${sign}`;
    return {
      title: { absolute: `${title} — Vivida` },
      description,
      alternates: localizedAlternates(path, `/zodiac/${sign}`, "am"),
      openGraph: {
        type: "article",
        url: `${ARMENIAN_SITE_URL}/zodiac/${sign}`,
        title,
        description,
        siteName: "Vivida",
        locale: "hy_AM",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  if (locale === "en" && meta) {
    const name = meta.labelEn;
    const title = `${name} Zodiac Sign: Dates, Traits, Love and Compatibility`;
    const description = `${name} zodiac sign guide: ${ZODIAC_SIGN_EN[sign].tagline} Explore dates, personality traits, strengths, challenges, love, career, and compatibility.`;
    const ogEn = `${ENGLISH_SITE_URL}/api/og/page?t=${encodeURIComponent(name)}&k=${encodeURIComponent("Zodiac sign")}&a=${encodeURIComponent(accent)}`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(`/zodiac/${sign}`, `/zodiac/${sign}`, "en"),
      openGraph: {
        type: "article",
        url: `${ENGLISH_SITE_URL}/zodiac/${sign}`,
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
        images: [{ url: ogEn, width: 1200, height: 630 }],
      },
      twitter: { card: "summary_large_image", title, description, images: [ogEn] },
    };
  }
  const og = `${SITE_URL}/api/og/page?t=${encodeURIComponent(c.labelKa)}&k=${encodeURIComponent("ზოდიაქოს ნიშანი")}&a=${encodeURIComponent(accent)}`;
  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    alternates: localizedAlternates(`/zodiac/${sign}`, `/zodiac/${sign}`, "ka"),
    openGraph: {
      type: "article",
      url: `${SITE_URL}/zodiac/${sign}`,
      title: c.pageTitle,
      description: c.metaDescription,
      siteName: "Vivida",
      locale: "ka_GE",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.pageTitle,
      description: c.metaDescription,
      images: [og],
    },
  };
}

const LEVEL_COLOR: Record<CompatibilityLevel, string> = {
  ძლიერი: "oklch(0.78 0.18 305)",
  ჰარმონიული: "oklch(0.78 0.16 200)",
  გამომწვევი: "oklch(0.7 0.22 30)",
};

export default async function ZodiacSignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sign } = await params;
  if (!isSlug(sign)) notFound();
  const locale = await getRequestLocale();
  if (locale === "am") return <ZodiacSignPageAm sign={sign} />;
  if (locale === "en") return <ZodiacSignPageEn sign={sign} />;
  const c = SIGNS_CONTENT[sign];
  const meta = signMetaBySlug(sign);
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";
  const dates = ZODIAC_DATES[sign];
  const latinQueries = signPageLatinQueries(sign);
  const availableYears = ALL_YEARLY_YEARS.filter((y) =>
    yearlyContentFor(sign, y),
  );

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.pageTitle,
    description: c.metaDescription,
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/zodiac/${sign}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    about: {
      "@type": "Thing",
      name: c.labelKa,
      alternateName: latinQueries,
      description: `${c.labelKa} (${dates.rangeEn}) — ${c.tagline}`,
    },
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
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{c.labelKa}</span>
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
              {c.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {dates.rangeKa}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {c.labelKa}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {c.tagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link
                  href={`/zodiac/elementebi/${elementSlugForSign(sign)}`}
                  className="transition-opacity hover:opacity-80"
                >
                  <Pill label="ელემენტი" value={c.element} accent={accent} />
                </Link>
                <Pill label="მოდალურობა" value={c.modality} accent={accent} />
                <Pill label="მმართველი" value={c.ruler} accent={accent} />
              </div>
            </div>
          </div>
        </article>

        {/* Intro */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {/* Personality */}
        <Section title={`${c.labelKa}-ის ხასიათი`}>
          {paragraphs(c.personality).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Strengths × weaknesses */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              ძლიერი მხარეები
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {c.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: accent }}>✦</span>
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">
              გამოწვევები
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {c.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground/85">{w}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* Love */}
        <Section title={`${c.labelKa} სიყვარულში`}>
          {paragraphs(c.love).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Career */}
        <Section title={`${c.labelKa} კარიერაში`}>
          {paragraphs(c.career).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Compatibility */}
        <section className="mt-12">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              თავსებადობა სხვა ნიშნებთან
            </h2>
            <Link
              href="/zodiac/tavsebadoba"
              className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ყველა წყვილი →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.compatibility.map((entry, i) => {
              const lvlColor = LEVEL_COLOR[entry.level] ?? accent;
              const otherSlug = slugByLabelKa(entry.signKa);
              const pairHref = otherSlug
                ? `/zodiac/tavsebadoba/${pairSlug(sign, otherSlug)}`
                : null;
              const cardClass =
                "block rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all";
              const inner = (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight">
                      {entry.signKa}
                    </h3>
                    <span
                      className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        color: lvlColor,
                        borderColor: `color-mix(in oklch, ${lvlColor} 40%, transparent)`,
                        background: `color-mix(in oklch, ${lvlColor} 10%, transparent)`,
                      }}
                    >
                      {entry.level}
                    </span>
                  </div>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/85">
                    {entry.note}
                  </p>
                </>
              );
              return pairHref ? (
                <Link
                  key={i}
                  href={pairHref}
                  className={cn(
                    cardClass,
                    "hover:bg-card/80 hover:ring-foreground/15",
                  )}
                >
                  {inner}
                </Link>
              ) : (
                <article key={i} className={cardClass}>
                  {inner}
                </article>
              );
            })}
          </div>
        </section>

        {/* Famous */}
        {c.famous && c.famous.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              ცნობილი {c.labelKa}-ები
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {c.famous.map((person, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-sm text-foreground/85"
                >
                  {person}
                </li>
              ))}
            </ul>
          </section>
        )}

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

        {/* Go deeper — moon + rising for the same sign */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/zodiac/mtvare/${sign}`}
            className="group rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              მთვარის ნიშანი
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              მთვარე {c.labelKa}-ში
            </div>
            <p className="mt-1 text-pretty text-sm text-foreground/80">
              შენი ემოციური ბირთვი და შინაგანი სამყარო.
            </p>
          </Link>
          <Link
            href={`/zodiac/amomavali/${sign}`}
            className="group rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              ამომავალი ნიშანი
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {c.labelKa} ამომავალი
            </div>
            <p className="mt-1 text-pretty text-sm text-foreground/80">
              ნიღაბი, რომელსაც სამყარო ხედავს პირველად.
            </p>
          </Link>
        </section>

        {/* Yearly horoscope — only when content exists */}
        {availableYears.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {c.labelKa}-ის წლიური ჰოროსკოპი
            </h2>
            <div className="flex flex-wrap gap-3">
              {availableYears.map((y) => (
                <Link
                  key={y}
                  href={`/zodiac/${sign}/${y}`}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card/55 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15"
                >
                  <span
                    className="grid size-9 place-items-center rounded-xl text-base font-semibold"
                    style={{
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      color: accent,
                    }}
                  >
                    {y}
                  </span>
                  <span className="text-sm font-medium tracking-tight">
                    {y} წლის ჰოროსკოპი →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other signs nav */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ნიშნები
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((s) => s !== sign).map((s) => {
              const other = SIGNS_CONTENT[s];
              const otherMeta = signMetaBySlug(s);
              const otherAccent = otherMeta
                ? signColor(otherMeta)
                : "var(--vivida-violet)";
              return (
                <Link
                  key={s}
                  href={`/zodiac/${s}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80",
                  )}
                >
                  <span style={{ color: otherAccent }}>{other.symbol}</span>
                  {other.labelKa}
                </Link>
              );
            })}
          </div>
        </section>

        <ReportPromo className="mt-16" />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ეს მხოლოდ მზის ნიშანია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი სრული რუკა მთვარეს, ამომავალს და ცის 12 სახლს მოიცავს. Vivida
            უფასოდ ქმნის პერსონალურ ინტერპრეტაციას.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/nataluri-ruka">ჩემი სრული რუკა</Link>
          </Button>
        </div>

        <PopularSearches queries={latinQueries} />
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function Pill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
      style={{
        borderColor: `color-mix(in oklch, ${accent} 30%, transparent)`,
        background: `color-mix(in oklch, ${accent} 8%, transparent)`,
      }}
    >
      <span className="text-foreground/85">{value}</span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
