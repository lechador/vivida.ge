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
import {
  TESTS,
  getTestDesc,
  getTestMeta,
  getTestTagline,
  getTestTitle,
  type TestCatalogEntry,
} from "@/lib/tests-catalog";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  POLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { localizedHref } from "@/lib/seo/public-paths";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/locale";

const PATH = "/en/tests";
const TITLE_EN = "Free Personality, IQ and Emotional Intelligence Tests";
const DESCRIPTION_EN =
  "Take Vivida's IQ, EQ, Big Five and Astro-MBTI assessments, or try a quick zodiac quiz. Clear results, thoughtful explanations and no cost to start.";

const TITLE_PL = "Testy Psychologiczne i Astrologiczne Online | Vivida";
const DESCRIPTION_PL =
  "Wypełnij darmowe testy psychologiczne i astrologiczne Vivida: IQ, EQ, Big Five, Astro-MBTI oraz szybkie quizy zodiaku. Jasne wyniki, interpretacje i darmowy start.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const title = pl ? TITLE_PL : TITLE_EN;
  const description = pl ? DESCRIPTION_PL : DESCRIPTION_EN;

  return {
    title: { absolute: pl ? TITLE_PL : `${TITLE_EN}, Vivida` },
    description,
    keywords: pl
      ? [
          "darmowy test osobowości",
          "test IQ online",
          "test inteligencji emocjonalnej",
          "test Wielkiej Piątki",
          "test MBTI",
          "quiz zodiaku",
          "testy psychologiczne",
        ]
      : [
          "free personality test",
          "online IQ test",
          "emotional intelligence test",
          "Big Five personality test",
          "MBTI test",
          "zodiac quiz",
        ],
    alternates: localizedAlternates(PATH, "/tests", locale),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: pl ? `${POLISH_SITE_URL}/tests` : `${ENGLISH_SITE_URL}/tests`,
      locale: pl ? "pl_PL" : "en_US",
      alternateLocale: pl ? ["en_US", "ka_GE"] : ["ka_GE", "pl_PL"],
    },
  };
}

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
    Icon: Sparkles,
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
  attachment: {
    Icon: HeartHandshake,
    color:
      "text-[var(--vivida-cyan)] border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/12",
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

const FAQ_EN = [
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

const FAQ_PL = [
  {
    q: "Jaka jest różnica między testem a quizem?",
    a: "Testy diagnostyczne Vivida oferują uporządkowane wyniki, takie jak szacowany wynik IQ lub profil cech osobowości. Quizy zodiaku to krótsze, angażujące wyzwania stworzone głównie dla rozrywki i autorefleksji.",
  },
  {
    q: "Czy testy są darmowe?",
    a: "Każdy test możesz rozwiązać i otrzymać podstawowy wynik całkowicie bezpłatnie. Opcjonalne głębsze analizy mogą korzystać z kredytów Vivida, z jasnym podaniem ceny.",
  },
  {
    q: "Od którego testu najlepiej zacząć?",
    a: "Wybierz Astro-MBTI, aby poznać swój typ osobowości, Big Five dla profilu cech opartego na badaniach naukowych, EQ dla inteligencji emocjonalnej lub IQ dla zadań logicznych i przestrzennych na czas.",
  },
  {
    q: "Czy to są diagnozy kliniczne?",
    a: "Nie. Wyniki online to szacunki i narzędzia do samorozwoju oraz autorefleksji. Nie zastępują profesjonalnej diagnozy psychologicznej ani medycznej.",
  },
];

export default async function EnglishTestsPage() {
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const url = pl ? `${POLISH_SITE_URL}/tests` : `${ENGLISH_SITE_URL}/tests`;
  const homeUrl = pl ? POLISH_SITE_URL : ENGLISH_SITE_URL;
  const title = pl ? TITLE_PL : TITLE_EN;
  const description = pl ? DESCRIPTION_PL : DESCRIPTION_EN;
  const faq = pl ? FAQ_PL : FAQ_EN;

  const visibleTests = TESTS.filter(
    (test) =>
      test.available && (!test.locales || test.locales.includes(locale)),
  );

  const ld = [
    articleLd({ url, headline: title, description }),
    breadcrumbLd([
      { name: pl ? "Strona główna" : "Home", url: homeUrl },
      { name: pl ? "Testy" : "Tests", url },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pl
        ? "Testy i quizy psychologiczne Vivida"
        : "Vivida tests and quizzes",
      itemListElement: visibleTests.map((test, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getTestTitle(test, locale),
        url: `${ENGLISH_SITE_URL}${localizedHref(test.href, locale)}`,
      })),
    },
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />
      <SmartHeader active="tests" locale={locale} georgianPath="/tests" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mb-10 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            {pl
              ? "PSYCHOMETRIA I ARCHETYPY · TESTY I QUIZY"
              : "PSYCHOMETRICS & ARCHETYPES · TESTS AND QUIZZES"}
          </div>
          <h1 className="mt-2 max-w-2xl text-balance font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
            {pl ? (
              <>
                Dowiedz się więcej o tym, <Accent>jak myślisz i czujesz</Accent>
              </>
            ) : (
              <>
                Discover more about <Accent>how you think and feel</Accent>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {pl
              ? "Rzetelne testy inteligencji, osobowości i nawyków emocjonalnych oraz szybkie quizy astrologiczne, gdy szukasz lżejszej rozrywki."
              : "Thoughtful assessments for intelligence, personality and emotional habits, plus quick zodiac quizzes when you want something lighter."}
          </p>
        </header>

        <TestSection
          eyebrow={pl ? "01 · Zacznij tutaj" : "01 · Start here"}
          title={pl ? "Główne testy" : "Core assessments"}
          tests={visibleTests.filter((test) => test.kind === "featured")}
          locale={locale}
        />

        <div className="mt-12">
          <TestSection
            eyebrow={
              pl ? "02 · Szybkie i angażujące" : "02 · Quick and playful"
            }
            title={pl ? "Quizy zodiaku" : "Zodiac quizzes"}
            tests={visibleTests.filter((test) => test.kind === "quiz")}
            locale={locale}
          />
        </div>

        <section className="mt-12">
          <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {pl
              ? "03 · Często zadawane pytania"
              : "03 · Frequently asked questions"}
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
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

      <SiteFooter locale={locale} />
    </main>
  );
}

function TestSection({
  eyebrow,
  title,
  tests,
  locale,
}: {
  eyebrow: string;
  title: string;
  tests: TestCatalogEntry[];
  locale: UserLocale;
}) {
  const pl = locale === "pl";
  return (
    <section>
      <div className="mb-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => {
          const { Icon, color } = THEME[test.slug] ?? THEME.iq;
          const testTitle = getTestTitle(test, locale);
          const testTagline = getTestTagline(test, locale);
          const testDesc = getTestDesc(test, locale);
          const testMeta = getTestMeta(test, locale);
          const buttonLabel = pl
            ? test.kind === "quiz"
              ? "Rozwiąż quiz"
              : "Rozpocznij test"
            : test.kind === "quiz"
              ? "Play quiz"
              : "Start test";
          return (
            <article
              key={test.slug}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/45 hover:bg-secondary/40 sm:p-7"
            >
              <div>
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-lg border ${color}`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {testTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {testTagline}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
                  {testDesc}
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {testMeta}
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href={localizedHref(test.href, locale)}>
                  {buttonLabel}
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
