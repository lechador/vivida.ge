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

const SITE_URL = "https://www.vivida.ge";

const TITLE = "EQ ტესტი — ემოციური ინტელექტის ტესტი ქართულად";
const DESCRIPTION =
  "გაიარე უფასო EQ ტესტი ქართულად — ემოციური ინტელექტის თვითშეფასება 5 სფეროში: თვითშემეცნება, თვითრეგულაცია, მოტივაცია, ემპათია და სოციალური უნარები. 40 კითხვა, ~7 წუთი. მიიღე შენი EQ ქულა და ემოციური რუკა. რეგისტრაციის გარეშე.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "eq ტესტი",
    "ემოციური ინტელექტი",
    "ემოციური ინტელექტის ტესტი",
    "eq ტესტი ქართულად",
    "ემოციური ინტელექტი ტესტი",
    "უფასო eq ტესტი",
    "ემპათიის ტესტი",
    "ფსიქოლოგიური ტესტი",
  ],
  alternates: { canonical: `${SITE_URL}/eq-testi` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/eq-testi`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

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

/**
 * Free EQ (emotional intelligence) self-report test. Anyone can take it; the
 * score is computed client-side (see /eq-testi/shedegi), the deep 5-domain
 * profile is gated behind login / a one-time credit unlock.
 */
export default async function EqTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Vivida EQ ტესტი",
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: `${SITE_URL}/eq-testi`,
      educationalLevel: "beginner",
      numberOfQuestions: EQ_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: "ემოციური ინტელექტი (EQ)",
        alternateName: ["EQ", "ემოციური ინტელექტი", "eq ტესტი"],
      },
    },
    faqLd(EQ_FAQ),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "EQ ტესტი", url: `${SITE_URL}/eq-testi` },
    ]),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_350/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.15_200/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida EQ
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            შენი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ემოციური ინტელექტის ტესტი
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {EQ_QUESTION_COUNT} კითხვა · ~7 წუთი · უფასო
          </p>
        </header>

        <EqTestClient />
      </section>

      {/* SEO / informational content — below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რა არის ემოციური ინტელექტი?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            ემოციური ინტელექტი (EQ) არის უნარი ამოიცნო, გაიგო და მართო ემოციები —
            როგორც საკუთარი, ისე სხვისი. IQ-სგან განსხვავებით, EQ განისაზღვრავს
            იმას, თუ როგორ ვამყარებთ კავშირებს, ვაგვარებთ კონფლიქტს და ვმართავთ
            სტრესს. კარგი ამბავი: EQ, IQ-სგან განსხვავებით, მთელი ცხოვრება
            ვითარდება.
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            ხუთი სფერო, რომელსაც ტესტი ზომავს
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EQ_DOMAINS.map((d) => (
              <div
                key={d.key}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{d.glyph}</span>
                  {d.nameKa}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {d.taglineKa}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="mt-4 space-y-3">
            {EQ_FAQ.map((item) => (
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

          <PopularSearches queries={EQ_LATIN_QUERIES} />
        </div>
      </section>
    </main>
  );
}
