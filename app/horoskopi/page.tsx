import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularTools } from "@/components/nav/popular-tools";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { MundaneSkySection } from "@/components/seo/mundane-sky-section";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { VIEW_PATH, signHoroscopePeriodLabel } from "@/lib/sign-horoscope";
import { PopularSearches } from "@/components/seo/popular-searches";
import { genitiveKa } from "@/lib/georgian";
import { HOROSKOPI_HUB_LATIN_QUERIES } from "@/lib/seo/transliteration";
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

/**
 * Hub for the bare-keyword "ჰოროსკოპი" query. Grid of all 12 signs with
 * today's headline + summary; each card links to the dedicated daily
 * page for the sign. ISR'd hourly so the underlying cached horoscope
 * rows refresh in lockstep with their producers.
 */
export const revalidate = 3600;

const TITLE = "ჰოროსკოპი — დღის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის";
const DESCRIPTION =
  "დღის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის — ვერძი, კურო, ტყუპები, კირჩხიბი, ლომი, ქალწული, სასწორი, მორიელი, მშვილდოსანი, თხის რქა, მერწყული, თევზები. დღევანდელი, ხვალინდელი, კვირისა და თვის ჰოროსკოპი რეალურ ტრანზიტებზე დაყრდნობით, ქართულად.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const title = en ? "Daily Horoscope Today — All Zodiac Signs" : TITLE;
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
    // Same-path pair: this daily hub exists in both languages at /horoskopi,
    // exactly like its /kvireuli and /tviuri siblings. (It used to pass
    // "/en/horoscope" as the paired path, which on the English branch emitted
    // ka-GE -> vivida.ge/en/horoscope — an internal English path, on the
    // Georgian domain, that only 301s back here.)
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
    a: "Vivida-ს დღის ჰოროსკოპი რეალურ ასტრონომიულ ტრანზიტებზე დგება — ვანგარიშობთ პლანეტების ზუსტ მდებარეობას (მთვარე, მზე, მერკური, ვენერა, მარსი და სხვები) და დღის მთავარ ასპექტებს, შემდეგ კი თითოეული ზოდიაქოს ნიშნისთვის ვწერთ კონკრეტულ, პრაქტიკულ რჩევას ქართულად.",
  },
  {
    q: "სად ვნახო ხვალინდელი ჰოროსკოპი?",
    a: "თითოეული ნიშნის გვერდზე დღევანდელთან ერთად ხვალინდელი ჰოროსკოპიც გელოდება — აირჩიე შენი ნიშანი ქვემოთ და გადაერთე „ხვალ“-ზე.",
  },
  {
    q: "რით განსხვავდება კვირის და თვის ჰოროსკოპი დღიურისგან?",
    a: "დღის ჰოროსკოპი სწრაფ ფონს ჰყვება (განსაკუთრებით მთვარის მოძრაობას), კვირის ჰოროსკოპი უფრო დიდ ტალღებს, თვის ჰოროსკოპი კი თვის მთავარ ციკლებს — ახალმთვარეობას, სავსემთვარეობას და ნელი პლანეტების გადასვლებს.",
  },
  {
    q: "ჰოროსკოპი უფასოა?",
    a: "დიახ — დღის, კვირისა და თვის ჰოროსკოპი ყველა ნიშნისთვის სრულიად უფასოა. პერსონალური, შენს დაბადების მონაცემებზე მორგებული ჰოროსკოპისთვის კი შექმენი უფასო ნატალური რუკა Vivida-ზე.",
  },
];

