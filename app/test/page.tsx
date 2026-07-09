import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { getMbtiQuestions } from "@/lib/mbti-questions-db";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { MbtiTestClient } from "@/components/mbti/mbti-test-client";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "პიროვნების ტესტი — Astro-MBTI ქართულად (უფასო)";
const DESCRIPTION =
  "გაიარე უფასო პიროვნების ტესტი ქართულად — 60 კითხვა, ~7 წუთი. გაიგე შენი MBTI ტიპი 16-დან, ძლიერი და სუსტი მხარეები, ურთიერთობები და კარიერა. რეგისტრაციის გარეშე.";

export const metadata: Metadata = {
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
  ],
  alternates: { canonical: `${SITE_URL}/test` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/test`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

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
 * login (handled at /test/claim). Header adapts to auth state.
 */
export default async function TestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";
  const questions = await getMbtiQuestions();

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Astro-MBTI პიროვნების ტესტი",
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: `${SITE_URL}/test`,
      educationalLevel: "beginner",
      numberOfQuestions: questions.length,
      about: {
        "@type": "Thing",
        name: "პიროვნების ტიპი (MBTI)",
        alternateName: ["MBTI", "16 personalities", "პიროვნების ტესტი"],
      },
    },
    faqLd(TEST_FAQ),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "პიროვნების ტესტი", url: `${SITE_URL}/test` },
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

      {authed ? <AppHeader authed plan={plan} /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Astro-MBTI
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            შენი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ფსიქოლოგიური ტიპი
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-foreground/80 sm:text-base">
            60 კითხვა. აღმოაჩინე შენი MBTI ტიპი, შერწყმული შენს ნატალურ
            რუკასთან — ღრმა, პერსონალური ანალიზი.
          </p>
        </header>

        <MbtiTestClient questions={questions} />
      </section>
    </main>
  );
}
