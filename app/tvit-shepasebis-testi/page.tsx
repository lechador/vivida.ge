import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { RosenbergTest } from "@/components/rosenberg/rosenberg-test";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  POLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/tvit-shepasebis-testi";
const TITLE_KA = "თვითშეფასების ტესტი, Rosenberg-ის 10-კითხვიანი სკალა";
const DESCRIPTION_KA =
  "გაიარე Rosenberg-ის თვითშეფასების 10-კითხვიანი ტესტი ქართულად. მიიღე 0-30 ქულა, ფრთხილი განმარტება და შენს პასუხებზე მორგებული რეფლექსიის თემები.";
const TITLE_EN =
  "Rosenberg Self-Esteem Test, Free 10-Question Self-Esteem Scale";
const DESCRIPTION_EN =
  "Take the free 10-item Rosenberg self-esteem test. Get a 0–30 score with a calm explanation and reflection themes matched to your answers.";
const TITLE_PL = "Test samooceny, 10-punktowa skala Rosenberga | Vivida";
const DESCRIPTION_PL =
  "Wypełnij darmowy 10-pytaniowy test samooceny według skali Rosenberga. Uzyskaj wynik 0–30 punktów, wyważoną interpretację i tematy do refleksji.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const en = locale === "en";
  const title = pl ? TITLE_PL : en ? TITLE_EN : TITLE_KA;
  const description = pl
    ? DESCRIPTION_PL
    : en
      ? DESCRIPTION_EN
      : DESCRIPTION_KA;
  const siteUrl = pl
    ? POLISH_SITE_URL
    : en
      ? ENGLISH_SITE_URL
      : GEORGIAN_SITE_URL;

  return {
    title: { absolute: pl || en ? title : title + ", Vivida" },
    description,
    keywords: pl
      ? [
          "test samooceny",
          "skala rosenberga",
          "test poczucia własnej wartości",
          "darmowy test samooceny",
          "jak podnieść samoocenę",
          "test psychologiczny online",
        ]
      : en
        ? [
            "rosenberg self-esteem test",
            "self-esteem test",
            "rosenberg scale",
            "free self-esteem quiz",
            "self-worth test",
          ]
        : [
            "თვითშეფასების ტესტი",
            "როზენბერგის ტესტი",
            "Rosenberg Self-Esteem Scale ქართულად",
            "ფსიქოლოგიური ტესტი ქართულად",
            "დაბალი თვითშეფასება",
          ],
    alternates: localizedAlternates(PATH, PATH, locale),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: pl ? `${POLISH_SITE_URL}${PATH}` : `${siteUrl}${PATH}`,
      title,
      description,
      siteName: "Vivida",
      locale: pl ? "pl_PL" : en ? "en_US" : "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const FAQ = [
  {
    q: "რას ზომავს Rosenberg-ის სკალა?",
    a: "ის ზომავს გლობალურ თვითშეფასებას, რამდენად ღირებულად, საკმარისად და პატივისცემის ღირსად აღიქვამ საკუთარ თავს მთლიანობაში.",
  },
  {
    q: "როგორ ითვლება შედეგი?",
    a: "ათი პასუხიდან თითოეული ფასდება 0-დან 3 ქულამდე. ხუთი უარყოფითად ფორმულირებული პუნქტი შებრუნებულად ითვლება. საბოლოო შედეგი 0-დან 30 ქულამდეა და მაღალი ქულა უფრო მყარ თვითშეფასებაზე მიუთითებს.",
  },
  {
    q: "არის ეს ფსიქოლოგიური დიაგნოზი?",
    a: "არა. ტესტი თვითრეფლექსიისა და ზოგადი შეფასებისთვისაა. მას არ შეუძლია ფსიქიკური მდგომარეობის დიაგნოსტირება ან ადამიანის ღირებულების განსაზღვრა.",
  },
  {
    q: "ინახება ჩემი პასუხები?",
    a: "არა. პასუხები და ქულა უშუალოდ შენს ბრაუზერში ითვლება, Vivida-ს სერვერზე არ იგზავნება და გვერდის განახლების შემდეგ ქრება.",
  },
];

