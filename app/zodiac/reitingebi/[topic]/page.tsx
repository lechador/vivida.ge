import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PopularSearches } from "@/components/seo/popular-searches";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ensureSignRanking } from "@/actions/sign-ranking";
import {
  ALL_RANKING_SLUGS,
  RANKING_TOPICS,
  rankingQueries,
  rankingTopicBySlug,
} from "@/lib/seo/rankings";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { RankingTopicPageEn } from "@/components/seo/rankings-en";
import { RankingTopicPageAm } from "@/components/seo/rankings-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { rankingTopicEnBySlug } from "@/lib/seo/rankings-en";
import { rankingTopicAmBySlug } from "@/lib/seo/rankings-am";
import { englishSiteHref, armenianSiteHref, DEFAULT_OG_IMAGE, ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

// Evergreen — the ranking is cached in Postgres; re-render the page chrome
// weekly. The AI cost is paid once per topic (then on promptVersion bumps).
export const revalidate = 604800;

export function generateStaticParams() {
  return ALL_RANKING_SLUGS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: slug } = await params;
  const locale = await getRequestLocale();
  if (locale === "am") {
    const topic = rankingTopicAmBySlug(slug);
    if (!topic) return {};
    const description = `${topic.title}. Կենդանակերպի բոլոր 12 նշանները՝ ըստ «${topic.trait}» հատկանիշի:`;
    const path = `/zodiac/reitingebi/${slug}`;
    return {
      title: { absolute: `${topic.title} — Vivida` },
      description,
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        type: "article",
        url: armenianSiteHref(path, false),
        title: topic.title,
        description,
        siteName: "Vivida",
        locale: "hy_AM",
        images: [DEFAULT_OG_IMAGE],
      },
      twitter: { card: "summary_large_image", title: topic.title, description },
    };
  }
  if (locale === "en") {
    const topic = rankingTopicEnBySlug(slug); if (!topic) return {};
    const description = `${topic.title}: all 12 Sun signs compared through ${topic.trait}, with an explanation for every placement.`;
    const path = `/zodiac/reitingebi/${slug}`;
    const ogEn = `${ENGLISH_SITE_URL}/api/og/page?t=${encodeURIComponent(topic.title)}&k=${encodeURIComponent("Ranking")}&a=${encodeURIComponent("#eac358")}`;
    return { title: { absolute: topic.title }, description, alternates: localizedAlternates(path, path, "en"), openGraph: { type: "article", url: englishSiteHref(path, false), title: topic.title, description, siteName: "Vivida", locale: "en_US", images: [{ url: ogEn, width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title: topic.title, description, images: [ogEn] } };
  }
  const topic = rankingTopicBySlug(slug);
  if (!topic) return {};
  const url = `${SITE_URL}/zodiac/reitingebi/${slug}`;
  const title = topic.titleKa;
  const description = `${topic.titleKa} — 12-ვე ნიშნის სრული რეიტინგი, თითოეულზე ახსნა. ნახე, რომელი ნიშანი დგას პირველ ადგილზე და რატომ.`;
  const og = `${SITE_URL}/api/og/page?t=${encodeURIComponent(title)}&k=${encodeURIComponent("რეიტინგი")}&a=${encodeURIComponent("#eac358")}`;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(`/zodiac/reitingebi/${slug}`, `/zodiac/reitingebi/${slug}`, "ka"),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function RankingTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const locale = await getRequestLocale();
  if (locale === "am") {
    const topic = rankingTopicAmBySlug(slug);
    if (!topic) notFound();
    return <RankingTopicPageAm topic={topic} />;
  }
  if (locale === "en") { const topic = rankingTopicEnBySlug(slug); if (!topic) notFound(); return <RankingTopicPageEn topic={topic} />; }
  const topic = rankingTopicBySlug(slug);
  if (!topic) notFound();

  const ranking = await ensureSignRanking(slug);

  // Graceful fallback if generation hasn't run yet: list all 12 signs in
  // canonical order without blurbs, so the page is still valid + linked.
  const items =
    ranking?.items && ranking.items.length === ALL_SLUGS.length
      ? ranking.items
      : ALL_SLUGS.map((s, i) => ({ slug: s, rank: i + 1, blurb: "" }));
  const headline = ranking?.headline ?? topic.titleKa;
  const intro =
    ranking?.intro ??
    `${topic.titleKa}. ქვემოთ ნახავ 12-ვე ნიშანს ${topic.shortKa} თვისების მიხედვით დალაგებულს.`;
  const faq = ranking?.faq ?? [];
  const queries = rankingQueries(topic);

  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: topic.titleKa,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: sorted.length,
    itemListElement: sorted.map((it) => ({
      "@type": "ListItem",
      position: it.rank,
      name: SIGNS_CONTENT[it.slug as ZodiacSlug]?.labelKa ?? it.slug,
      url: `${SITE_URL}/zodiac/${it.slug}`,
    })),
  };

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ცის ნიშნები", item: `${SITE_URL}/zodiac` },
      {
        "@type": "ListItem",
        position: 2,
        name: "რეიტინგები",
        item: `${SITE_URL}/zodiac/reitingebi`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: topic.shortKa,
        item: `${SITE_URL}/zodiac/reitingebi/${slug}`,
      },
    ],
  };

  const related = RANKING_TOPICS.filter((t) => t.slug !== slug).slice(0, 8);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
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
          <Link href="/zodiac/reitingebi" className="hover:text-foreground">
            რეიტინგები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{topic.shortKa}</span>
        </nav>

        {/* Hero */}
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)/0.3,transparent_70%)] opacity-40 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[var(--vivida-violet)]/12 text-5xl ring-1 ring-[var(--vivida-violet)]/30">
              {topic.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ზოდიაქოს რეიტინგი
              </div>
              <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                {topic.titleKa}
              </h1>
              {headline !== topic.titleKa && (
                <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                  {headline}
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Intro */}
        <p className="mt-8 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {intro}
        </p>

        {/* Ranking */}
        <ol className="mt-10 space-y-3">
          {sorted.map((it) => {
            const sc = SIGNS_CONTENT[it.slug as ZodiacSlug];
            const meta = signMetaBySlug(it.slug as ZodiacSlug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            const top = it.rank <= 3;
            return (
              <li key={it.slug}>
                <Link
                  href={`/zodiac/${it.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/80 sm:gap-5 sm:p-5"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-bold tabular-nums sm:size-12 sm:text-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} ${top ? 22 : 14}%, transparent)`,
                      color: accent,
                      boxShadow: top
                        ? `inset 0 0 0 1px color-mix(in oklch, ${accent} 40%, transparent)`
                        : undefined,
                    }}
                  >
                    {it.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: accent }} aria-hidden>
                        {sc?.symbol}
                      </span>
                      <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        {sc?.labelKa ?? it.slug}
                      </h2>
                    </div>
                    {it.blurb && (
                      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
                        {it.blurb}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              ხშირად დასმული კითხვები
            </h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
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
        )}

        {/* Report CTA */}
        <div className="mt-14">
          <ReportPromo />
        </div>

        {/* Related rankings */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა რეიტინგები
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((t) => (
              <Link
                key={t.slug}
                href={`/zodiac/reitingebi/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                <span aria-hidden>{t.emoji}</span>
                {t.shortKa}
              </Link>
            ))}
          </div>
        </section>

        <PopularSearches queries={queries} />
      </section>

      <SiteFooter />
    </main>
  );
}
