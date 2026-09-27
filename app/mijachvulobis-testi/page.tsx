import type { Metadata } from "next";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { AttachmentTest } from "@/components/attachment/attachment-test";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/mijachvulobis-testi";
const TITLE = "მიჯაჭვულობის სტილის ტესტი — როგორ გიყვარს?";
const DESCRIPTION =
  "გაიარე მიჯაჭვულობის 24-კითხვიანი ტესტი ქართულად. გაიგე შენი სტილი — უსაფრთხო, შფოთიანი, აცილებადი თუ შიშით-აცილებადი — და მიიღე პერსონალური განმარტება ურთიერთობებისთვის.";

export const metadata: Metadata = {
  title: { absolute: TITLE + " — Vivida" },
  description: DESCRIPTION,
  keywords: [
    "მიჯაჭვულობის ტესტი",
    "მიჯაჭვულობის სტილი",
    "attachment test ქართულად",
    "შფოთიანი მიჯაჭვულობა",
    "აცილებადი მიჯაჭვულობა",
    "ფსიქოლოგიური ტესტი ქართულად",
    "ურთიერთობის ტესტი",
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
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQ = [
  {
    q: "რას ზომავს მიჯაჭვულობის ტესტი?",
    a: "ის ზომავს ორ განზომილებას: შფოთს (მიტოვების შიში, დადასტურების საჭიროება) და აცილებას (სიახლოვის დისკომფორტი, დამოუკიდებლობისკენ მიდრეკილება). ამ ორის კომბინაცია ოთხ სტილს იძლევა — უსაფრთხო, შფოთიანი, აცილებადი და შიშით-აცილებადი.",
  },
  {
    q: "როგორ ითვლება შედეგი?",
    a: "24 დებულებიდან 12 შფოთს ზომავს, 12 — აცილებას. თითოეული ფასდება 1-დან 5 ქულამდე, ნაწილი შებრუნებულად. თითო ღერძი 0-დან 100-მდე ნორმდება, სტილი კი რუკის კვადრანტით განისაზღვრება.",
  },
  {
    q: "არის ეს ფსიქოლოგიური დიაგნოზი?",
    a: "არა. ტესტი თვითრეფლექსიისა და ურთიერთობების გასაგებადაა. მიჯაჭვულობის სტილი განაჩენი არ არის — ის ცხოვრების გამოცდილებით იცვლება და შეგნებული მუშაობით უსაფრთხოსკენ იხრება.",
  },
  {
    q: "ინახება ჩემი პასუხები?",
    a: "არა. პასუხები და შედეგი უშუალოდ შენს ბრაუზერში ითვლება, Vivida-ს სერვერზე არ იგზავნება და გვერდის განახლების შემდეგ ქრება.",
  },
];

export default async function AttachmentTestPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: "მიჯაჭვულობის სტილის ტესტი ქართულად",
      description: DESCRIPTION,
      inLanguage: "ka-GE",
      url: SITE_URL + PATH,
      numberOfQuestions: 24,
      about: {
        "@type": "Thing",
        name: "მიჯაჭვულობის სტილი",
        alternateName: "Attachment style",
      },
    },
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: SITE_URL + "/tests" },
      { name: "მიჯაჭვულობის ტესტი", url: SITE_URL + PATH },
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
            Vivida · Attachment Style Test
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            როგორ{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-pink),var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-transparent">
              გიყვარს?
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
            უპასუხე 24 მოკლე დებულებას და გაიგე შენი მიჯაჭვულობის სტილი — რატომ
            ღელავ, რატომ დისტანცირდები და რა სჭირდება შენს ურთიერთობას.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="size-3.5" />
              24 კითხვა
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              დაახლოებით 5 წუთი
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              პასუხები არ ინახება
            </span>
          </div>
        </header>

        <AttachmentTest />
      </section>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            ოთხი სტილი მოკლედ
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-cyan)]">
                ⚓ უსაფრთხო
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                სიახლოვეც კომფორტულია და დამოუკიდებლობაც. კონფლიქტი პრობლემაა და
                არა კატასტროფა.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-pink)]">
                🌊 შფოთიანი
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                კავშირი ძალიან მნიშვნელოვანია, ამიტომ დისტანცია მტკივნეულად
                აღიქმება და დადასტურებაა საჭირო.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[oklch(0.82_0.16_85)]">
                🏔️ აცილებადი
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                დამოუკიდებლობა ძვირფასია, გადაჭარბებული სიახლოვე კი წნეხად
                აღიქმება და სივრცეა საჭირო.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/30 p-4">
              <h3 className="text-sm font-semibold text-[var(--vivida-violet)]">
                🌗 შიშით-აცილებადი
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                სიახლოვეც გინდა და გეშინია კიდეც — საქანელა მონატრებასა და
                მოშორებას შორის.
              </p>
            </article>
          </div>

          <h2 className="mt-7 text-xl font-semibold tracking-tight">
            როგორ ითვლება ქულა?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            12 პუნქტი შფოთს ზომავს, 12 — აცილებას. თითოეული 1–5 ქულაა, ნაწილი
            შებრუნებულად ითვლება. თითო ღერძი 0–100-ზე ნორმდება, სტილი კი
            კვადრანტით განისაზღვრება: ორივე 50-ზე დაბლა — უსაფრთხო; შფოთი 50-ზე
            მაღლა — შფოთიანი; აცილება 50-ზე მაღლა — აცილებადი; ორივე მაღლა —
            შიშით-აცილებადი.
          </p>

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
