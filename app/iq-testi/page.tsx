import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { IqTestClient } from "@/components/iq/iq-test";
import { IQ_ADAPTIVE_LENGTH } from "@/lib/iq/adaptive";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "IQ ტესტი — უფასო ინტელექტის ტესტი ქართულად";
const DESCRIPTION =
  "გაიარე უფასო IQ ტესტი ქართულად — ადაპტიური ტესტი, რომელიც შენს დონეს ერგება: ლოგიკური, რიცხვითი და სივრცითი აზროვნების 25 დავალება, ~25 წუთი. მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების ანალიზი. კულტურულად ნეიტრალური, რეგისტრაციის გარეშე.";

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
      numberOfQuestions: IQ_ADAPTIVE_LENGTH,
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
            {IQ_ADAPTIVE_LENGTH} დავალება · ~25 წუთი · ადაპტიური
          </p>
        </header>

        <IqTestClient />
      </section>

      {/* SEO / informational content — below the fold, indexable. */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რა არის IQ ტესტი?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            IQ (ინტელექტის კოეფიციენტი) ზომავს აბსტრაქტულ აზროვნებას — რამდენად
            კარგად ამჩნევ კანონზომიერებებს, აგებ ლოგიკურ დასკვნებს და აგვარებ
            ახალ, უცნობ ამოცანებს. Vivida-ს ტესტი <strong>კულტურულად ნეიტრალურია</strong>:
            დავალებების უმეტესობა ფიგურებსა და რიცხვებზეა აგებული, ასე რომ შედეგი
            ნაკლებად არის დამოკიდებული ენასა თუ განათლებაზე.
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            როგორ ითვლება შენი ქულა?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            ტესტი აფასებს პასუხების <strong>პატერნს</strong>, და არა უბრალოდ სწორი
            პასუხების რაოდენობას — რთული დავალების სწორად ამოხსნა უფრო მეტს მატებს
            შედეგს, ვიდრე მარტივის. ეს არის იგივე პრინციპი (Item Response Theory),
            რომელსაც პროფესიული ტესტები იყენებენ. შემდეგ ქულა გადაჰყავს
            სტანდარტულ IQ სკალაზე, სადაც <strong>საშუალო არის 100</strong>, ხოლო
            მოსახლეობის დაახლოებით 68% თავსდება 85-დან 115-მდე დიაპაზონში.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { t: "რიცხვითი ლოგიკა", d: "რიცხვთა მიმდევრობები და კანონზომიერებები" },
              { t: "ლოგიკური აზროვნება", d: "დასკვნები, ანალოგიები, გამონაკლისები" },
              { t: "სივრცითი აზროვნება", d: "ფიგურების ბრუნვა და სივრცული პატერნები" },
              { t: "პატერნების ამოცნობა", d: "მატრიცული ვიზუალური მსჯელობა (Raven-ის სტილი)" },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-border bg-background/40 px-4 py-3.5"
              >
                <div className="text-sm font-semibold">{x.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{x.d}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="mt-4 space-y-3">
            {IQ_FAQ.map((item) => (
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
      </section>
    </main>
  );
}
