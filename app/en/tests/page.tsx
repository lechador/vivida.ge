import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  Clock,
  Fingerprint,
  HeartHandshake,
  Layers,
  Sparkles,
} from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { Accent } from "@/components/en/editorial";
import { SmartHeader } from "@/components/smart-header";
import { SiteFooter } from "@/components/site-footer";
import { TESTS, type TestCatalogEntry } from "@/lib/tests-catalog";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { internationalPublicPath } from "@/lib/seo/public-paths";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const PATH = "/en/tests";
const TITLE = "Free Personality, IQ and Emotional Intelligence Tests";
const DESCRIPTION =
  "Take Vivida's IQ, EQ, Big Five and Astro-MBTI assessments, or try a quick zodiac quiz. Clear results, thoughtful explanations and no cost to start.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE}, Vivida` },
  description: DESCRIPTION,
  keywords: [
    "free personality test",
    "online IQ test",
    "emotional intelligence test",
    "Big Five personality test",
    "MBTI test",
    "zodiac quiz",
  ],
  alternates: localizedAlternates(PATH, "/tests", "en"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ENGLISH_SITE_URL}/tests`,
    locale: "en_US",
    alternateLocale: ["ka_GE"],
  },
};

const THEME: Record<string, { Icon: LucideIcon; accent: string }> = {
  iq: { Icon: Brain, accent: "var(--vivida-cyan)" },
  eq: { Icon: HeartHandshake, accent: "var(--vivida-pink)" },
  "big-five": { Icon: Layers, accent: "var(--vivida-violet)" },
  "astro-mbti": { Icon: Fingerprint, accent: "var(--vivida-violet)" },
  "true-sign": { Icon: Sparkles, accent: "var(--vivida-cyan)" },
  "famous-zodiac": { Icon: Sparkles, accent: "var(--vivida-pink)" },
};

const FAQ = [
  {
    q: "What is the difference between a test and a quiz?",
    a: "Vivida's assessments provide a structured result such as an estimated IQ score or personality profile. The zodiac quizzes are shorter, playful challenges designed primarily for entertainment.",
  },
  {
    q: "Are the tests free?",
    a: "You can take every assessment and receive the core result for free. Some optional deeper analyses use Vivida credits after showing the price clearly.",
  },
  {
    q: "Which test should I take first?",
    a: "Choose Astro-MBTI for an accessible personality type, Big Five for a research-oriented trait profile, EQ for emotional habits, or IQ for timed logic and pattern problems.",
  },
  {
    q: "Are these clinical assessments?",
    a: "No. Online results are estimates and tools for self-reflection. They should not be treated as a diagnosis or used alone for high-stakes health, education or employment decisions.",
  },
];

export default function EnglishTestsPage() {
  const url = `${ENGLISH_SITE_URL}/tests`;
  const ld = [
    articleLd({ url, headline: TITLE, description: DESCRIPTION }),
    breadcrumbLd([
      { name: "Home", url: ENGLISH_SITE_URL },
      { name: "Tests", url },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Vivida tests and quizzes",
      itemListElement: TESTS.filter(
        (test) =>
          test.available && (!test.locales || test.locales.includes("en")),
      ).map((test, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: test.titleEn,
        url: `${ENGLISH_SITE_URL}${internationalPublicPath(test.href)}`,
      })),
    },
  ];
  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <SmartHeader active="tests" locale="en" georgianPath="/tests" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mb-10 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tests and quizzes
          </div>
          <h1 className="mt-2 text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            Discover more about <Accent>how you think and feel</Accent>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
            Thoughtful assessments for intelligence, personality and emotional
            habits, plus quick zodiac quizzes when you want something lighter.
          </p>
        </header>

        <TestSection
          eyebrow="Start here"
          title="Core assessments"
          tests={TESTS.filter(
            (test) =>
              test.kind === "featured" &&
              (!test.locales || test.locales.includes("en")),
          )}
        />

        <div className="mt-10">
          <TestSection
            eyebrow="Quick and playful"
            title="Zodiac quizzes"
            tests={TESTS.filter(
              (test) =>
                test.kind === "quiz" &&
                (!test.locales || test.locales.includes("en")),
            )}
          />
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Frequently asked questions
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
      </section>

      <SiteFooter locale="en" />
    </main>
  );
}

function TestSection({
  eyebrow,
  title,
  tests,
}: {
  eyebrow: string;
  title: string;
  tests: TestCatalogEntry[];
}) {
  return (
    <section>
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => {
          const { Icon, accent } = THEME[test.slug] ?? THEME.iq;
          return (
            <article
              key={test.slug}
              className="flex flex-col rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20"
              style={{
                borderTopColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in oklch, ${accent} 15%, transparent)`,
                    color: accent,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {test.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {test.taglineEn}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                {test.descEn}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {test.metaEn}
              </div>
              <Link
                href={internationalPublicPath(test.href)}
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {test.kind === "quiz" ? "Play quiz" : "Start test"}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
