import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { MbtiTestClient } from "@/components/mbti/mbti-test-client";
import { TestMusicPlayer } from "@/components/mbti/test-music-player";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { PERSONALITY_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { MBTI_QUESTIONS_EN } from "@/lib/mbti-questions";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "პიროვნების ტესტი — Astro-MBTI ქართულად (უფასო)";
const DESCRIPTION =
  "გაიარე უფასო პიროვნების ტესტი ქართულად — 60 კითხვა, ~7 წუთი. გაიგე შენი MBTI ტიპი 16-დან, ძლიერი და სუსტი მხარეები, ურთიერთობები და კარიერა. რეგისტრაციის გარეშე.";

const TITLE_EN = "Free Personality Test — Discover Your 16-Type Profile";
const DESCRIPTION_EN = "Take a free 60-question personality test and explore your preferences across energy, information, decisions, structure and identity.";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLocale()) === "en";
  if (en) return { title: { absolute: TITLE_EN }, description: DESCRIPTION_EN, keywords: ["free personality test", "16 personalities test", "MBTI style test", "personality type test"], alternates: { canonical: `${ENGLISH_SITE_URL}/pirovnebis-testi`, languages: { en: `${ENGLISH_SITE_URL}/pirovnebis-testi`, "ka-GE": `${GEORGIAN_SITE_URL}/pirovnebis-testi`, "x-default": `${ENGLISH_SITE_URL}/pirovnebis-testi` } }, openGraph: { type: "website", url: `${ENGLISH_SITE_URL}/pirovnebis-testi`, title: TITLE_EN, description: DESCRIPTION_EN, siteName: "Vivida", locale: "en_US" }, twitter: { card: "summary_large_image", title: TITLE_EN, description: DESCRIPTION_EN } };
  return {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "პიროვნების ტესტი",
    "პიროვნების ტესტი ქართულად",
    "mbti ტესტი",
    "mbti ტესტი ქართულად",
    "16 personalities ქართულად",
    "ფსიქოლოგიური ტესტი",
    "უფასო პიროვნების ტესტი",
    "ხასიათის ტესტი",
    "ტესტი ხასიათზე",
    "რომელი ტიპი ვარ",
    "pirovnebis testi",
    "mbti testi qartulad",
    "psikologiuri testi",
  ],
  // Reciprocal — the English side already points here, and hreflang pairs
  // are discarded unless both directions agree.
  alternates: {
    canonical: `${SITE_URL}/pirovnebis-testi`,
    languages: {
      en: `${ENGLISH_SITE_URL}/pirovnebis-testi`,
      "ka-GE": `${SITE_URL}/pirovnebis-testi`,
      "x-default": `${ENGLISH_SITE_URL}/pirovnebis-testi`,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/pirovnebis-testi`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

const TEST_FAQ = [
  {
    q: "რამდენი კითხვაა ტესტში?",
    a: "60 კითხვა, 7-ბალიან სკალაზე (ვეთანხმები ↔ არ ვეთანხმები). სავსებით უფასო.",
  },
  {
    q: "ტესტი უფასოა და საჭიროა თუ არა რეგისტრაცია?",
    a: "ტესტი უფასოა და შეგიძლია გაიარო რეგისტრაციის გარეშე. სრული, პერსონალური შედეგის სანახავად საჭიროა მხოლოდ ერთი წუთი — შესვლა ან რეგისტრაცია.",
  },
  {
    q: "რას მივიღებ შედეგში?",
    a: "შენს ზუსტ ტიპს 16-დან, ღერძების პროცენტებს, ძლიერ და სუსტ მხარეებს, ურთიერთობებს, კარიერასა და ცნობილ ადამიანებს იმავე ტიპით.",
  },
];

/**
 * Public Astro-MBTI test. Anyone can take it; the deep result is gated behind
 * login (handled at /pirovnebis-testi/claim). Header adapts to auth state.
 */
export default async function TestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const en = locale === "en";
  const questions = en ? MBTI_QUESTIONS_EN : await getMbtiQuestions();
  const siteUrl = en ? ENGLISH_SITE_URL : SITE_URL;
  const description = en ? DESCRIPTION_EN : DESCRIPTION;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: en ? "Vivida Personality Test" : "Astro-MBTI პიროვნების ტესტი",
      description,
      inLanguage: en ? "en" : "ka-GE",
      url: `${siteUrl}/pirovnebis-testi`,
      educationalLevel: "beginner",
      numberOfQuestions: questions.length,
      about: {
        "@type": "Thing",
        name: en ? "Personality type (MBTI-style)" : "პიროვნების ტიპი (MBTI)",
        alternateName: en ? ["MBTI", "16 personality types", "personality test"] : ["MBTI", "16 personalities", "პიროვნების ტესტი"],
      },
    },
    faqLd(en ? [
      { q: "How many questions are in the test?", a: "There are 60 statements answered on a seven-point agreement scale." },
      { q: "Is the personality test free?", a: "You can take the test and see your type for free. An account lets you save the result; optional deeper analysis is clearly marked." },
      { q: "What does the result include?", a: "You receive a five-letter profile and percentages across energy, information, decisions, structure and identity." },
    ] : TEST_FAQ),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      { name: en ? "Personality Test" : "პიროვნების ტესტი", url: `${siteUrl}/pirovnebis-testi` },
    ]),
  ];

  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.16_350/0.4),transparent_70%)]"
      />
      {/* Slow-drifting nebula for extra mystic depth. */}
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(45%_40%_at_35%_45%,oklch(0.42_0.18_305/0.16),transparent_70%),radial-gradient(40%_35%_at_75%_60%,oklch(0.42_0.16_210/0.16),transparent_70%)]"
      />
      <Starfield count={150} shooting={3} />
      <TestMusicPlayer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader active="tests" locale={locale} georgianPath="/pirovnebis-testi" />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Astro-MBTI
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {en ? "Your " : "შენი"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "personality type" : "ფსიქოლოგიური ტიპი"}
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {en ? "60 questions · about 7 minutes · personal profile" : "60 კითხვა · ~7 წუთი · ღრმა, პერსონალური ანალიზი"}
          </p>
        </header>

        <MbtiTestClient questions={questions} locale={locale} />
      </section>

      {/* SEO / informational content — below the fold, indexable. The page
          previously ended at the test client, so it had no crawlable body
          copy and no outbound links at all. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {en ? "What does this personality test measure?" : "რა არის პიროვნების ტესტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en ? <>This MBTI-style framework describes preferences across four paired dimensions, plus an identity dimension. There is no “good” or “bad” type: the result describes <em>how</em> you tend to process information and make decisions, not how intelligent you are.</> : <>პიროვნების ტესტი (ცნობილი როგორც <strong>MBTI</strong> ან 16&nbsp;Personalities) შენს ფსიქოლოგიურ ტიპს განსაზღვრავს ოთხი ღერძის მიხედვით. ეს არ არის „კარგი“ ან „ცუდი“ შედეგი — ტიპი აღწერს იმას, <em>როგორ</em> ფიქრობ და იღებ გადაწყვეტილებას, და არა იმას, რამდენად ჭკვიანი ხარ.</>}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(en ? [
              { t: "E ↔ I — Energy", d: "Whether interaction or solitude tends to recharge you" },
              { t: "S ↔ N — Information", d: "Concrete facts versus patterns and possibilities" },
              { t: "T ↔ F — Decisions", d: "Impersonal logic versus values and human impact" },
              { t: "J ↔ P — Structure", d: "Planning and closure versus flexibility and open options" },
            ] : [
              {
                t: "E ↔ I — ენერგია",
                d: "ენერგიას ადამიანებისგან იღებ თუ მარტოობისგან",
              },
              {
                t: "S ↔ N — აღქმა",
                d: "კონკრეტულ ფაქტებს ენდობი თუ იდეებსა და შესაძლებლობებს",
              },
              {
                t: "T ↔ F — გადაწყვეტილება",
                d: "ლოგიკით წყვეტ თუ ღირებულებებითა და ადამიანებით",
              },
              {
                t: "J ↔ P — ცხოვრების წესი",
                d: "გეგმა გირჩევნია თუ მოქნილობა და ღია ვარიანტები",
              },
            ]).map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="text-sm font-semibold">{x.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {x.d}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            {en ? "How to use your result" : "რით განსხვავდება Astro-MBTI?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en ? "Treat your type as a vocabulary for recurring preferences, not a fixed box or diagnosis. People can adapt across situations, and percentages near the midpoint often indicate genuine flexibility." : "კლასიკური ტესტი მხოლოდ პასუხებს აფასებს. Vivida-ზე შედეგს ემატება ასტროლოგიური ფენა — შენი ნიშნის ტემპერამენტი ისე ეხმიანება ტიპს, რომ აღწერა უფრო ცოცხალი და ამოსაცნობი ხდება. ორივე ნაწილი ცალკეც იკითხება, თუ მხოლოდ ერთი გაინტერესებს."}
          </p>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="mt-4 space-y-3">
            {(en ? [
              { q: "How many questions are there?", a: "There are 60 statements on a seven-point agreement scale." },
              { q: "Is the test free?", a: "Yes. You can complete the test and see your type for free." },
              { q: "Is this a diagnosis?", a: "No. It is a self-reflection framework, not a clinical assessment." },
            ] : TEST_FAQ).map((item) => (
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
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Explore more" : "16 ტიპი და სხვა ტესტები"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(en ? [
              { href: "/mbti", label: "16 personality types", sub: "Browse all type descriptions" },
              { href: "/iq-testi", label: "IQ Test", sub: "Adaptive reasoning assessment" },
              { href: "/eq-testi", label: "EQ Test", sub: "Emotional intelligence profile" },
              { href: "/big-five", label: "Big Five Test", sub: "Five broad personality traits" },
            ] : [
              {
                href: "/mbti",
                label: "16 პიროვნების ტიპი",
                sub: "ყველა ტიპის სრული აღწერა",
              },
              {
                href: "/iq-testi",
                label: "IQ ტესტი",
                sub: "ადაპტიური ინტელექტის ტესტი",
              },
              {
                href: "/eq-testi",
                label: "EQ ტესტი",
                sub: "ემოციური ინტელექტის შეფასება",
              },
              {
                href: "/big-five",
                label: "Big Five ტესტი",
                sub: "დიდი ხუთეული — 5 თვისება",
              },
            ]).map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-colors hover:bg-card/70"
              >
                <div className="text-sm font-medium text-foreground/90">
                  {t.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t.sub}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <PopularSearches queries={en ? ["free personality type test", "16 personalities test", "MBTI style test", "discover my personality type"] : PERSONALITY_LATIN_QUERIES} locale={locale} />
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
