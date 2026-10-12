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

const SITE_URL = "https://www.vivida.ge";
const PATH = "/tvit-shepasebis-testi";
const TITLE = "თვითშეფასების ტესტი, Rosenberg-ის 10-კითხვიანი სკალა";
const DESCRIPTION =
  "გაიარე Rosenberg-ის თვითშეფასების 10-კითხვიანი ტესტი ქართულად. მიიღე 0-30 ქულა, ფრთხილი განმარტება და შენს პასუხებზე მორგებული რეფლექსიის თემები.";

export const metadata: Metadata = {
  title: { absolute: TITLE + ", Vivida" },
  description: DESCRIPTION,
  keywords: [
    "თვითშეფასების ტესტი",
    "როზენბერგის ტესტი",
    "Rosenberg Self-Esteem Scale ქართულად",
    "ფსიქოლოგიური ტესტი ქართულად",
    "დაბალი თვითშეფასება",
  ],
  alternates: { canonical: SITE_URL + PATH },
  openGraph: {
    type: "website",
    url: SITE_URL + PATH,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

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

export default async function SelfEsteemTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "Rosenberg-ის თვითშეფასების ტესტი ქართულად",
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: SITE_URL + PATH,
      numberOfQuestions: 10,
      about: {
        "@type": "Thing",
        name: "თვითშეფასება",
        alternateName: "Self-esteem",
      },
      author: { "@type": "Person", name: "Morris Rosenberg" },
    },
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: SITE_URL + "/tests" },
      { name: "თვითშეფასების ტესტი", url: SITE_URL + PATH },
    ]),
    faqLd(FAQ),
  ];

  return (
    <main
      lang="ka"
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
        <SmartHeader active="tests" />
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <header className="mb-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Vivida · Rosenberg Self-Esteem Scale
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            როგორ უყურებ{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
              საკუთარ თავს?
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
            უპასუხე ათ მოკლე დებულებას და ნახე, რამდენად მყარია საკუთარი
            ღირებულების, შესაძლებლობებისა და თავის პატივისცემის განცდა.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="size-3.5" />
              10 კითხვა
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              დაახლოებით 2 წუთი
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              პასუხები არ ინახება
            </span>
          </div>
        </header>

        <RosenbergTest />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რას ზომავს ეს ტესტი?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Rosenberg-ის სკალა ზომავს გლობალურ თვითშეფასებას, არა ერთ კონკრეტულ
            უნარს ან გარეგნობით კმაყოფილებას, არამედ საკუთარ თავთან საერთო
            დამოკიდებულებას. მაღალი ქულა ნიშნავს უფრო მყარ მიღებასა და
            თვითპატივისცემას; ის არ ნიშნავს ნარცისიზმს ან სხვებზე აღმატებულობას.
          </p>

          <h2 className="mt-7 text-xl font-semibold tracking-tight">
            როგორ ითვლება ქულა?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            თითოეული პასუხი 0–3 ქულაა. დადებითად ფორმულირებული 1, 3, 4, 7 და 10
            პუნქტები პირდაპირ, ხოლო უარყოფითად ფორმულირებული 2, 5, 6, 8 და 9
            პუნქტები შებრუნებულად ითვლება. ჯამური ქულაა 0–30. ტესტში ნეიტრალური
            პასუხი განზრახ არ არის, ეს ორიგინალი ოთხპასუხიანი ფორმატის ნაწილია.
          </p>

          <div className="mt-7 rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/7 p-4 text-sm leading-relaxed text-foreground/80">
            <strong className="font-semibold text-foreground">წყარო:</strong>{" "}
            Morris Rosenberg, <em>Society and the Adolescent Self-Image</em>{" "}
            (1965).{" "}
            <Link
              href="https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--vivida-cyan)] underline underline-offset-2"
            >
              University of Maryland-ის მიხედვით, სკალა საჯარო დომენშია
            </Link>
            ; კითხვების ფორმატი და დათვლის წესი კი გადამოწმებულია{" "}
            <Link
              href="https://www.apa.org/obesity-guideline/rosenberg-self-esteem.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--vivida-cyan)] underline underline-offset-2"
            >
              APA-ს გამოქვეყნებულ ვერსიასთან
            </Link>
            .
          </div>

          <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
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

      <SiteFooter />
    </main>
  );
}
