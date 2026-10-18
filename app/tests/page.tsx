import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Brain,
  Fingerprint,
  Clock,
  ArrowRight,
  HeartHandshake,
  Heart,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { TESTS, type TestCatalogEntry } from "@/lib/tests-catalog";
import {
  getLatestBigFiveResult,
  getLatestEqResult,
  getLatestIqResult,
  getLatestMbtiResult,
} from "@/lib/test-results";
import { EQ_BAND_META } from "@/lib/eq/scoring";
import type { EqBand } from "@/lib/eq/scoring";
import {
  BIG5_TRAIT_BY_KEY,
  type BigFiveTraitKey,
} from "@/lib/big-five/questions";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const THEME: Record<string, { Icon: LucideIcon; color: string }> = {
  iq: {
    Icon: Brain,
    color:
      "text-[var(--vivida-cyan)] border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/12",
  },
  eq: {
    Icon: HeartHandshake,
    color:
      "text-[var(--vivida-gold)] border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/12",
  },
  "self-esteem": {
    Icon: Heart,
    color:
      "text-[var(--vivida-pink)] border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/12",
  },
  "big-five": {
    Icon: Layers,
    color: "text-primary border-primary/35 bg-primary/12",
  },
  "astro-mbti": {
    Icon: Fingerprint,
    color:
      "text-[var(--vivida-pink)] border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/12",
  },
  "true-sign": {
    Icon: Sparkles,
    color:
      "text-[var(--vivida-gold)] border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/12",
  },
  "famous-zodiac": {
    Icon: Sparkles,
    color:
      "text-[var(--vivida-cyan)] border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/12",
  },
};
const FALLBACK_THEME = {
  Icon: Brain,
  color: "text-primary border-primary/35 bg-primary/12",
};

