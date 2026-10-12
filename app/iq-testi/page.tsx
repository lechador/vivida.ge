import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { IqTestClient } from "@/components/iq/iq-test";
import { IQ_ADAPTIVE_LENGTH } from "@/lib/iq/adaptive";
import { SiteFooter } from "@/components/site-footer";

import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { localizedHref } from "@/lib/seo/public-paths";

const TITLE_KA = "IQ ტესტი, უფასო ინტელექტის ტესტი ქართულად";
const DESCRIPTION_KA =
  "გაიარე უფასო IQ ტესტი ქართულად, ადაპტიური ტესტი, რომელიც შენს დონეს ერგება: ლოგიკური, რიცხვითი და სივრცითი აზროვნების 25 დავალება, ~25 წუთი. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების ანალიზი. კულტურულად ნეიტრალური, რეგისტრაციის გარეშე.";
const TITLE_EN = "Free Online IQ Test, Adaptive Reasoning Assessment";
const DESCRIPTION_EN =
  "Take a free, adaptive 25-task IQ test covering numerical, logical, spatial and pattern reasoning. Receive an estimated IQ score and percentile in about 25 minutes.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const title = en ? TITLE_EN : TITLE_KA;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  return {
    title: { absolute: title },
    description,
    keywords: en
      ? [
          "free IQ test",
          "online IQ test",
          "adaptive IQ test",
          "logic test",
          "reasoning test",
          "intelligence test",
        ]
      : [
          "iq ტესტი",
          "iq ტესტი ქართულად",
          "ინტელექტის ტესტი",
          "უფასო iq ტესტი",
          "iq ტესტი ონლაინ",
          "ლოგიკური ტესტი",
        ],
    alternates: localizedAlternates("/iq-testi", "/iq-testi", en ? "en" : "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${siteUrl}${localizedHref("/iq-testi", locale)}`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const IQ_FAQ = [
  {
    q: "როგორ ითვლება IQ ქულა?",
    a: "შენი პასუხების პატერნი ფასდება დავალებების სირთულის მიხედვით (Rasch/IRT მოდელი), შემდეგ გადაჰყავს სტანდარტულ IQ სკალაზე, საშუალო 100, სტანდარტული გადახრა 15.",
  },
  {
    q: "ტესტი უფასოა და საჭიროა თუ არა რეგისტრაცია?",
    a: "ტესტი და შენი IQ ქულა სრულიად უფასოა და რეგისტრაციის გარეშე მიიღები. სრული ანალიზი აზროვნების დომენების მიხედვით მოითხოვს უფასო რეგისტრაციას.",
  },
  {
    q: "რამდენად ზუსტია ონლაინ IQ ტესტი?",
    a: "ერთჯერადი ონლაინ ტესტის ცდომილება დაახლოებით ±5 ქულაა და დამოკიდებულია დაღლილობასა და ყურადღებაზე. ეს არ არის კლინიკური დიაგნოზი, არამედ საიმედო შეფასება.",
  },
];

const IQ_FAQ_EN = [
  {
    q: "How is the IQ score calculated?",
    a: "Your response pattern is evaluated against each task's difficulty using a Rasch-style item response model, then mapped to the familiar IQ scale with a mean of 100 and standard deviation of 15.",
  },
  {
    q: "Is the test free, and do I need an account?",
    a: "The assessment and core IQ estimate are free, and you can complete them without an account. Creating a free account lets you save the result; the optional deeper profile is clearly priced in credits.",
  },
  {
    q: "How accurate is an online IQ test?",
    a: "A single online attempt has meaningful uncertainty and can be affected by fatigue, distractions and familiarity with the format. Treat the score as an estimate, not a clinical or professionally administered assessment.",
  },
];

/**
 * Free, timed, culture-fair IQ test. Anyone can take it; the score is computed
 * client-side (see /iq-testi/shedegi), the deep domain breakdown is gated
 * behind login. Header adapts to auth state (sidebar for signed-in users).
 */
