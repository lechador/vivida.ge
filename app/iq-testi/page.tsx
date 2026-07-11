import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { IqTestClient } from "@/components/iq/iq-test";
import { IQ_ITEM_COUNT } from "@/lib/iq/items";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "IQ ტესტი — უფასო ინტელექტის ტესტი ქართულად";
const DESCRIPTION =
  "გაიარე უფასო IQ ტესტი ქართულად — ლოგიკური, რიცხვითი და სივრცითი აზროვნების 28 დავალება, ~25 წუთი. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების ანალიზი. კულტურულად ნეიტრალური, რეგისტრაციის გარეშე.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "iq ტესტი",
    "iq ტესტი ქართულად",
    "ინტელექტის ტესტი",
    "ინტელექტის ტესტი ქართულად",
    "აიქიუ ტესტი",
    "უფასო iq ტესტი",
    "ლოგიკური ტესტი",
    "ინტელექტის კოეფიციენტი",
  ],
  alternates: { canonical: `${SITE_URL}/iq-testi` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/iq-testi`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const IQ_FAQ = [
  {
    q: "როგორ ითვლება IQ ქულა?",
    a: "შენი პასუხების პატერნი ფასდება დავალებების სირთულის მიხედვით (Rasch/IRT მოდელი), შემდეგ გადაჰყავს სტანდარტულ IQ სკალაზე — საშუალო 100, სტანდარტული გადახრა 15.",
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

/**
 * Free, timed, culture-fair IQ test. Anyone can take it; the score is computed
 * client-side (see /iq-testi/shedegi), the deep domain breakdown is gated
 * behind login. Header adapts to auth state (sidebar for signed-in users).
 */
export default async function IqTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Vivida IQ ტესტი",
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: `${SITE_URL}/iq-testi`,
      educationalLevel: "beginner",
      numberOfQuestions: IQ_ITEM_COUNT,
      about: {
        "@type": "Thing",
        name: "ინტელექტის კოეფიციენტი (IQ)",
        alternateName: ["IQ", "ინტელექტის ტესტი", "iq ტესტი"],
      },
    },
    faqLd(IQ_FAQ),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "IQ ტესტი", url: `${SITE_URL}/iq-testi` },
    ]),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_265/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_190/0.4),transparent_70%),radial-gradient(40%_35%_at_15%_80%,oklch(0.30_0.16_300/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14 sm:pt-6">
        <header className="mb-5 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida IQ
          </div>
          <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            შენი{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ინტელექტის ტესტი
            </span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {IQ_ITEM_COUNT} დავალება · ~25 წუთი · კულტურულად ნეიტრალური
          </p>
        </header>

        <IqTestClient />
      </section>
    </main>
  );
}