const FAQ_EN = [
  {
    q: "What does the Rosenberg scale measure?",
    a: "It measures global self-esteem: how worthy, good enough and deserving of respect you feel yourself to be as a whole.",
  },
  {
    q: "How is the result calculated?",
    a: "Each of the ten answers scores 0 to 3 points. Five negatively worded items are scored in reverse. The total ranges from 0 to 30, and a higher score points to steadier self-esteem.",
  },
  {
    q: "Is this a psychological diagnosis?",
    a: "No. The test is for self-reflection and general orientation. It cannot diagnose a mental health condition or determine a person's worth.",
  },
  {
    q: "Are my answers stored?",
    a: "No. Your answers and score are computed directly in your browser, are not sent to Vivida's servers, and disappear when you refresh the page.",
  },
];

const FAQ_PL = [
  {
    q: "Co mierzy skala samooceny Rosenberga?",
    a: "Mierzy globalną samoocenę: to, na ile wartościowy, wystarczający i godny szacunku czujesz się jako człowiek.",
  },
  {
    q: "Jak obliczany jest wynik?",
    a: "Każda z dziesięciu odpowiedzi jest punktowana od 0 do 3 punktów. Pięć twierdzeń sformułowanych negatywnie jest punktowanych odwrotnie. Wynik mieści się w przedziale 0–30, a wyższy wynik wskazuje na bardziej stabilną samoocenę.",
  },
  {
    q: "Czy to jest diagnoza psychologiczna?",
    a: "Nie. Test służy do autorefleksji i ogólnej orientacji. Nie zastępuje profesjonalnej diagnozy zdrowia psychicznego ani nie określa Twojej wartości jako człowieka.",
  },
  {
    q: "Czy moje odpowiedzi są zapisywane?",
    a: "Nie. Twoje odpowiedzi i wynik są obliczane wyłącznie w przeglądarce, nie są wysyłane na serwery Vivida i znikają po odświeżeniu strony.",
  },
];

