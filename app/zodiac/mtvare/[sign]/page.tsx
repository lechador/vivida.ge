import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { MOONS_CONTENT, paragraphs } from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ZodiacPlacementPageEn } from "@/components/seo/zodiac-placement-page-en";

import { placementEnglish } from "@/lib/zodiac-placement-en";

import {
  DEFAULT_OG_IMAGE,
  englishSiteHref,
  localizedAlternates,
} from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const HUB_PATH = "/zodiac/mtvare";

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
  if (!isSlug(sign) || !MOONS_CONTENT) return {};
  const locale = await getRequestLocale();
  if (locale === "en") {
    const c = placementEnglish("moon", sign);
    const url = englishSiteHref(`${HUB_PATH}/${sign}`, false);
    return {
      title: { absolute: c.title },
      description: c.description,
      alternates: localizedAlternates(
        `${HUB_PATH}/${sign}`,
        `${HUB_PATH}/${sign}`,
        "en",
      ),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url,
        title: c.title,
        description: c.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: c.title,
        description: c.description,
      },
    };
  }
  const c = MOONS_CONTENT[sign];
  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    alternates: localizedAlternates(
      `${HUB_PATH}/${sign}`,
      `${HUB_PATH}/${sign}`,
      "ka",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article",
      url: `${SITE_URL}${HUB_PATH}/${sign}`,
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

export default async function MoonSignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sign } = await params;
  if (!isSlug(sign)) notFound();
  const locale = await getRequestLocale();
  if (locale === "en") return <ZodiacPlacementPageEn kind="moon" sign={sign} />;
  if (!MOONS_CONTENT) notFound();
  const moons = MOONS_CONTENT;
  const c = moons[sign];
  const meta = signMetaBySlug(sign);
  const accent = meta ? signColor(meta) : "var(--vivida-violet)";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.pageTitle,
    description: c.metaDescription,
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${HUB_PATH}/${sign}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
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
        name: "მთვარის ნიშანი",
        item: `${SITE_URL}${HUB_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `მთვარე ${c.labelKa}-ში`,
        item: `${SITE_URL}${HUB_PATH}/${sign}`,
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
          <Link href={HUB_PATH} className="hover:text-foreground">
            მთვარის ნიშანი
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
              className="relative grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent), 0 0 60px -12px ${accent}`,
                color: accent,
              }}
            >
              {c.symbol}
              <span
                aria-hidden
                className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full border border-border bg-card/95 text-foreground/70 backdrop-blur-xl"
              >
                <Moon className="size-4" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                მთვარის ნიშანი
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                მთვარე {c.labelKa}-ში
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {c.tagline}
              </p>
            </div>
          </div>
        </article>

        {/* Intro */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <Section title="ემოციური ბირთვი">
          {paragraphs(c.emotionalCore).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section title={`მთვარე ${c.labelKa}-ში სიყვარულში`}>
          {paragraphs(c.love).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section title="ჩრდილოვანი მხარე">
          {paragraphs(c.shadow).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section title="თავსებადობა მთვარის ნიშნებში">
          {paragraphs(c.compatibility).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Famous */}
        {c.famous && c.famous.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              ცნობილი ადამიანები ამ მთვარის ნიშნით
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

        {/* Cross-links */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/zodiac/${sign}`}
            className="group rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              მზის ნიშანი
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {c.labelKa} — მზე
            </div>
            <p className="mt-1 text-pretty text-sm text-foreground/80">
              ნახე ამავე ნიშნის მზის ინტერპრეტაცია.
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
              {c.labelKa} — ასცენდენტი
            </div>
            <p className="mt-1 text-pretty text-sm text-foreground/80">
              როგორც ნიღაბი — როგორ გაჩვენებს სამყაროს.
            </p>
          </Link>
        </section>

        {/* Other moon signs */}
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა მთვარის ნიშნები
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((s) => s !== sign).map((s) => {
              const other = moons[s];
              const otherMeta = signMetaBySlug(s);
              const otherAccent = otherMeta
                ? signColor(otherMeta)
                : "var(--vivida-violet)";
              return (
                <Link
                  key={s}
                  href={`${HUB_PATH}/${s}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span style={{ color: otherAccent }}>{other.symbol}</span>
                  მთვარე {other.labelKa}-ში
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
            დარწმუნდი, რომ მთვარე ნამდვილად {c.labelKa}-შია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            მთვარე ცაში ~2.5 დღეში ცვლის ნიშანს — ზუსტი დაბადების დროა საჭირო.
            Vivida ერთ წუთში გითხრის.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/nataluri-ruka">გაიგე ჩემი მთვარის ნიშანი</Link>
          </Button>
        </div>

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
