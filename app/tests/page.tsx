import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Brain, Fingerprint, Clock, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { TESTS } from "@/lib/tests-catalog";
import { getLatestIqResult, getLatestMbtiResult } from "@/lib/test-results";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

/** Per-test visual identity — icon + accent colour, keyed by catalog slug. */
const THEME: Record<string, { Icon: LucideIcon; accent: string }> = {
  iq: { Icon: Brain, accent: "var(--vivida-cyan)" },
  "astro-mbti": { Icon: Fingerprint, accent: "var(--vivida-violet)" },
  "famous-zodiac": { Icon: Sparkles, accent: "var(--vivida-pink)" },
};
const FALLBACK_THEME = { Icon: Brain, accent: "var(--vivida-violet)" };

const TITLE = "ტესტები — IQ ტესტი და პიროვნების ტესტი ქართულად";
const DESCRIPTION =
  "უფასო ტესტები ქართულად — გაზომე შენი IQ ადაპტიური ტესტით და გაიარე პიროვნების ტესტი (MBTI / 16 ტიპი). მიიღე შენი ქულა, ტიპი და ღრმა პერსონალური ანალიზი.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "iq ტესტი",
    "iq ტესტი ქართულად",
    "ფსიქოლოგიური ტესტი",
    "პიროვნების ტესტი",
    "პიროვნების ტესტი ქართულად",
    "mbti ტესტი",
    "16 personalities ქართულად",
    "ხასიათის ტესტი",
    "უფასო ტესტი",
  ],
  alternates: { canonical: `${SITE_URL}/tests` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tests`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  {
    q: "რა არის პიროვნების ტესტი?",
    a: "პიროვნების ტესტი (MBTI / 16Personalities) განსაზღვრავს შენს ფსიქოლოგიურ ტიპს 16-დან — როგორ იღებ ენერგიას, აღიქვამ ინფორმაციას, იღებ გადაწყვეტილებებს და აწყობ ცხოვრებას.",
  },
  {
    q: "ტესტი უფასოა?",
    a: "დიახ, Astro-MBTI ტესტი სრულიად უფასოა. 60 კითხვა, დაახლოებით 7 წუთი — რეგისტრაციის გარეშეც შეგიძლია გაიარო.",
  },
  {
    q: "რამდენ ხანს გრძელდება ტესტი?",
    a: "დაახლოებით 5-7 წუთი — 60 კითხვა, თითო წამში.",
  },
];

/**
 * The tests hub — one card per test from the catalog. A dedicated page (rather
 * than one nav slot per test) so new tests are added without crowding the nav.
 * Public: works signed-out (SmartHeader) and signed-in (AppHeader).
 */
export default async function TestsPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  // Latest result per test, keyed by catalog slug — shown inline on the card
  // (the score itself, not just a "my result" link).
  type TestResult = { href: string; value: string; sub: string };
  const myResults: Record<string, TestResult> = {};
  if (authed) {
    const uid = session!.user!.id;
    const [mbti, iq] = await Promise.all([
      getLatestMbtiResult(uid),
      getLatestIqResult(uid),
    ]);
    if (mbti)
      myResults["astro-mbti"] = {
        href: `/test-results/${mbti.id}`,
        value: mbti.mbtiType,
        sub: mbti.archetypeNameGe,
      };
    if (iq)
      myResults["iq"] = {
        href: `/iq-testi/shedegi/${iq.id}`,
        value: `IQ ${iq.iq}`,
        sub: `პროცენტილი ${iq.percentile}`,
      };
  }

  const ld = [
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: TESTS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${t.href}`,
        name: `${t.titleKa} — ${t.taglineKa}`,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-8 text-center sm:mb-10">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ტესტები
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            აღმოაჩინე შენი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              თავი
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-foreground/80 sm:text-base">
            ინტელექტი, პიროვნება და მეტი — ზუსტი ტესტები ქართულად, ღრმა
            პერსონალური ანალიზით.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {TESTS.map((test) => {
            const done = test.available ? myResults[test.slug] : undefined;
            const { Icon, accent } = THEME[test.slug] ?? FALLBACK_THEME;
            return (
              <article
                key={test.slug}
                className="flex flex-col rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20 sm:p-7"
                style={{ borderTopColor: `color-mix(in oklch, ${accent} 45%, transparent)` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-2xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 15%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 40%, transparent)`,
                    }}
                  >
                    <Icon className="size-5" style={{ color: accent }} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight">
                      {test.titleKa}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {test.taglineKa}
                    </p>
                  </div>
                </div>

                {done ? (
                  /* Completed — the score is the hero. */
                  <div
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
                    style={{
                      background: `color-mix(in oklch, ${accent} 10%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 30%, transparent)`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        შენი შედეგი
                      </div>
                      <div
                        className="mt-0.5 text-2xl font-bold tracking-tight"
                        style={{ color: accent }}
                      >
                        {done.value}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-foreground/70">
                      {done.sub}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[15px] leading-relaxed text-foreground/85">
                      {test.descKa}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>{test.metaKa}</span>
                    </div>
                  </>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {!test.available ? (
                    <span className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                      მალე
                    </span>
                  ) : done ? (
                    <>
                      <Button asChild variant="mystic" className="w-full sm:flex-1">
                        <Link href={done.href}>
                          სრული ანალიზი
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="ტესტის თავიდან გავლა"
                        aria-label="ტესტის თავიდან გავლა"
                      >
                        <Link href={test.href}>
                          <RotateCcw className="size-4" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="mystic" className="w-full">
                      <Link href={test.href}>
                        დაწყება
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Browse the 16 types (internal linking + SEO cluster) */}
        <div className="mt-6 rounded-2xl border border-border bg-card/40 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
          <h2 className="text-base font-semibold tracking-tight">16 პიროვნების ტიპი</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            დაათვალიერე ყველა ტიპის სრული აღწერა ქართულად — ტესტის გავლის გარეშეც.
          </p>
          <Link
            href="/mbti"
            className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--vivida-cyan)] hover:underline"
          >
            ყველა ტიპი <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* FAQ */}
        <section className="mt-10">
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
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
