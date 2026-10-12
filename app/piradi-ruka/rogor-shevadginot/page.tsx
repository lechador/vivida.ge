import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/locales";

const SITE = "https://www.vivida.ge";
const URL = `${SITE}/piradi-ruka/rogor-shevadginot`;

const FAQ = [
  {
    q: "როგორ შევადგინო პირადი რუკა ონლაინ?",
    a: "მოამზადე დაბადების თარიღი, ზუსტი დრო და ქალაქი, შეიყვანე ისინი პირადი რუკის კალკულატორში და დააჭირე გამოთვლას. შედეგად მიიღებ პლანეტების ნიშნებს, ასცენდენტს, 12 სახლსა და ასპექტებს.",
  },
  {
    q: "რომელი საიტი ადგენს პირად რუკას ქართულად?",
    a: "Vivida-ს პირადი რუკის კალკულატორი შედეგს ქართულად აჩვენებს, საბაზისო გამოთვლა უფასოა და რეგისტრაციას არ საჭიროებს.",
  },
  {
    q: "შეიძლება პირადი რუკის შედგენა დაბადების დროის გარეშე?",
    a: "შეიძლება, მაგრამ ასცენდენტი და 12 სახლი სანდოდ ვერ განისაზღვრება. პლანეტების უმეტესობის ზოდიაქოს ნიშნები კვლავ გამოსადეგი იქნება.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "როგორ შევადგინოთ პირადი რუკა ონლაინ, სრული ინსტრუქცია" },
  description:
    "როგორ შევადგინოთ პირადი რუკა ონლაინ, უფასოდ და ქართულად: საჭირო მონაცემები, ზუსტი საიტის არჩევა, ასცენდენტი, 12 სახლი და შედეგის წაკითხვა.",
  keywords: [
    "როგორ შევადგინოთ პირადი რუკა",
    "როგორ შევადგინო პირადი რუკა",
    "პირადი რუკის შედგენა საიტები",
    "პირადი რუკის შედგენა ონლაინ",
    "პირადი რუკის შედგენა უფასოდ",
    "პირადი რუკა ქართულად",
  ],
  alternates: { canonical: URL },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "article",
    url: URL,
    title: "როგორ შევადგინოთ პირადი რუკა ონლაინ",
    description: "ნაბიჯ-ნაბიჯ ინსტრუქცია და უფასო ქართული კალკულატორი.",
    locale: "ka_GE",
    siteName: "Vivida",
  },
};

const STEPS = [
  {
    title: "მოამზადე დაბადების თარიღი",
    body: "რიცხვი, თვე და წელი განსაზღვრავს, რომელ ნიშნებში იმყოფებოდნენ მზე, მთვარე და პლანეტები.",
  },
  {
    title: "დააზუსტე დაბადების დრო",
    body: "საათი და წუთი განსაკუთრებით საჭიროა ასცენდენტისა და 12 სახლის გამოსათვლელად. თუ დრო არ იცი, გადაამოწმე დაბადების მოწმობა ან ჰკითხე ოჯახის წევრებს.",
  },
  {
    title: "მიუთითე დაბადების ქალაქი",
    body: "ქალაქი განსაზღვრავს გეოგრაფიულ კოორდინატებსა და დროის სარტყელს. აირჩიე დაბადების ადგილი და არა ქალაქი, სადაც ახლა ცხოვრობ.",
  },
  {
    title: "გამოთვალე და შეამოწმე შედეგი",
    body: "ჯერ ნახე დიდი სამეული, მზე, მთვარე და ასცენდენტი, შემდეგ გადადი პლანეტებზე, სახლებზე და ასპექტებზე.",
  },
];