const TITLE = "ტესტები და ქვიზები ქართულად, IQ, პიროვნების ტესტი და ზოდიაქო";
const DESCRIPTION =
  "გაიარე IQ და პიროვნების ტესტები ქართულად, აღმოაჩინე შენი შედეგი და გამოსცადე თავი სწრაფ ქვიზებში. უფასო, მარტივი და საინტერესო ტესტები Vivida-ზე.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "ტესტები",
    "ტესტები ქართულად",
    "ონლაინ ტესტები",
    "ფსიქოლოგიური ტესტები",
    "iq ტესტი",
    "iq ტესტი ქართულად",
    "ფსიქოლოგიური ტესტი",
    "პიროვნების ტესტი",
    "პიროვნების ტესტი ქართულად",
    "mbti ტესტი",
    "16 personalities ქართულად",
    "ხასიათის ტესტი",
    "უფასო ტესტი",
    "ქვიზი ქართულად",
    "ზოდიაქოს ქვიზი",
    "testebi qartulad",
    "psikologiuri testebi",
  ],
  alternates: localizedAlternates("/tests", "/en/tests", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/tests`,
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

const FAQ = [
  {
    q: "რა განსხვავებაა ტესტსა და ქვიზს შორის?",
    a: "ტესტები სიღრმისეულ შედეგს გაძლევს, მაგალითად IQ ქულას ან პიროვნების ტიპს. ქვიზები მოკლე, გასართობი გამოწვევებია, სადაც სწრაფად ამოწმებ ცოდნას.",
  },
  {
    q: "რა არის პიროვნების ტესტი?",
    a: "პიროვნების ტესტი (MBTI / 16Personalities) განსაზღვვრავს შენს ფსიქოლოგიურ ტიპს 16-დან, როგორ იღებ ენერგიას, აღიქვამ ინფორმაციას, იღებ გადაწყვეტილებებს და აწყობ ცხოვრებას.",
  },
  {
    q: "ტესტი უფასოა?",
    a: "დიახ. ტესტებისა და ქვიზების დაწყება უფასოა; რეგისტრაციის გარეშეც შეგიძლია გაიარო ძირითადი ნაწილი.",
  },
  {
    q: "რომელი ტესტით დავიწყო?",
    a: "თუ გინდა გაიგო როგორ ფიქრობ და ურთიერთობ, დაიწყე Astro-MBTI-ით. ლოგიკისა და პატერნების შესამოწმებლად აირჩიე IQ ტესტი. სწრაფი გასართობისთვის სცადე ქვიზი.",
  },
];

export default async function TestsPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  type TestResult = { href: string; value: string; sub: string };
  const myResults: Record<string, TestResult> = {};
  if (authed) {
    const uid = session!.user!.id;
    const [mbti, iq, eqRow, bigFive] = await Promise.all([
      getLatestMbtiResult(uid),
      getLatestIqResult(uid),
      getLatestEqResult(uid),
      getLatestBigFiveResult(uid),
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
    if (eqRow)
      myResults["eq"] = {
        href: `/eq-testi/shedegi/${eqRow.id}`,
        value: `EQ ${eqRow.overall}`,
        sub: EQ_BAND_META[eqRow.band as EqBand]?.labelKa ?? "",
      };
    if (bigFive) {
      const scores = bigFive.traitScores as Record<string, number>;
      const topKey = Object.keys(scores).reduce((a, b) =>
        scores[b] > scores[a] ? b : a,
      ) as BigFiveTraitKey;
      myResults["big-five"] = {
        href: `/big-five/shedegi/${bigFive.id}`,
        value: BIG5_TRAIT_BY_KEY[topKey]?.nameKa ?? "პროფილი",
        sub: "დომინანტი თვისება",
      };
    }
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
        name: `${t.titleKa}, ${t.taglineKa}`,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background">
      <Starfield count={48} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mb-10 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            PSYCHOMETRICS & ARCHETYPES · ტესტები და ქვიზები
          </div>
          <h1 className="mt-2 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            აღმოაჩინე მეტი{" "}
            <span className="text-primary">საკუთარი თავის შესახებ</span>
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            სიღრმისეული ტესტები შენს ინტელექტსა და პიროვნებაზე, და სწრაფი
            ქვიზები, როცა ცოტა თამაში გინდა.
          </p>
        </header>

        <section aria-labelledby="featured-tests">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                01 · დაიწყე აქ
              </div>
              <h2
                id="featured-tests"
                className="mt-1 text-xl font-semibold tracking-tight text-foreground"
              >
                მთავარი ტესტები
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-xs text-muted-foreground sm:block">
              ღრმა შედეგი და პერსონალური ანალიზი
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TESTS.filter((test) => test.kind === "featured").map((test) => (
              <TestCard
                key={test.slug}
                test={test}
                done={test.available ? myResults[test.slug] : undefined}
              />
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="quick-quizzes">
          <div className="mb-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
              02 · მსუბუქი და სწრაფი
            </div>
            <h2
              id="quick-quizzes"
              className="mt-1 text-xl font-semibold tracking-tight text-foreground"
            >
              ქვიზები
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              რამდენიმე წუთი, 20 კითხვა და შედეგი მყისიერად.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TESTS.filter((test) => test.kind === "quiz").map((test) => (
              <TestCard
                key={test.slug}
                test={test}
                done={test.available ? myResults[test.slug] : undefined}
              />
            ))}
          </div>
        </section>

        {/* Browse the 16 types (internal linking + SEO cluster) */}
        <div className="mt-8 flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              16 პიროვნების ტიპი
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              დაათვალიერე ყველა ტიპის სრული აღწერა ქართულად, ტესტის გავლის
              გარეშეც.
            </p>
          </div>
          <Link
            href="/mbti"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            ყველა ტიპი <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            03 · ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-2xs open:border-primary/45"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/40 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="font-mono text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-border/70 bg-background/55 px-5 py-4 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}

function TestCard({
  test,
  done,
}: {
  test: TestCatalogEntry;
  done?: { href: string; value: string; sub: string };
}) {
  const { Icon, color } = THEME[test.slug] ?? FALLBACK_THEME;
  return (
    <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/45 hover:bg-secondary/40 sm:p-7">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-lg border ${color}`}
          >
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {test.titleKa}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {test.taglineKa}
            </p>
          </div>
        </div>
        {done ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/35 bg-primary/10 px-4 py-3.5">
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                შენი შედეგი
              </div>
              <div className="mt-0.5 font-mono text-2xl font-semibold tracking-tight tabular-nums text-primary">
                {done.value}
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-foreground/80">
              {done.sub}
            </div>
          </div>
        ) : (
          <>
            <p className="text-[15px] leading-relaxed text-foreground/85">
              {test.descKa}
            </p>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{test.metaKa}</span>
            </div>
          </>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!test.available ? (
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            მალე
          </span>
        ) : done ? (
          <>
            <Button asChild className="w-full sm:flex-1">
              <Link href={done.href}>
                სრული ანალიზი <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
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
          <Button asChild className="w-full">
            <Link href={test.href}>
              {test.kind === "quiz" ? "თამაში" : "დაწყება"}{" "}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
