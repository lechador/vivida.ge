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
const TITLE_PL =
  "Darmowy Test IQ Online, Adaptacyjny Test Inteligencji | Vivida";
const DESCRIPTION_PL =
  "Wypełnij darmowy, adaptacyjny test IQ z 25 zadaniami (ok. 25 minut). Sprawdź swoje myślenie logiczne, liczbowe, przestrzenne i analizę wzorców. Bez rejestracji.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "pl") {
    return {
      title: { absolute: TITLE_PL },
      description: DESCRIPTION_PL,
      keywords: [
        "darmowy test iq",
        "test iq online",
        "test inteligencji",
        "test logiczny",
        "adaptacyjny test iq",
        "badanie inteligencji",
      ],
      alternates: localizedAlternates("/iq-testi", "/iq-testi", "pl"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ENGLISH_SITE_URL}/pl/test-iq`,
        title: TITLE_PL,
        description: DESCRIPTION_PL,
        siteName: "Vivida",
        locale: "pl_PL",
      },
      twitter: {
        card: "summary_large_image",
        title: TITLE_PL,
        description: DESCRIPTION_PL,
      },
    };
  }
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
    a: "ქულა შეფასებაა და არა ზუსტი გაზომვა, ტიპური ცდომილება დაახლოებით ±6 ქულაა, ამიტომ შედეგთან ერთად ყოველთვის ნახავ სავარაუდო დიაპაზონს. ნორმები Vivida-ს ტესტის რეალური გამვლელების შედეგებზეა დაფუძნებული. ეს არ არის კლინიკური დიაგნოზი.",
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
    a: "The score is an estimate, not an exact measurement: typical uncertainty is about ±6 points, which is why your result always comes with an estimated range. Norms are based on real Vivida test-takers. Treat the score as an estimate, not a clinical or professionally administered assessment.",
  },
];

const IQ_FAQ_PL = [
  {
    q: "Jak obliczany jest wynik IQ?",
    a: "Wzorzec Twoich odpowiedzi jest oceniany na podstawie trudności zadań (model IRT/Rasch), a następnie przekształcany na klasyczną skalę IQ ze średnią 100 i odchyleniem standardowym 15.",
  },
  {
    q: "Czy test jest bezpłatny i czy wymaga rejestracji?",
    a: "Test i wynik IQ są całkowicie bezpłatne i dostępne bez rejestracji. Założenie darmowego konta pozwala zapisać wynik w profilu.",
  },
  {
    q: "Jak dokładny jest internetowy test IQ?",
    a: "Wynik jest szacunkiem zdolności poznawczych z typowym zakresem błędu około ±6 punktów. Normy opierają się na rzeczywistych uczestnikach testu Vivida. Test ma charakter rozwojowy i nie stanowi diagnozy klinicznej.",
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
  const pl = locale === "pl";
  const en = locale === "en";
  const siteUrl = pl
    ? `${ENGLISH_SITE_URL}/pl`
    : en
      ? ENGLISH_SITE_URL
      : GEORGIAN_SITE_URL;
  const description = pl
    ? DESCRIPTION_PL
    : en
      ? DESCRIPTION_EN
      : DESCRIPTION_KA;
  const faq = pl ? IQ_FAQ_PL : en ? IQ_FAQ_EN : IQ_FAQ;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: pl ? "Test IQ Vivida" : en ? "Vivida IQ Test" : "Vivida IQ ტესტი",
      description,
      inLanguage: pl ? "pl-PL" : en ? "en" : "ka-GE",
      url: `${siteUrl}${localizedHref("/iq-testi", locale)}`,
      educationalLevel: "beginner",
      numberOfQuestions: IQ_ADAPTIVE_LENGTH,
      about: {
        "@type": "Thing",
        name: pl
          ? "Iloraz inteligencji (IQ)"
          : en
            ? "Intelligence quotient (IQ)"
            : "ინტელექტის კოეფიციენტი (IQ)",
        alternateName: "IQ",
      },
    },
    faqLd(faq),
    breadcrumbLd([
      { name: pl ? "Strona główna" : en ? "Home" : "მთავარი", url: siteUrl },
      {
        name: pl ? "Testy" : en ? "Tests" : "ტესტები",
        url: `${siteUrl}/tests`,
      },
      {
        name: pl ? "Test IQ" : en ? "IQ Test" : "IQ ტესტი",
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
            {pl ? "Twój " : en ? "Your " : "შენი"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {pl
                ? "adaptacyjny test IQ"
                : en
                  ? "adaptive IQ test"
                  : "ინტელექტის ტესტი"}
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {pl
              ? `${IQ_ADAPTIVE_LENGTH} zadań · ok. 25 minut · test adaptacyjny`
              : en
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
            {pl
              ? "Co mierzy test IQ?"
              : en
                ? "What does an IQ test measure?"
                : "რა არის IQ ტესტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl ? (
              <>
                IQ (iloraz inteligencji) szacuje wybrane aspekty myślenia
                abstrakcyjnego: jak trafnie rozpoznajesz wzorce, wyciągasz
                wnioski logiczne i radzisz sobie z nowymi problemami. Test
                Vivida jest <strong>neutralny kulturowo</strong>: opiera się
                głównie na figurach i liczbach, dzięki czemu wynik w mniejszym
                stopniu zależy od języka czy wykształcenia.
              </>
            ) : en ? (
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
            {pl
              ? "Jak obliczany jest Twój wynik?"
              : en
                ? "How is your score estimated?"
                : "როგორ ითვლება შენი ქულა?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl ? (
              <>
                Test ocenia <strong>wzorzec odpowiedzi</strong> w powiązaniu z
                trudnością zadań, a nie tylko sumę trafień. Poprawne rozwiązanie
                trudniejszych zadań ma większą wagę (zasada Item Response Theory
                / model Rascha). Szacunek jest następnie przekształcany na
                standardową skalę IQ, gdzie <strong>średnia wynosi 100</strong>,
                a ok. 68% populacji mieści się w przedziale 85–115.
              </>
            ) : en ? (
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
            {(pl
              ? [
                  {
                    t: "Rozumowanie liczbowe",
                    d: "Sekwencje, zależności i reguły matematyczne",
                  },
                  {
                    t: "Myślenie logiczne",
                    d: "Dedukcja, wnioskowanie, wyjątki i analogie",
                  },
                  {
                    t: "Wyobraźnia przestrzenna",
                    d: "Rotacja figur i przekształcenia przestrzenne",
                  },
                  {
                    t: "Rozpoznawanie wzorców",
                    d: "Wizualne myślenie matrycowe (w stylu Ravena)",
                  },
                ]
              : en
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
            {pl
              ? "Często zadawane pytania"
              : en
                ? "Frequently asked questions"
                : "ხშირად დასმული კითხვები"}
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
            {pl ? "Inne testy" : en ? "Other tests" : "სხვა ტესტები"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(pl
              ? [
                  {
                    href: localizedHref("/pirovnebis-testi", locale),
                    label: "Astro-MBTI",
                    sub: "Poznaj swój typ osobowości",
                  },
                  {
                    href: localizedHref("/eq-testi", locale),
                    label: "Test EQ",
                    sub: "Zbadaj inteligencję emocjonalną",
                  },
                  {
                    href: localizedHref("/big-five", locale),
                    label: "Test Wielkiej Piątki",
                    sub: "Pięć głównych cech osobowości",
                  },
                  {
                    href: localizedHref("/tests", locale),
                    label: "Wszystkie testy",
                    sub: "Przeglądaj wszystkie testy i quizy",
                  },
                ]
              : en
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
