import Link from "next/link";
import type { Metadata } from "next";

import { PopularSearches } from "@/components/seo/popular-searches";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { RANKINGS_HUB_EN, RankingsHubEn } from "@/components/seo/rankings-en";
import { RANKINGS_HUB_AM, RankingsHubAm } from "@/components/seo/rankings-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
import {
  RANKING_CATEGORIES,
  RANKING_CATEGORY_ORDER,
  RANKING_TOPICS,
} from "@/lib/seo/rankings";

const SITE_URL = "https://www.vivida.ge";

const KA_METADATA: Metadata = {
  title: { absolute: "ზოდიაქოს ნიშნების რეიტინგები — ყველაზე ჭკვიანი, ეჭვიანი, თავსებადი" },
  description:
    "ზოდიაქოს ნიშნების რეიტინგები: ყველაზე ჭკვიანი, ეჭვიანი, რომანტიული, ერთგული, ძლიერი და სხვა. 12-ვე ნიშანი დალაგებული თვისებების მიხედვით, ქართულად.",
  alternates: localizedAlternates("/zodiac/reitingebi", "/zodiac/reitingebi", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/zodiac/reitingebi`,
    title: "ზოდიაქოს ნიშნების რეიტინგები",
    description:
      "ყველაზე ჭკვიანი, ეჭვიანი, რომანტიული, ძლიერი ნიშნები — 12-ვე ნიშანი დალაგებული თვისებების მიხედვით.",
    siteName: "Vivida",
    locale: "ka_GE",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "am") {
    const path = "/zodiac/reitingebi";
    const { title, description } = RANKINGS_HUB_AM;
    return {
      title: { absolute: `${title} — Vivida` },
      description,
      keywords: [
        "կենդանակերպի վարկանիշներ",
        "ամենախելացի նշանները",
        "ամենառոմանտիկ նշանները",
        "կենդանակերպի նշաններ",
      ],
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${path}`,
        title,
        description,
        siteName: "Vivida",
        locale: "hy_AM",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  if (locale === "en") {
    const path = "/zodiac/reitingebi"; const { title, description } = RANKINGS_HUB_EN;
    return { title: { absolute: title }, description, keywords: ["zodiac sign rankings", "best zodiac signs", "smartest zodiac signs", "most romantic zodiac signs"], alternates: localizedAlternates(path, path, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title, description, siteName: "Vivida", locale: "en_US" }, twitter: { card: "summary_large_image", title, description } };
  }
  return KA_METADATA;
}

const HUB_QUERIES = [
  "ზოდიაქოს ნიშნების რეიტინგი",
  "ყველაზე თავსებადი ზოდიაქოს ნიშნები",
  "ყველაზე ჭკვიანი ზოდიაქოს ნიშნები",
  "ყველაზე ეჭვიანი ნიშნები",
  "საუკეთესო ზოდიაქოს ნიშნები",
  "ზოდიაქოს ნიშნების დახასიათება",
];

export default async function RankingsHubPage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <RankingsHubAm />;
  if (locale === "en") return <RankingsHubEn />;
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
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ზოდიაქოს ნიშნების რეიტინგები",
    numberOfItems: RANKING_TOPICS.length,
    itemListElement: RANKING_TOPICS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.titleKa,
      url: `${SITE_URL}/zodiac/reitingebi/${t.slug}`,
    })),
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">რეიტინგები</span>
        </nav>

        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          ზოდიაქოს ნიშნების{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            რეიტინგები
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-base text-foreground/80 sm:text-lg">
          ყველაზე ჭკვიანი, ეჭვიანი, რომანტიული თუ ძლიერი — ნახე, სად დგას შენი
          ნიშანი. თითო რეიტინგში 12-ვე ნიშანი დალაგებულია თვისების მიხედვით,
          ახსნით.
        </p>

        {RANKING_CATEGORY_ORDER.map((cat) => {
          const topics = RANKING_TOPICS.filter((t) => t.category === cat);
          if (topics.length === 0) return null;
          return (
            <section key={cat} className="mt-12">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {RANKING_CATEGORIES[cat]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/zodiac/reitingebi/${t.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/80 sm:p-5"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/10 text-2xl ring-1 ring-[var(--vivida-violet)]/20">
                      {t.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold tracking-tight text-foreground">
                        {t.shortKa}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {t.titleKa}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-14">
          <ReportPromo />
        </div>

        <PopularSearches queries={HUB_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
