import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularTools } from "@/components/nav/popular-tools";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { MundaneSkySection } from "@/components/seo/mundane-sky-section";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { VIEW_PATH, signHoroscopePeriodLabel } from "@/lib/sign-horoscope";
import { genitiveKa } from "@/lib/georgian";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { HoroscopeHubEn } from "@/components/seo/horoscope-hub-en";

import { internationalPublicPath } from "@/lib/seo/public-paths";

const SITE_URL = "https://www.vivida.ge";

export const revalidate = 3600;

const TITLE = "ჰოროსკოპი, დღის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის";
const DESCRIPTION =
  "დღის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის, ვერძი, კურო, ტყუპები, კირჩხიბი, ლომი, ქალწული, სასწორი, მორიელი, მშვილდოსანი, თხის რქა, მერწყული, თევზები. დღევანდელი, ხვალინდელი, კვირისა და თვის ჰოროსკოპი რეალურ ტრანზიტებზე დაყრდნობით, ქართულად.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const title = en ? "Daily Horoscope Today, All Zodiac Signs" : TITLE;
  const description = en
    ? "Read today's horoscope for every zodiac sign, with practical guidance based on the current sky. Explore daily, weekly, and monthly astrology forecasts."
    : DESCRIPTION;
  return {
    title: { absolute: title },
    description,
    keywords: en
      ? [
          "daily horoscope",
          "today horoscope",
          "zodiac horoscope",
          "weekly horoscope",
          "monthly horoscope",
          "horoscope today",
        ]
      : [
          "ჰოროსკოპი",
          "დღის ჰოროსკოპი",
          "ჰოროსკოპი დღის",
          "დღევანდელი ჰოროსკოპი",
          "ხვალინდელი ჰოროსკოპი",
          "კვირის ჰოროსკოპი",
          "თვის ჰოროსკოპი",
          "ჰოროსკოპი თვის",
          "ზოდიაქოს ნიშნები",
          "ზოდიაქოს ნიშანი ჰოროსკოპი",
          "ჰოროსკოპი ქართულად",
          "horoskopi",
          "dgis horoskopi",
          "dghis horoskopi",
          "horoskopi qartulad",
          "zodiaqos nishnebi",
        ],
    alternates: localizedAlternates(
      "/horoskopi",
      "/horoskopi",
      en ? "en" : "ka",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: en
        ? `https://www.vividaastro.com${internationalPublicPath("/horoskopi")}`
        : `${SITE_URL}/horoskopi`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const FAQ = [
  {
    q: "როგორ დგება დღის ჰოროსკოპი?",
    a: "Vivida-ს დღის ჰოროსკოპი რეალურ ასტრონომიულ ტრანზიტებზე დგება, ვანგარიშობთ პლანეტების ზუსტ მდებარეობას (მთვარე, მზე, მერკური, ვენერა, მარსი და სხვები) და დღის მთავარ ასპექტებს, შემდეგ კი თითოეული ზოდიაქოს ნიშნისთვის ვწერთ კონკრეტულ, პრაქტიკულ რჩევას ქართულად.",
  },
  {
    q: "სად ვნახო ხვალინდელი ჰოროსკოპი?",
    a: "თითოეული ნიშნის გვერდზე დღევანდელთან ერთად ხვალინდელი ჰოროსკოპიც გელოდება, აირჩიე შენი ნიშანი ქვემოთ და გადაერთე „ხვალ“-ზე.",
  },
  {
    q: "რით განსხვავდება კვირის და თვის ჰოროსკოპი დღიურისგან?",
    a: "დღის ჰოროსკოპი სწრაფ ფონს ჰყვება (განსაკუთრებით მთვარის მოძრაობას), კვირის ჰოროსკოპი უფრო დიდ ტალღებს, თვის ჰოროსკოპი კი თვის მთავარ ციკლებს, ახალმთვარეობას, სავსემთვარეობას და ნელი პლანეტების გადასვლებს.",
  },
  {
    q: "ჰოროსკოპი უფასოა?",
    a: "დიახ, დღის, კვირისა და თვის ჰოროსკოპი ყველა ნიშნისთვის სრულიად უფასოა. პერსონალური, შენს დაბადების მონაცემებზე მორგებული ჰოროსკოპისთვის კი შექმენი უფასო ნატალური რუკა Vivida-ზე.",
  },
];

export default async function HoroskopiHubPage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <HoroscopeHubEn />;
  const now = new Date();
  const todayLabel = signHoroscopePeriodLabel(now, "day");

  const horoscopes = await Promise.all(
    ALL_SLUGS.map(async (slug) => ({
      slug,
      row: await ensureSignHoroscope(slug, "day", now),
    })),
  );

  const ld = [
    articleLd({
      url: `${SITE_URL}/horoskopi`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: now.toISOString(),
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ჰოროსკოპი", url: `${SITE_URL}/horoskopi` },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: horoscopes.map(({ slug }, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/zodiac/${slug}/${VIEW_PATH.today}`,
        name: SIGNS_CONTENT[slug].labelKa,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <Starfield count={48} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ჰოროსკოპი</span>
        </nav>

        <header className="mb-8 border-b border-border pb-6">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {todayLabel}
          </div>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            დღევანდელი <span className="text-primary">ჰოროსკოპი</span>
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            ცის დღევანდელი ფონი ყველა 12 ნიშნისთვის — კონკრეტული, ცოცხალი ენით,
            ქართულად. დააჭირე ნიშანს სრული ჰოროსკოპის სანახავად.
          </p>
        </header>

        {/* Segmented Period & Topic Navigation */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-px overflow-hidden rounded-md border border-border bg-border sm:w-fit">
            <span className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground sm:text-sm">
              დღიური
            </span>
            <Link
              href="/horoskopi/kvireuli"
              className="bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
            >
              კვირის
            </Link>
            <Link
              href="/horoskopi/tviuri"
              className="bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
            >
              თვის
            </Link>
            <Link
              href="/siyvarulis-horoskopi"
              className="bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
            >
              სიყვარულის
            </Link>
            <Link
              href="/finansuri-horoskopi"
              className="bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
            >
              ფინანსური
            </Link>
            <Link
              href="/karieris-horoskopi"
              className="bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:text-sm"
            >
              კარიერის
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60">
              ალმანახი:
            </span>
            <Link href="/astrologiuri-kalendari" className="hover:text-foreground hover:underline">
              ასტროლოგიური კალენდარი
            </Link>
            <span aria-hidden>·</span>
            <Link href="/ighbliani-dgheebi" className="hover:text-foreground hover:underline">
              იღბლიანი დღეები
            </Link>
            <span aria-hidden>·</span>
            <Link href="/savse-mtvare" className="hover:text-foreground hover:underline">
              სავსე და ახალი მთვარე
            </Link>
            <span aria-hidden>·</span>
            <Link href="/dabnelebebi" className="hover:text-foreground hover:underline">
              დაბნელებები
            </Link>
            <span aria-hidden>·</span>
            <Link href="/merkuri-retrogradi" className="hover:text-foreground hover:underline">
              მერკური რეტროგრადში
            </Link>
            <span aria-hidden>·</span>
            <Link href="/mtvaris-kalendari" className="hover:text-foreground hover:underline">
              მთვარის კალენდარი
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <PopularTools placement="horoscope_before_signs" publicEntry />
        </div>

        {/* 12 Zodiac Sign Almanac Hairline Grid */}
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {horoscopes.map(({ slug, row }) => {
            const sc = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--primary)";
            const dates = ZODIAC_DATES[slug];
            const summary =
              row?.summary ?? "ჰოროსკოპი მზადდება, სცადე ცოტა ხანში.";

            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                className="group flex flex-col justify-between bg-card p-5 transition-colors duration-150 hover:bg-secondary/40"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="grid size-11 shrink-0 place-items-center rounded-sm border border-border bg-background text-xl"
                      style={{ color: accent }}
                    >
                      {sc.symbol}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
                        {sc.labelKa}
                      </h2>
                      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {dates.rangeKa}
                      </div>
                    </div>
                  </div>
                  {row?.headline && (
                    <p className="mt-3.5 text-sm font-medium text-primary">
                      {row.headline}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                    {summary}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                  <span>სრული ჰოროსკოპი</span>
                  <span aria-hidden>→</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Today's real sky, the transits this horoscope is built on. */}
        <MundaneSkySection date={now} />

        {/* Per-sign quick links, daily + tomorrow, keyword-rich anchors. */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            ჰოროსკოპი ზოდიაქოს ნიშნების მიხედვით
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            აირჩიე შენი ნიშანი — დღევანდელი და ხვალინდელი ჰოროსკოპი ცალ-ცალკე
            გვერდებზე.
          </p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((slug) => {
              const sc = SIGNS_CONTENT[slug];
              return (
                <div
                  key={slug}
                  className="flex items-center justify-between gap-2 bg-card px-4 py-3 text-sm"
                >
                  <Link
                    href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                    className="min-w-0 truncate font-medium text-foreground/90 hover:text-primary hover:underline"
                  >
                    {genitiveKa(sc.labelKa)} ჰოროსკოპი
                  </Link>
                  <Link
                    href={`/zodiac/${slug}/${VIEW_PATH.tomorrow}`}
                    className="shrink-0 font-mono text-xs text-primary hover:underline"
                  >
                    ხვალ →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            ხშირად დასმული კითხვები
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

        {/* CTA */}
        <div className="mt-14 rounded-md border border-border bg-card p-7 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                პერსონალური ასტროლოგია
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                მზის ნიშანი მხოლოდ დასაწყისია
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                ნამდვილი ჰოროსკოპი მთლიან ნატალურ რუკას უყურებს — მთვარე, ვენერა,
                მარსი და ცის 12 სახლი. Vivida უფასოდ ანგარიშობს ყველაფერს.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/signup">
                ჩემი სრული რუკა
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