export default async function IqTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const faq = en ? IQ_FAQ_EN : IQ_FAQ;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: en ? "Vivida IQ Test" : "Vivida IQ ტესტი",
      description,
      inLanguage: en ? "en" : "ka-GE",
      url: `${siteUrl}${localizedHref("/iq-testi", locale)}`,
      educationalLevel: "beginner",
      numberOfQuestions: IQ_ADAPTIVE_LENGTH,
      about: {
        "@type": "Thing",
        name: en ? "Intelligence quotient (IQ)" : "ინტელექტის კოეფიციენტი (IQ)",
        alternateName: "IQ",
      },
    },
    faqLd(faq),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      {
        name: en ? "IQ Test" : "IQ ტესტი",
        url: `${siteUrl}${localizedHref("/iq-testi", locale)}`,
      },
    ]),
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_265/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_190/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.16_300/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader active="tests" locale={locale} georgianPath="/iq-testi" />
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida IQ
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {en ? "Your " : "შენი"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "adaptive IQ test" : "ინტელექტის ტესტი"}
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {en
              ? `${IQ_ADAPTIVE_LENGTH} tasks · about 25 minutes · adaptive`
              : `${IQ_ADAPTIVE_LENGTH} დავალება · ~25 წუთი · ადაპტიური`}
          </p>
        </header>

        <IqTestClient locale={locale} />
      </section>

      {/* SEO / informational content, below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {en ? "What does an IQ test measure?" : "რა არის IQ ტესტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en ? (
              <>
                IQ tests estimate aspects of abstract reasoning: how well you
                identify patterns, draw logical conclusions and solve unfamiliar
                problems. Vivida uses mostly figures and numbers to reduce
                dependence on language and specific learned knowledge.
              </>
            ) : (
              <>
                IQ (ინტელექტის კოეფიციენტი) ზომავს აბსტრაქტულ აზროვნებას,
                რამდენად კარგად ამჩნევ კანონზომიერებებს, აგებ ლოგიკურ დასკვნებს
                და აგვარებ ახალ, უცნობ ამოცანებს. Vivida-ს ტესტი{" "}
                <strong>კულტურულად ნეიტრალურია</strong>: დავალებების უმეტესობა
                ფიგურებსა და რიცხვებზეა აგებული, ასე რომ შედეგი ნაკლებად არის
                დამოკიდებული ენასა თუ განათლებაზე.
              </>
            )}
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            {en ? "How is your score estimated?" : "როგორ ითვლება შენი ქულა?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {en ? (
              <>
                The test evaluates the <strong>pattern of responses</strong>{" "}
                against task difficulty, rather than only counting correct
                answers. The estimate is then mapped to the conventional IQ
                scale, where the mean is <strong>100</strong> and roughly 68% of
                people fall between 85 and 115.
              </>
            ) : (
              <>
                ტესტი აფასებს პასუხების <strong>პატერნს</strong>, და არა უბრალოდ
                სწორი პასუხების რაოდენობას, რთული დავალების სწორად ამოხსნა უფრო
                მეტს მატებს შედეგს, ვიდრე მარტივის. ეს არის იგივე პრინციპი (Item
                Response Theory), რომელსაც პროფესიული ტესტები იყენებენ. შემდეგ
                ქულა გადაჰყავს სტანდარტულ IQ სკალაზე, სადაც{" "}
                <strong>საშუალო არის 100</strong>, ხოლო მოსახლეობის დაახლოებით
                68% თავსდება 85-დან 115-მდე დიაპაზონში.
              </>
            )}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(en
              ? [
                  {
                    t: "Numerical reasoning",
                    d: "Sequences, quantities and numerical rules",
                  },
                  {
                    t: "Logical reasoning",
                    d: "Deductions, analogies and exceptions",
                  },
                  {
                    t: "Spatial reasoning",
                    d: "Rotation and spatial transformations",
                  },
                  {
                    t: "Pattern recognition",
                    d: "Matrix-style visual reasoning",
                  },
                ]
              : [
                  {
                    t: "რიცხვითი ლოგიკა",
                    d: "რიცხვთა მიმდევრობები და კანონზომიერებები",
                  },
                  {
                    t: "ლოგიკური აზროვნება",
                    d: "დასკვნები, ანალოგიები, გამონაკლისები",
                  },
                  {
                    t: "სივრცითი აზროვნება",
                    d: "ფიგურების ბრუნვა და სივრცული პატერნები",
                  },
                  {
                    t: "პატერნების ამოცნობა",
                    d: "მატრიცული ვიზუალური მსჯელობა (Raven-ის სტილი)",
                  },
                ]
            ).map((x) => (
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
        </div>

        {/* Sibling tests, this page had no outbound links at all, which
            left the rest of the tests cluster orphaned from it. */}
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Other tests" : "სხვა ტესტები"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(en
              ? [
                  {
                    href: "/personality-test",
                    label: "Astro-MBTI",
                    sub: "Discover your personality type",
                  },
                  {
                    href: "/eq-test",
                    label: "EQ Test",
                    sub: "Explore emotional intelligence",
                  },
                  {
                    href: "/big-five",
                    label: "Big Five Test",
                    sub: "Five broad personality traits",
                  },
                  {
                    href: "/tests",
                    label: "All tests",
                    sub: "Browse every test and quiz",
                  },
                ]
              : [
                  {
                    href: "/pirovnebis-testi",
                    label: "პიროვნების ტესტი",
                    sub: "MBTI, 16 ტიპიდან რომელი ხარ",
                  },
                  {
                    href: "/eq-testi",
                    label: "EQ ტესტი",
                    sub: "ემოციური ინტელექტის შეფასება",
                  },
                  {
                    href: "/big-five",
                    label: "Big Five ტესტი",
                    sub: "დიდი ხუთეული, 5 ძირითადი თვისება",
                  },
                  {
                    href: "/tests",
                    label: "ყველა ტესტი",
                    sub: "ტესტებისა და ქვიზების სრული სია",
                  },
                ]
            ).map((t) => (
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
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
