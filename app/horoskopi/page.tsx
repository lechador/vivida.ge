import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { articleLd, breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import {
  VIEW_PATH,
  signHoroscopePeriodLabel,
} from "@/lib/sign-horoscope";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

/**
 * Hub for the bare-keyword "ჰოროსკოპი" query. Grid of all 12 signs with
 * today's headline + summary; each card links to the dedicated daily
 * page for the sign. ISR'd hourly so the underlying cached horoscope
 * rows refresh in lockstep with their producers.
 */
export const revalidate = 3600;

const TITLE = "ჰოროსკოპი — დღევანდელი ჰოროსკოპი ყველა ნიშნისთვის";
const DESCRIPTION =
  "დღევანდელი ჰოროსკოპი ვერძი, კურო, ტყუპები, კირჩხიბი, ლომი, ქალწული, სასწორი, მორიელი, მშვილდოსანი, თხის რქა, მერწყული, თევზები — კონკრეტული რჩევა და ცის ფონი ქართულად, Vivida-ზე.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/horoskopi` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/horoskopi`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function HoroskopiHubPage() {
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
    }))
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
            ცის დღევანდელი ფონი ყველა 12 ნიშნისთვის — კონკრეტული, ცოცხალი
            ენით, ქართულად. დააჭირე ნიშანს სრული ჰოროსკოპის სანახავად.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {horoscopes.map(({ slug, row }) => {
            const sc = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            const dates = ZODIAC_DATES[slug];
            const summary = row?.summary
              ?? "ჰოროსკოპი მზადდება — სცადე ცოტა ხანში.";

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
      </section>

      <SiteFooter />
    </main>
  );
}
