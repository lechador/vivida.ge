import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { TrueSignQuiz } from "@/components/true-sign/true-sign-quiz";
import { PopularSearches } from "@/components/seo/popular-searches";
import { TS_QUESTION_COUNT } from "@/lib/true-sign/quiz";
import { TRUE_SIGN_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";
const TITLE = "რომელი ზოდიაქოს ნიშანი ხარ სინამდვილეში? — ტესტი";
const DESCRIPTION =
  "გაიარე უფასო ტესტი და გაიგე, რომელი ზოდიაქოს ნიშნის ენერგია შეესაბამება შენს ხასიათს — შედეგი შეიძლება დაბადების ნიშანს არ ემთხვეოდეს. სწრაფი და სახალისო ქვიზი ქართულად.";

export const metadata: Metadata = {
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
  alternates: { canonical: `${SITE_URL}/quiz/namdvili-nishani` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/quiz/namdvili-nishani`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function TrueSignQuizPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: `${SITE_URL}/quiz/namdvili-nishani`,
      numberOfQuestions: TS_QUESTION_COUNT,
      about: {
        "@type": "Thing",
        name: "ზოდიაქოს ნიშნები",
        alternateName: ["ზოდიაქო", "ასტროლოგია", "პიროვნების ტესტი"],
      },
    },
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "რომელი ნიშანი ხარ", url: `${SITE_URL}/quiz/namdvili-nishani` },
    ]),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-6 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida Quiz
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            რომელი ნიშანი ხარ{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              სინამდვილეში?
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
            უპასუხე {TS_QUESTION_COUNT} კითხვას და გაიგე, რომელი ზოდიაქოს ნიშნის
            ენერგია შეესაბამება შენს ხასიათს — შესაძლოა, შედეგი დაბადების ნიშანს არ დაემთხვეს.
          </p>
        </header>

        <TrueSignQuiz />

        <div className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">
            როგორ მუშაობს ტესტი?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            ყოველი ზოდიაქოს ნიშანი ორი რამის კომბინაციაა — <strong>ელემენტი</strong>{" "}
            (ცეცხლი, მიწა, ჰაერი, წყალი) და <strong>დინამიკა</strong> (კარდინალური,
            ფიქსირებული, მუტაბელური). ტესტი შენი პასუხებით განსაზღვრავს, რომელი
            ელემენტი და დინამიკა ჭარბობს შენში — მათი გადაკვეთა კი ერთ-ერთ 12
            ნიშანს განსაზღვრავს. ეს არის ნიშანი, რომლის თვისებებიც შენს ხასიათს
            ყველაზე მეტად შეესაბამება.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            გახსოვდეს: ეს გასართობი ტესტია. შენი{" "}
            <strong>ნამდვილი დაბადების ნიშანი</strong> დაბადების თარიღით
            განისაზღვრება — მას უფასო ნატალურ რუკაში ნახავ.
          </p>

          <PopularSearches queries={TRUE_SIGN_LATIN_QUERIES} />
        </div>
      </section>
    </main>
  );
}