export default async function SelfEsteemTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();
  const pl = locale === "pl";
  const en = locale === "en";
  const siteUrl = pl
    ? POLISH_SITE_URL
    : en
      ? ENGLISH_SITE_URL
      : GEORGIAN_SITE_URL;
  const description = pl
    ? DESCRIPTION_PL
    : en
      ? DESCRIPTION_EN
      : DESCRIPTION_KA;
  const faq = pl ? FAQ_PL : en ? FAQ_EN : FAQ;
  const testTitle = pl
    ? "Test samooceny Rosenberga"
    : en
      ? "Rosenberg Self-Esteem Test"
      : "Rosenberg-ის თვითშეფასების ტესტი ქართულად";

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: testTitle,
      description,
      inLanguage: pl ? "pl" : en ? "en" : "ka-GE",
      url: siteUrl + PATH,
      numberOfQuestions: 10,
      about: {
        "@type": "Thing",
        name: pl ? "Samoocena" : en ? "Self-esteem" : "თვითშეფასება",
        alternateName: "Self-esteem",
      },
      author: { "@type": "Person", name: "Morris Rosenberg" },
    },
    breadcrumbLd([
      { name: pl ? "Strona główna" : en ? "Home" : "მთავარი", url: siteUrl },
      {
        name: pl ? "Testy" : en ? "Tests" : "ტესტები",
        url: siteUrl + "/tests",
      },
      {
        name: pl
          ? "Test samooceny"
          : en
            ? "Self-Esteem Test"
            : "თვითშეფასების ტესტი",
        url: siteUrl + PATH,
      },
    ]),
    faqLd(faq),
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.34_0.17_350/0.45),transparent_70%),radial-gradient(45%_35%_at_85%_45%,oklch(0.30_0.15_200/0.38),transparent_70%),radial-gradient(40%_30%_at_10%_80%,oklch(0.30_0.15_305/0.35),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader active="tests" locale={locale} georgianPath={PATH} />
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <header className="mb-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida · Rosenberg Self-Esteem Scale
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {pl ? (
              <>
                Jak postrzegasz{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
                  samego siebie?
                </span>
              </>
            ) : en ? (
              <>
                How do you{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
                  see yourself?
                </span>
              </>
            ) : (
              <>
                როგორ უყურებ{" "}
                <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
                  საკუთარ თავს?
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
            {pl
              ? "Odpowiedz na dziesięć krótkich twierdzeń i przekonaj się, jak stabilne jest Twoje poczucie własnej wartości, kompetencji i szacunku do samego siebie."
              : en
                ? "Answer ten short statements and see how steady your sense of worth, capability and self-respect feels right now."
                : "უპასუხე ათ მოკლე დებულებას და ნახე, რამდენად მყარია საკუთარი ღირებულების, შესაძლებლობებისა და თავის პატივისცემის განცდა."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="size-3.5" />
              {pl ? "10 pytań" : en ? "10 questions" : "10 კითხვა"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {pl
                ? "Około 2 minut"
                : en
                  ? "About 2 minutes"
                  : "დაახლოებით 2 წუთი"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              {pl
                ? "Odpowiedzi nie są zapisywane"
                : en
                  ? "Answers are not stored"
                  : "პასუხები არ ინახება"}
            </span>
          </div>
        </header>

        <RosenbergTest locale={locale} />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            {pl
              ? "Co mierzy ten test?"
              : en
                ? "What does this test measure?"
                : "რას ზომავს ეს ტესტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl
              ? "Skala Rosenberga mierzy globalną samoocenę: nie jedną konkretną umiejętność czy zadowolenie z wyglądu, lecz ogólny stosunek do samego siebie. Wyższy wynik oznacza stabilniejszą akceptację i szacunek do siebie — nie oznacza narcyzmu ani wyższości nad innymi."
              : en
                ? "The Rosenberg scale measures global self-esteem: not one specific skill or satisfaction with appearance, but your overall attitude toward yourself. A higher score means steadier acceptance and self-respect. It does not mean narcissism or superiority over others."
                : "Rosenberg-ის სკალა ზომავს გლობალურ თვითშეფასებას, არა ერთ კონკრეტულ უნარს ან გარეგნობით კმაყოფილებას, არამედ საკუთარ თავთან საერთო დამოკიდებულებას. მაღალი ქულა ნიშნავს უფრო მყარ მიღებასა და თვითპატივისცემას; ის არ ნიშნავს ნარცისიზმს ან სხვებზე აღმატებულობას."}
          </p>

          <h2 className="mt-7 text-xl font-semibold tracking-tight">
            {pl
              ? "Jak obliczany jest wynik?"
              : en
                ? "How is the score calculated?"
                : "როგორ ითვლება ქულა?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl
              ? "Każda odpowiedź daje 0–3 punkty. Twierdzenia pozytywne (1, 3, 4, 7 i 10) liczą się wprost, natomiast twierdzenia negatywne (2, 5, 6, 8 i 9) są odwracane. Łączny wynik mieści się w przedziale 0–30 punktów."
              : en
                ? "Each answer scores 0–3 points. Positively worded items 1, 3, 4, 7 and 10 count directly, while negatively worded items 2, 5, 6, 8 and 9 count in reverse. The total ranges from 0 to 30. There is deliberately no neutral answer; that is part of the original four-option format."
                : "თითოეული პასუხი 0–3 ქულაა. დადებითად ფორმულირებული 1, 3, 4, 7 და 10 პუნქტები პირდაპირ, ხოლო უარყოფითად ფორმულირებული 2, 5, 6, 8 და 9 პუნქტები შებრუნებულად ითვლება. ჯამური ქულაა 0–30. ტესტში ნეიტრალური პასუხი განზრახ არ არის, ეს ორიგინალი ოთხპასუხიანი ფორმატის ნაწილია."}
          </p>

          <div className="mt-7 rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/7 p-4 text-sm leading-relaxed text-foreground/80">
            <strong className="font-semibold text-foreground">
              {pl ? "Źródło:" : en ? "Source:" : "წყარო:"}
            </strong>{" "}
            Morris Rosenberg, <em>Society and the Adolescent Self-Image</em>{" "}
            (1965).{" "}
            <Link
              href="https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--vivida-cyan)] underline underline-offset-2"
            >
              {pl
                ? "Według University of Maryland skala znajduje się w domenie publicznej"
                : en
                  ? "According to the University of Maryland, the scale is in the public domain"
                  : "University of Maryland-ის მიხედვით, სკალა საჯარო დომენშია"}
            </Link>
            {pl
              ? "; format twierdzeń i punktacja zostały zweryfikowane z "
              : en
                ? "; the item format and scoring are verified against "
                : "; კითხვების ფორმატი და დათვლის წესი კი გადამოწმებულია "}
            <Link
              href="https://www.apa.org/obesity-guideline/rosenberg-self-esteem.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--vivida-cyan)] underline underline-offset-2"
            >
              {pl
                ? "wersją opublikowaną przez APA"
                : en
                  ? "the version published by the APA"
                  : "APA-ს გამოქვეყნებულ ვერსიასთან"}
            </Link>
            .
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
                className="group rounded-2xl border border-border bg-background/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-foreground/80">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
