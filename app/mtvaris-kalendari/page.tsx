import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { computeMoonPhase, type MoonPhaseSnapshot } from "@/lib/moon-phase";
import { ALL_SLUGS, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

/**
 * 30-day moon calendar — universal data (geocentric moon longitudes),
 * so we can ISR it daily and serve from cache. The query
 * "მთვარის კალენდარი" is a high-volume recurring search with thin
 * Georgian-language competition; this page captures it.
 */
export const revalidate = 86400;

const TITLE = "მთვარის კალენდარი — მთვარის ფაზები და ნიშნები 30 დღეზე";
const DESCRIPTION =
  "მთვარის ფაზები, ნიშანი ყოველ დღეს, ახალი მთვარე, სავსე მთვარე და მეოთხედები — შემდეგი 30 დღის სრული მთვარის კალენდარი ქართულად. გაიგე როდის ხდება სავსე მთვარე და რომელ ნიშანშია.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/mtvaris-kalendari` },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/mtvaris-kalendari`,
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

const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

const WEEKDAYS_KA = [
  "კვ", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ",
];

const PHASE_SYMBOL: Record<string, string> = {
  new_moon: "🌑",
  waxing_crescent: "🌒",
  first_quarter: "🌓",
  waxing_gibbous: "🌔",
  full_moon: "🌕",
  waning_gibbous: "🌖",
  last_quarter: "🌗",
  waning_crescent: "🌘",
};

const KEY_PHASES = new Set([
  "new_moon",
  "first_quarter",
  "full_moon",
  "last_quarter",
]);

type Day = {
  date: Date;
  snapshot: MoonPhaseSnapshot | null;
};

export default async function MoonCalendarPage() {
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  // 30-day window — current day + 29 forward. Two months max, never more
  // than ~60 days of work for computeMoonPhase below.
  const days: Day[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    days.push({ date: d, snapshot: computeMoonPhase(d) });
  }

  // Pull out the upcoming "key" phases (new/full/quarters) to feature
  // at the top. Crawlers love the explicit "next full moon" callout.
  const keyEvents: Day[] = [];
  let prevKey: string | null = null;
  for (const d of days) {
    const k = d.snapshot?.phaseKey;
    if (!k) continue;
    if (KEY_PHASES.has(k) && k !== prevKey) {
      keyEvents.push(d);
      prevKey = k;
    } else if (!KEY_PHASES.has(k)) {
      prevKey = null;
    }
  }

  // Group days by month to render a clean header per chunk.
  const months: Array<{ key: string; label: string; days: Day[] }> = [];
  for (const d of days) {
    const key = `${d.date.getUTCFullYear()}-${d.date.getUTCMonth()}`;
    const last = months[months.length - 1];
    if (last && last.key === key) {
      last.days.push(d);
    } else {
      months.push({
        key,
        label: `${MONTHS_KA[d.date.getUTCMonth()]} ${d.date.getUTCFullYear()}`,
        days: [d],
      });
    }
  }

  const ld = [
    articleLd({
      url: `${SITE_URL}/mtvaris-kalendari`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: today.toISOString(),
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "მთვარის კალენდარი", url: `${SITE_URL}/mtvaris-kalendari` },
    ]),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">მთვარის კალენდარი</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Moon className="size-3.5" />
            ცის რიტმი
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            მთვარის{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              კალენდარი
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            შემდეგი 30 დღის მთვარის ფაზები და ნიშნები. ახალი მთვარე, სავსე
            მთვარე, პირველი და ბოლო მეოთხედი — ცის რიტმი ერთ ხედვაში.
          </p>
        </header>

        {/* Key upcoming events */}
        {keyEvents.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              უახლოესი მნიშვნელოვანი ფაზები
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {keyEvents.slice(0, 4).map((d, i) => {
                const s = d.snapshot;
                if (!s) return null;
                const meta = ALL_SLUGS
                  .map((slug) => signMetaBySlug(slug))
                  .find((m) => m && m.labelEn === s.signEn);
                const accent = meta ? signColor(meta) : "var(--vivida-violet)";
                return (
                  <li
                    key={i}
                    className="flex gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5"
                  >
                    <div
                      className="grid size-12 shrink-0 place-items-center rounded-xl text-3xl"
                      style={{
                        background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                      }}
                      aria-hidden
                    >
                      {PHASE_SYMBOL[s.phaseKey] ?? "🌙"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tracking-tight text-foreground">
                        {s.phaseLabelKa}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.date.getUTCDate()} {MONTHS_KA[d.date.getUTCMonth()]}
                        {" · "}
                        <span style={{ color: accent }}>{s.signKa}</span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-muted-foreground">
                        განათება {(s.illumination * 100).toFixed(0)}%
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Calendar grid */}
        {months.map((m) => (
          <section key={m.key} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {m.label}
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {m.days.map((d, i) => {
                const s = d.snapshot;
                const isKey = s && KEY_PHASES.has(s.phaseKey);
                const meta = ALL_SLUGS
                  .map((slug) => signMetaBySlug(slug))
                  .find((mm) => mm && mm.labelEn === s?.signEn);
                const accent = meta
                  ? signColor(meta)
                  : "var(--vivida-violet)";
                return (
                  <li
                    key={i}
                    className={`rounded-xl border bg-card/45 p-3 ring-1 ring-foreground/5 backdrop-blur-xl ${
                      isKey
                        ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-semibold tabular-nums text-foreground">
                        {d.date.getUTCDate()}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {WEEKDAYS_KA[d.date.getUTCDay()]}
                      </span>
                    </div>
                    {s ? (
                      <>
                        <div className="mt-1 flex items-center gap-1 text-sm">
                          <span aria-hidden>{PHASE_SYMBOL[s.phaseKey] ?? "🌙"}</span>
                          <span
                            className={`text-[11px] ${
                              isKey ? "font-medium text-foreground" : "text-foreground/85"
                            }`}
                          >
                            {s.phaseLabelKa}
                          </span>
                        </div>
                        <div
                          className="mt-0.5 text-[11px]"
                          style={{ color: accent }}
                        >
                          {s.signKa}
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-[11px] text-muted-foreground">—</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {/* What is moon calendar */}
        <section className="mb-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            როგორ მუშაობს მთვარის კალენდარი
          </h2>
          <p>
            მთვარე დედამიწის ირგვლივ დაახლოებით 29.5 დღეში სრულდება ერთი
            ციკლი — ახალი მთვარიდან ახალ მთვარემდე. ამ ციკლის რვა ძირითადი
            ფაზაა: ახალი მთვარე, მზარდი ნამგალი, პირველი მეოთხედი, მზარდი
            გიბუსი, სავსე მთვარე, კლებადი გიბუსი, ბოლო მეოთხედი და კლებადი
            ნამგალი.
          </p>
          <p>
            მთვარის ფაზა + ნიშანი ერთად ქმნის დღის &ldquo;ენერგიის
            ხელწერას&rdquo; — ახალი მთვარე ფიქსირებულ ნიშანში სხვა ტონალობას
            იძლევა, ვიდრე იგივე ფაზა მუტაბელურ ნიშანში. სრული ნატალური რუკა
            გვაჩვენებს, რომელ შენს ცის სახლზე ხდება ეს ციკლი ახლა.
          </p>
        </section>

        <ReportPromo className="mt-16" />

        {/* CTA */}
        <div className="mt-6 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            შენი მთვარის ნიშანი
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ნამდვილი მთვარის რიტმი იწყება იქიდან, თუ რომელ ნიშანში იყო მთვარე
            შენი დაბადებისას. Vivida უფასოდ ანგარიშობს ამას ნატალურ რუკაში.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი მთვარის ნიშანი</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
