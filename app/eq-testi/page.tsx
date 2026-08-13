import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { EqTestClient } from "@/components/eq/eq-test-client";
import { PopularSearches } from "@/components/seo/popular-searches";
import { EQ_QUESTION_COUNT, EQ_DOMAINS } from "@/lib/eq/questions";
import { EQ_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";

const TITLE_KA = "EQ ტესტი — ემოციური ინტელექტის ტესტი ქართულად";
const DESCRIPTION_KA =
  "გაიარე უფასო EQ ტესტი ქართულად — ემოციური ინტელექტის თვითშეფასება 5 სფეროში: თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები. 40 კითხვა, ~7 წუთი. მიიღე შენი EQ ქულა და ემოციური რუკა. რეგისტრაციის გარეშე.";
const TITLE_EN = "Free Emotional Intelligence Test — EQ Assessment";
const DESCRIPTION_EN =
  "Take a free 40-question emotional intelligence self-assessment across self-awareness, self-regulation, motivation, empathy and social skills.";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLocale()) === "en";
  const title = en ? TITLE_EN : TITLE_KA;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  return {
    title: { absolute: title }, description,
    keywords: en ? ["free EQ test", "emotional intelligence test", "empathy test", "self awareness test", "emotional intelligence assessment"] : ["eq ტესტი", "ემოციური ინტელექტი", "ემოციური ინტელექტის ტესტი", "უფასო eq ტესტი", "ემპათიის ტესტი"],
    alternates: { canonical: `${siteUrl}/eq-testi`, languages: { en: `${ENGLISH_SITE_URL}/eq-testi`, "ka-GE": `${GEORGIAN_SITE_URL}/eq-testi`, "x-default": `${ENGLISH_SITE_URL}/eq-testi` } },
    openGraph: { type: "website", url: `${siteUrl}/eq-testi`, title, description, siteName: "Vivida", locale: en ? "en_US" : "ka_GE" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const EQ_FAQ = [
  {
    q: "რა არის ემოციური ინტელექტი (EQ)?",
    a: "ემოციური ინტელექტი არის უნარი ამოიცნო, გაიგო და მართო საკუთარი და სხვისი ემოციები. მას ხშირად ხუთ სფეროდ ყოფენ: თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები (გოულმანის მოდელი).",
  },
  {
    q: "როგორ ითვლება EQ ქულა?",
    a: "თითო კითხვას პასუხობ 5-ბალიან სკალაზე. პასუხები ჯამდება ხუთ სფეროდ (შებრუნებული კითხვები აბალანსებს მიდრეკილებას თანხმობისკენ), თითო სფერო ფასდება 0-დან 100-მდე, ხოლო საერთო EQ ქულა მათი საშუალოა.",
  },
  {
    q: "ტესტი უფასოა და საჭიროა თუ არა რეგისტრაცია?",
    a: "ტესტი და შენი EQ ქულა უფასოა და რეგისტრაციის გარეშე მიიღები. სრული ემოციური რუკა და თითო სფეროს ანალიზი მოითხოვს უფასო რეგისტრაციას.",
  },
  {
    q: "EQ თუ IQ — რომელია მნიშვნელოვანი?",
    a: "ორივე. IQ ზომავს აზროვნების უნარს, EQ კი — ემოციებთან და ადამიანებთან მუშაობის უნარს. კვლევები აჩვენებს, რომ EQ ხშირად უფრო მეტ როლს თამაშობს ურთიერთობებსა და ლიდერობაში.",
  },
];

const EQ_FAQ_EN = [
  { q: "What is emotional intelligence (EQ)?", a: "Emotional intelligence describes how we recognize, understand and manage our own emotions and respond to other people's emotions. This assessment uses five familiar areas: self-awareness, self-regulation, motivation, empathy and social skills." },
  { q: "How is the EQ score calculated?", a: "You answer each statement on a five-point agreement scale. Reverse-keyed items reduce agreement bias, each domain is normalized to 0–100, and the overall score is the mean of all five domains." },
  { q: "Is the test free?", a: "The test and core EQ score are free. You can complete the assessment without an account; creating one lets you save the result, while any optional credit-based analysis is clearly marked." },
  { q: "Is EQ more important than IQ?", a: "They describe different abilities. IQ assessments focus on reasoning, while EQ self-reports explore emotional and interpersonal habits. Neither number captures a person's overall worth or potential." },
];

/**
 * Free EQ (emotional intelligence) self-report test. Anyone can take it; the
 * score is computed client-side (see /eq-testi/shedegi), the deep 5-domain
 * profile is gated behind login / a one-time credit unlock.
 */
export default async function EqTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const faq = en ? EQ_FAQ_EN : EQ_FAQ;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: en ? "Vivida EQ Test" : "Vivida EQ ტესტი",
      description,
      inLanguage: en ? "en" : "ka-GE",
      url: `${siteUrl}/eq-testi`,
      educationalLevel: "beginner",
      numberOfQuestions: EQ_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: en ? "Emotional intelligence (EQ)" : "ემოციური ინტელექტი (EQ)",
        alternateName: en ? ["EQ", "emotional intelligence", "EQ test"] : ["EQ", "ემოციური ინტელექტი", "eq ტესტი"],
      },
    },
    faqLd(faq),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      { name: en ? "EQ Test" : "EQ ტესტი", url: `${siteUrl}/eq-testi` },
    ]),
  ];

  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_350/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.15_200/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader active="tests" locale={locale} georgianPath="/eq-testi" />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida EQ
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {en ? "Your " : "შენი"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "emotional intelligence test" : "ემოციური ინტელექტის ტესტი"}
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {en ? `${EQ_QUESTION_COUNT} questions · about 7 minutes · free` : `${EQ_QUESTION_COUNT} კითხვა · ~7 წუთი · უფასო`}
          </p>
        </header>

        <EqTestClient locale={locale} />
      </section>

      {/* SEO / informational content — below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {en ? "What is emotional intelligence?" : "რა არის ემოციური ინტელექტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en
              ? "Emotional intelligence describes the skills involved in recognizing, understanding and managing emotion—both your own and other people's. These habits affect communication, conflict, resilience and relationships, and they can develop through practice."
              : "ემოციური ინტელექტი (EQ) არის უნარი ამოიცნო, გაიგო და მართო ემოციები — როგორც საკუთარი, ისე სხვისი. IQ-სგან განსხვავებით, EQ განისაზღვრავს იმას, თუ როგორ ვამყარებთ კავშირებს, ვაგვარებთ კონფლიქტს და ვმართავთ სტრესს. კარგი ამბავი: EQ, IQ-სგან განსხვავებით, მთელი ცხოვრება ვითარდება."}
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            {en ? "The five areas in this assessment" : "ხუთი სფერო, რომელსაც ტესტი ზომავს"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EQ_DOMAINS.map((d) => (
              <div
                key={d.key}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{d.glyph}</span>
                  {en ? d.nameEn : d.nameKa}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {en ? d.taglineEn : d.taglineKa}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <PopularSearches queries={en ? ["free emotional intelligence test", "online EQ test", "empathy and self awareness test", "emotional intelligence score"] : EQ_LATIN_QUERIES} />
        </div>
      </section>
    </main>
  );
}