export default function HowToNatalChartPage() {
  const ld = [
    articleLd({
      url: URL,
      headline: "როგორ შევადგინოთ პირადი რუკა ონლაინ",
      description: "პირადი ასტროლოგიური რუკის შედგენის ნაბიჯ-ნაბიჯ ინსტრუქცია ქართულად.",
      datePublished: "2026-07-20T00:00:00+04:00",
      dateModified: "2026-07-20T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE },
      { name: "პირადი რუკა", url: `${SITE}/piradi-ruka` },
      { name: "როგორ შევადგინოთ", url: URL },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "როგორ შევადგინოთ პირადი რუკა ონლაინ",
      description: "პირადი რუკის უფასოდ შედგენის ოთხი ნაბიჯი.",
      totalTime: "PT3M",
      step: STEPS.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
        url: `${URL}#step-${index + 1}`,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />

      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/piradi-ruka" className="hover:text-foreground">პირადი რუკა</Link> / ინსტრუქცია
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">ნაბიჯ-ნაბიჯ · 3 წუთი</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">როგორ შევადგინოთ პირადი რუკა ონლაინ?</h1>
          <p className="mt-5 text-pretty text-lg leading-8 text-foreground/80">პირადი რუკის შედგენას სპეციალური ცოდნა არ სჭირდება. საჭიროა დაბადების სამი მონაცემი და საიტი, რომელიც სწორად ითვლის დროის სარტყელს, ასცენდენტს, სახლებსა და ასპექტებს.</p>
          <Link href="/piradi-ruka" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white">შეადგინე რუკა უფასოდ <ArrowRight className="size-4" /></Link>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">პირადი რუკის შედგენა 4 ნაბიჯში</h2>
          <ol className="mt-6 space-y-4">
            {STEPS.map((step, index) => (
              <li key={step.title} id={`step-${index + 1}`} className="scroll-mt-24 rounded-2xl border border-border bg-card/55 p-5 backdrop-blur-xl">
                <div className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)] text-sm font-bold text-white">{index + 1}</span>
                  <div><h3 className="text-lg font-semibold">{step.title}</h3><p className="mt-2 leading-7 text-foreground/78">{step.body}</p></div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">როგორ ავირჩიოთ პირადი რუკის შესადგენი საიტი</h2>
          <p className="mt-4 leading-8 text-foreground/80">საიტი უნდა ითვალისწინებდეს დაბადების ზუსტ ადგილს, დროის სარტყელსა და ზაფხულის დროის ისტორიულ ცვლილებებს. შედეგში ეძებე არა მხოლოდ მზის ნიშანი, არამედ მთვარე, ასცენდენტი, პლანეტები, 12 სახლი და ძირითადი ასპექტები.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {["ქალაქის ზუსტი მოძებნა", "ასცენდენტი და 12 სახლი", "პლანეტების ასპექტები", "ქართული განმარტებები", "გამჭვირვალე უფასო ფუნქციები", "მობილურზე მარტივი გამოყენება"].map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 p-3 text-sm"><CheckCircle2 className="size-4 shrink-0 text-[var(--vivida-cyan)]" />{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">რა წავიკითხოთ პირველად?</h2>
          <p className="mt-4 leading-8 text-foreground/80">დაიწყე დიდი სამეულით: მზე აღწერს იდენტობის ბირთვს, მთვარე, ემოციურ საჭიროებებს, ასცენდენტი კი სამყაროსთან ურთიერთობის სტილს. შემდეგ ნახე, რომელ სახლებში არიან პლანეტები და რა ასპექტები აკავშირებს მათ. უფრო ვრცელი ახსნა მოცემულია <Link href="/nataluri-ruka" className="text-[var(--vivida-violet)] underline-offset-4 hover:underline">ნატალური რუკის გვერდზე</Link>.</p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">ხშირად დასმული კითხვები</h2>
          <div className="mt-5 space-y-3">{FAQ.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div>
        </section>

        <div className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center">
          <h2 className="text-2xl font-semibold">მზად ხარ შენი რუკისთვის?</h2>
          <p className="mt-2 text-sm text-foreground/75">გამოთვლა უფასოა, ქართულად და რეგისტრაციის გარეშე.</p>
          <Link href="/piradi-ruka" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white">პირადი რუკის შედგენა <ArrowRight className="size-4" /></Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