export default async function HoroskopiHubPage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <HoroscopeHubEn />;
  const now = new Date();
  const todayLabel = signHoroscopePeriodLabel(now, "day");

  // Resolve every sign's daily horoscope in parallel. Each call hits the
  // DB cache on a warm day and is a no-op; on the first request after
  // the period rollover the first 12 requests pay one AI generation
  // each. If you want to shield production from that spike, wire a
  // pre-warm cron that calls ensureSignHoroscope(slug, "day") at 00:05 UTC.
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
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ჰოროსკოპი</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {todayLabel}
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            დღევანდელი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ჰოროსკოპი
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            ცის დღევანდელი ფონი ყველა 12 ნიშნისთვის — კონკრეტული, ცოცხალი ენით,
            ქართულად. დააჭირე ნიშანს სრული ჰოროსკოპის სანახავად.
          </p>
        </header>

        {/* Period switcher */}
        <div className="mb-10 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15 px-4 py-1.5 text-sm text-foreground">
            დღიური ჰოროსკოპი
          </span>
          <Link
            href="/horoskopi/kvireuli"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            კვირის ჰოროსკოპი
          </Link>
          <Link
            href="/horoskopi/tviuri"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            თვის ჰოროსკოპი
          </Link>
          <Link
            href="/siyvarulis-horoskopi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            სიყვარულის ჰოროსკოპი
          </Link>
          <Link
            href="/finansuri-horoskopi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            ფინანსური ჰოროსკოპი
          </Link>
          <Link
            href="/karieris-horoskopi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            კარიერის ჰოროსკოპი
          </Link>
          <Link
            href="/astrologiuri-kalendari"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            ასტროლოგიური კალენდარი
          </Link>
          <Link
            href="/ighbliani-dgheebi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            იღბლიანი დღეები
          </Link>
          <Link
            href="/savse-mtvare"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            სავსე და ახალი მთვარე
          </Link>
          <Link
            href="/dabnelebebi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            დაბნელებები
          </Link>
          <Link
            href="/merkuri-retrogradi"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            მერკური რეტროგრადში
          </Link>
          <Link
            href="/mtvaris-kalendari"
            className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            მთვარის კალენდარი
          </Link>
        </div>

        <div className="mb-8">
          <PopularTools placement="horoscope_before_signs" publicEntry />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {horoscopes.map(({ slug, row }) => {
            const sc = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            const dates = ZODIAC_DATES[slug];
            const summary =
              row?.summary ?? "ჰოროსკოპი მზადდება — სცადე ცოტა ხანში.";

            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/80 hover:border-foreground/20"
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
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                      color: accent,
                    }}
                  >
                    {sc.symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      {sc.labelKa}
                    </h2>
                    <div className="text-[11px] text-muted-foreground">
                      {dates.rangeKa}
                    </div>
                  </div>
                </div>
                {row?.headline && (
                  <p
                    className="relative mt-3 text-sm font-medium"
                    style={{ color: accent }}
                  >
                    {row.headline}
                  </p>
                )}
                <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/85">
                  {summary}
                </p>
                <div className="relative mt-3 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  სრული ჰოროსკოპი →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Today's real sky — the transits this horoscope is built on. */}
        <MundaneSkySection date={now} />

        {/* Per-sign quick links — daily + tomorrow, keyword-rich anchors. */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            ჰოროსკოპი ზოდიაქოს ნიშნების მიხედვით
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            აირჩიე შენი ნიშანი — დღევანდელი და ხვალინდელი ჰოროსკოპი ცალ-ცალკე
            გვერდებზე.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((slug) => {
              const sc = SIGNS_CONTENT[slug];
              return (
                <div
                  key={slug}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-sm"
                >
                  <Link
                    href={`/zodiac/${slug}/${VIEW_PATH.today}`}
                    className="min-w-0 truncate font-medium text-foreground/90 hover:text-foreground hover:underline"
                  >
                    {genitiveKa(sc.labelKa)} ჰოროსკოპი
                  </Link>
                  <Link
                    href={`/zodiac/${slug}/${VIEW_PATH.tomorrow}`}
                    className="shrink-0 text-xs text-[var(--vivida-cyan)] hover:underline"
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
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
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

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            მზის ნიშანი მცირე ნაწილია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ნამდვილი ჰოროსკოპი მთლიან ნატალურ რუკას უყურებს — მთვარე, ვენერა,
            მარსი, ცის 12 სახლი. Vivida უფასოდ ანგარიშობს ყველაფერს.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი სრული რუკა</Link>
          </Button>
        </div>

        <PopularSearches queries={HOROSKOPI_HUB_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
