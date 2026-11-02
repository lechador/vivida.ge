import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { SiteFooter } from "@/components/site-footer";
import { Starfield } from "@/components/landing/starfield";
import { TrueSignQuiz } from "@/components/true-sign/true-sign-quiz";
import { TS_QUESTION_COUNT } from "@/lib/true-sign/quiz";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const TITLE = "რომელი ზოდიაქოს ნიშანი ხარ სინამდვილეში? ტესტი";
const DESCRIPTION =
  "გაიარე უფასო ტესტი და გაიგე, რომელი ზოდიაქოს ნიშნის ენერგია შეესაბამება შენს ხასიათს, შედეგი შეიძლება დაბადების ნიშანს არ ემთხვეოდეს. სწრაფი და სახალისო ქვიზი ქართულად.";

const METADATA_KA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "რომელი ნიშანი ხარ",
    "ზოდიაქოს ნიშნის ტესტი",
    "რა ნიშანი ხარ ტესტი",
    "ნამდვილი ზოდიაქოს ნიშანი",
    "პიროვნების ტესტი",
    "ზოდიაქოს ტესტი ქართულად",
  ],
  // Reciprocal, the English side already points here.
  alternates: localizedAlternates(
    "/quiz/namdvili-nishani",
    "/quiz/namdvili-nishani",
    "ka",
  ),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${GEORGIAN_SITE_URL}/quiz/namdvili-nishani`,
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return METADATA_KA;
  if (locale === "pl") {
    const title = "Jakim znakiem zodiaku naprawdę jesteś? Quiz | Vivida";
    const description =
      "Odpowiedz na 12 pytań i sprawdź, który znak zodiaku najlepiej pasuje do Twojego charakteru. Szybki i darmowy quiz online.";
    const url = `${ENGLISH_SITE_URL}/pl/quiz/prawdziwy-znak-zodiaku`;
    return {
      title: { absolute: title },
      description,
      keywords: [
        "quiz jaki znak zodiaku",
        "jakim znakiem zodiaku jestem",
        "test znaku zodiaku",
        "darmowy quiz astrologiczny",
        "prawdziwy znak zodiaku quiz",
      ],
      alternates: localizedAlternates(
        "/quiz/namdvili-nishani",
        "/quiz/namdvili-nishani",
        "pl",
      ),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url,
        title,
        description,
        siteName: "Vivida",
        locale: "pl_PL",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const title = "Which Zodiac Sign Matches Your Personality? Quiz";
  const description =
    "Answer 12 playful questions to discover which zodiac sign’s element and modality best match your personality. Free and instant.";
  const url = `${ENGLISH_SITE_URL}/quiz/namdvili-nishani`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      "zodiac personality quiz",
      "which zodiac sign am I",
      "zodiac sign test",
      "free astrology quiz",
    ],
    alternates: localizedAlternates(
      "/quiz/namdvili-nishani",
      "/quiz/namdvili-nishani",
      "en",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TrueSignQuizPage() {
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
  const pageUrl = pl
    ? `${ENGLISH_SITE_URL}/pl/quiz/prawdziwy-znak-zodiaku`
    : `${siteUrl}/quiz/namdvili-nishani`;
  const title = pl
    ? "Jakim znakiem zodiaku naprawdę jesteś?"
    : en
      ? "Which Zodiac Sign Matches Your Personality?"
      : TITLE;
  const description = pl
    ? `Odpowiedz na ${TS_QUESTION_COUNT} pytań i sprawdź, który znak zodiaku najlepiej pasuje do Twojego charakteru.`
    : en
      ? "Answer 12 playful questions to discover which zodiac sign’s element and modality best match your personality."
      : DESCRIPTION;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: title,
      description,
      inLanguage: pl ? "pl-PL" : en ? "en" : "ka-GE",
      url: pageUrl,
      numberOfQuestions: TS_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: pl ? "Znaki zodiaku" : en ? "Zodiac signs" : "ზოდიაქოს ნიშნები",
        alternateName: pl ? "zodiak" : en ? "zodiac" : "ზოდიაქო",
      },
    },
    breadcrumbLd([
      {
        name: pl ? "Strona główna" : en ? "Home" : "მთავარი",
        url: pl ? `${ENGLISH_SITE_URL}/pl` : siteUrl,
      },
      {
        name: pl ? "Testy" : en ? "Tests" : "ტესტები",
        url: pl ? `${ENGLISH_SITE_URL}/pl/tests` : `${siteUrl}/tests`,
      },
      {
        name: pl
          ? "Quiz prawdziwy znak"
          : en
            ? "Zodiac personality quiz"
            : "რომელი ნიშანი ხარ",
        url: pageUrl,
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
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader
          active="tests"
          locale={locale}
          georgianPath="/quiz/namdvili-nishani"
        />
      )}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-6 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {pl ? "Quiz Vivida" : "Vivida Quiz"}
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {pl
              ? "Jakim znakiem zodiaku"
              : en
                ? "Which zodiac sign"
                : "რომელი ნიშანი ხარ"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {pl
                ? "naprawdę jesteś?"
                : en
                  ? "matches your personality?"
                  : "სინამდვილეში?"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
            {pl ? (
              `Odpowiedz na ${TS_QUESTION_COUNT} pytań i dowiedz się, jaka energia zodiaku najbardziej odpowiada Twojej osobowości, nawet jeśli różni się od Twojego znaku urodzenia.`
            ) : en ? (
              `Answer ${TS_QUESTION_COUNT} questions to discover which zodiac sign’s energy best matches your character, even if it differs from your birth sign.`
            ) : (
              <>
                უპასუხე {TS_QUESTION_COUNT} კითხვას და გაიგე, რომელი ზოდიაქოს
                ნიშნის ენერგია შეესაბამება შენს ხასიათს, შესაძლოა, შედეგი
                დაბადების ნიშანს არ დაემთხვეს.
              </>
            )}
          </p>
        </header>

        <TrueSignQuiz locale={locale} />

        <div className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">
            {pl
              ? "Jak działa ten quiz?"
              : en
                ? "How does the quiz work?"
                : "როგორ მუშაობს ტესტი?"}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl ? (
              <>
                Każdy znak zodiaku łączy <strong>żywioł</strong> (Ogień, Ziemia,
                Powietrze lub Woda) oraz <strong>jakość</strong> (Kardynalna,
                Stała lub Zmienna). Twoje odpowiedzi pozwalają określić
                dominującą parę, której przecięcie wskazuje jeden z dwunastu
                znaków zodiaku.
              </>
            ) : en ? (
              <>
                Every zodiac sign combines an <strong>element</strong> (Fire,
                Earth, Air or Water) with a <strong>modality</strong> (Cardinal,
                Fixed or Mutable). Your answers estimate the dominant pair,
                whose intersection points to one of the twelve signs.
              </>
            ) : (
              <>
                ყოველი ზოდიაქოს ნიშანი ორი რამის კომბინაციაა,{" "}
                <strong>ელემენტი</strong> (ცეცხლი, მიწა, ჰაერი, წყალი) და{" "}
                <strong>დინამიკა</strong> (კარდინალური, ფიქსირებული,
                მუტაბელური). ტესტი შენი პასუხებით განსაზღვრავს, რომელი ელემენტი
                და დინამიკა ჭარბობს შენში, მათი გადაკვეთა კი ერთ-ერთ 12 ნიშანს
                განსაზღვრავს. ეს არის ნიშანი, რომლის თვისებებიც შენს ხასიათს
                ყველაზე მეტად შეესაბამება.
              </>
            )}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            {pl ? (
              <>
                Pamiętaj: to quiz o charakterze rozrywkowym. Twój rzeczywisty{" "}
                <strong>znak urodzenia</strong> wynika z daty i godziny Twoich
                narodzin, co możesz sprawdzić w bezpłatnym horoskopie
                urodzeniowym.
              </>
            ) : en ? (
              <>
                Remember: this is an entertainment quiz. Your actual{" "}
                <strong>birth sign</strong> is determined by your date and time
                of birth, which you can explore in a free natal chart.
              </>
            ) : (
              <>
                გახსოვდეს: ეს გასართობი ტესტია. შენი{" "}
                <strong>ნამდვილი დაბადების ნიშანი</strong> დაბადების თარიღით
                განისაზღვრება, მას უფასო ნატალურ რუკაში ნახავ.
              </>
            )}
          </p>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
