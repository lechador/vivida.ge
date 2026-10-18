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
import { Button } from "@/components/ui/button";
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

const THEME: Record<string, { Icon: LucideIcon }> = {
  iq: { Icon: Brain },
  eq: { Icon: HeartHandshake },
  "big-five": { Icon: Layers },
  "astro-mbti": { Icon: Fingerprint },
  "true-sign": { Icon: Sparkles },
  "famous-zodiac": { Icon: Sparkles },
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
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader active="tests" locale="en" georgianPath="/tests" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mb-10 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            PSYCHOMETRICS & ARCHETYPES · TESTS AND QUIZZES
          </div>
          <h1 className="mt-2 max-w-2xl text-balance font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
            Discover more about <Accent>how you think and feel</Accent>
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Thoughtful assessments for intelligence, personality and emotional
            habits, plus quick zodiac quizzes when you want something lighter.
          </p>
        </header>

        <TestSection
          eyebrow="01 · Start here"
          title="Core assessments"
          tests={TESTS.filter(
            (test) =>
              test.kind === "featured" &&
              (!test.locales || test.locales.includes("en")),
          )}
        />

        <div className="mt-12">
          <TestSection
            eyebrow="02 · Quick and playful"
            title="Zodiac quizzes"
            tests={TESTS.filter(
              (test) =>
                test.kind === "quiz" &&
                (!test.locales || test.locales.includes("en")),
            )}
          />
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            03 · Frequently asked questions
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/40 [&::-webkit-details-marker]:hidden">
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
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
        {tests.map((test) => {
          const { Icon } = THEME[test.slug] ?? THEME.iq;
          return (
            <article
              key={test.slug}
              className="flex flex-col justify-between bg-card p-6 transition-colors hover:bg-secondary/30 sm:p-7"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {test.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {test.taglineEn}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
                  {test.descEn}
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {test.metaEn}
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href={internationalPublicPath(test.href)}>
                  {test.kind === "quiz" ? "Play quiz" : "Start test"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
