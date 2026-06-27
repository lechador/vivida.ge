import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { articleLd, breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { VIEW_PATH, signHoroscopePeriodLabel } from "@/lib/sign-horoscope";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

type Period = "week" | "month";

const CFG: Record<
  Period,
  {
    path: string; // hub URL segment under /horoskopi
    viewPath: string; // per-sign route segment
    crumb: string;
    h1Lead: string;
    title: string;
    description: string;
    intro: string;
    cardCta: string;
  }
> = {
  week: {
    path: "kvireuli",
    viewPath: VIEW_PATH.week,
    crumb: "კვირის ჰოროსკოპი",
    h1Lead: "ამ კვირის",
    title: "კვირის ჰოროსკოპი — ამ კვირის ჰოროსკოპი ყველა ნიშნისთვის",
    description:
      "ამ კვირის ჰოროსკოპი ვერძი, კურო, ტყუპები, კირჩხიბი, ლომი, ქალწული, სასწორი, მორიელი, მშვილდოსანი, თხის რქა, მერწყული, თევზები — ცის ფონი და კონკრეტული რჩევა კვირისთვის, ქართულად.",
    intro:
      "ცის ფონი ამ კვირისთვის ყველა 12 ნიშნისთვის — რა იხსნება და რას ღირს ყურადღება. დააჭირე ნიშანს სრული კვირის ჰოროსკოპის სანახავად.",
    cardCta: "სრული კვირის ჰოროსკოპი →",
  },
  month: {
    path: "tviuri",
    viewPath: VIEW_PATH.month,
    crumb: "თვის ჰოროსკოპი",
    h1Lead: "ამ თვის",
    title: "თვის ჰოროსკოპი — ამ თვის ჰოროსკოპი ყველა ნიშნისთვის",
    description:
      "ამ თვის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის — თვის მთავარი ციკლი, ფოკუსი და რჩევა ვერძიდან თევზებამდე, ქართულად, Vivida-ზე.",
    intro:
      "თვის მთავარი ენერგია ყველა 12 ნიშნისთვის — რომელ სფეროზე ღირს ფოკუსი. დააჭირე ნიშანს სრული თვის ჰოროსკოპის სანახავად.",
    cardCta: "სრული თვის ჰოროსკოპი →",
  },
};

const SWITCHER = [
  { href: "/horoskopi", label: "დღიური", key: "day" },
  { href: "/horoskopi/kvireuli", label: "კვირის", key: "week" },
  { href: "/horoskopi/tviuri", label: "თვის", key: "month" },
];

export function periodHubMetadata(period: Period) {
  const cfg = CFG[period];
  const url = `${SITE_URL}/horoskopi/${cfg.path}`;
  return {
    title: { absolute: cfg.title },
    description: cfg.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website" as const,
      url,
      title: cfg.title,
      description: cfg.description,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: cfg.title,
      description: cfg.description,
    },
  };
}

/** Shared weekly/monthly horoscope hub — grid of all 12 signs for the period. */
export async function PeriodHoroscopeHub({ period }: { period: Period }) {
  const cfg = CFG[period];
  const now = new Date();
  const periodLabel = signHoroscopePeriodLabel(now, period);

  const horoscopes = await Promise.all(
    ALL_SLUGS.map(async (slug) => ({
      slug,
      row: await ensureSignHoroscope(slug, period, now),
    }))
  );

  const url = `${SITE_URL}/horoskopi/${cfg.path}`;
  const ld = [
    articleLd({
      url,
      headline: cfg.title,
      description: cfg.description,
      datePublished: now.toISOString(),
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ჰოროსკოპი", url: `${SITE_URL}/horoskopi` },
      { name: cfg.crumb, url },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: horoscopes.map(({ slug }, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/zodiac/${slug}/${cfg.viewPath}`,
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
          <Link href="/horoskopi" className="hover:text-foreground">
            ჰოროსკოპი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{cfg.crumb}</span>
        </nav>

        <header className="mb-6 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {periodLabel}
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {cfg.h1Lead}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ჰოროსკოპი
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            {cfg.intro}
          </p>
        </header>

        {/* Period switcher */}
        <div className="mb-10 flex flex-wrap gap-2">
          {SWITCHER.map((s) => {
            const active = s.key === period;
            return (
              <Link
                key={s.key}
                href={s.href}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15 text-foreground"
                    : "border-border bg-card/55 text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
              >
                {s.label} ჰოროსკოპი
              </Link>
            );
          })}
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
                href={`/zodiac/${slug}/${cfg.viewPath}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20 hover:bg-card/80"
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
                  {cfg.cardCta}
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA → calculator */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            მზის ნიშანი მცირე ნაწილია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ნამდვილი ჰოროსკოპი მთლიან ნატალურ რუკას უყურებს — მთვარე, ვენერა,
            მარსი და ცის 12 სახლი. შექმენი შენი რუკა უფასოდ.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/nataluri-ruka">ჩემი ნატალური რუკა</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
