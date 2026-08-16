import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Orbit, UserRound } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/locales";

const SITE = "https://www.vivida.ge";
const URL = `${SITE}/piradi-horoskopi`;
const FAQ = [
  { q: "რა არის პირადი ჰოროსკოპი?", a: "პირადი ჰოროსკოპი არის პროგნოზი, რომელიც შენს დაბადების რუკასა და მიმდინარე პლანეტების მოძრაობას ერთმანეთს ადარებს." },
  { q: "რით განსხვავდება პირადი ჰოროსკოპი ზოდიაქოს პროგნოზისგან?", a: "ზოდიაქოს პროგნოზი ძირითადად მხოლოდ მზის ნიშანს ეყრდნობა, პირადი პროგნოზი კი დაბადების დროს, ადგილს, ასცენდენტს, სახლებსა და ყველა პლანეტას ითვალისწინებს." },
  { q: "რა მჭირდება პირადი ჰოროსკოპის მისაღებად?", a: "დაბადების თარიღი, დაბადების ადგილი და სასურველია ზუსტი დრო. ჯერ შექმენი პირადი რუკა, შემდეგ მიმდინარე ტრანზიტები მასზე პერსონალურად განიმარტება." },
];

export const metadata: Metadata = {
  title: { absolute: "პირადი ჰოროსკოპი — პერსონალური ასტროლოგიური პროგნოზი" },
  description: "რა არის პირადი ჰოროსკოპი და რით განსხვავდება ზოგადი პროგნოზისგან. შექმენი პირადი რუკა და მიიღე დაბადების მონაცემებზე მორგებული ასტროლოგიური ანალიზი ქართულად.",
  keywords: ["პირადი ჰოროსკოპი", "პერსონალური ჰოროსკოპი", "პირადი ასტროლოგიური პროგნოზი", "ჰოროსკოპი დაბადების თარიღით", "პირადი რუკა"],
  alternates: { canonical: URL },
  openGraph: { images: [DEFAULT_OG_IMAGE], type: "article", url: URL, title: "პირადი ჰოროსკოპი — შენს რუკაზე მორგებული პროგნოზი", description: "გაიგე, როგორ იქმნება პერსონალური ჰოროსკოპი დაბადების რუკისა და მიმდინარე ტრანზიტების მიხედვით.", locale: "ka_GE", siteName: "Vivida" },
};

export default function PersonalHoroscopePage() {
  const ld = [
    articleLd({ url: URL, headline: "პირადი ჰოროსკოპი — პერსონალური ასტროლოგიური პროგნოზი", description: "პირადი ჰოროსკოპის სრული ქართული გზამკვლევი.", datePublished: "2026-07-20T00:00:00+04:00", dateModified: "2026-07-20T00:00:00+04:00" }),
    breadcrumbLd([{ name: "მთავარი", url: SITE }, { name: "პირადი ჰოროსკოპი", url: URL }]),
    faqLd(FAQ),
  ];
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">პერსონალური ასტროლოგია</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">პირადი ჰოროსკოპი</h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-foreground/80">ზოგადი ჰოროსკოპი ერთ ზოდიაქოს ნიშანს აღწერს. პირადი ჰოროსკოპი კი შენს დაბადების ზუსტ რუკას მიმდინარე ცასთან ადარებს — ამიტომ პროგნოზი მხოლოდ შენზეა მორგებული.</p>
          <Link href="/piradi-ruka" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white">ჯერ შექმენი პირადი რუკა <ArrowRight className="size-4" /></Link>
        </header>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">როგორ იქმნება პერსონალური პროგნოზი</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: UserRound, title: "დაბადების რუკა", body: "შენი პლანეტები, ასცენდენტი და 12 სახლი." },
              { Icon: Orbit, title: "მიმდინარე ტრანზიტები", body: "სად არიან პლანეტები დღეს ან არჩეულ პერიოდში." },
              { Icon: CalendarDays, title: "პირადი ინტერპრეტაცია", body: "როგორ ეხება ეს მოძრაობა კონკრეტულად შენს რუკას." },
            ].map(({ Icon, title, body }) => <div key={title} className="rounded-2xl border border-border bg-card/55 p-5"><Icon className="size-5 text-[var(--vivida-cyan)]" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-foreground/72">{body}</p></div>)}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">პირადი ჰოროსკოპი და ზოდიაქოს ჰოროსკოპი — განსხვავება</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-2 bg-card/80 text-sm font-semibold"><div className="p-4">ზოგადი ჰოროსკოპი</div><div className="border-l border-border p-4">პირადი ჰოროსკოპი</div></div>
            {[["ეფუძნება ძირითადად მზის ნიშანს", "ეფუძნება მთელ ნატალურ რუკას"], ["ერთნაირია ერთი ნიშნის მილიონობით ადამიანისთვის", "ითვალისწინებს შენს დროსა და ადგილს"], ["იძლევა ფართო ტენდენციას", "აჩვენებს ტრანზიტებს შენს სახლებსა და პლანეტებზე"]].map(([general, personal]) => <div key={general} className="grid grid-cols-2 border-t border-border text-sm leading-6 text-foreground/75"><div className="p-4">{general}</div><div className="border-l border-border p-4">{personal}</div></div>)}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">რა მონაცემებია საჭირო?</h2>
          <p className="mt-4 leading-8 text-foreground/80">ზუსტი პერსონალიზაციისთვის საჭიროა დაბადების თარიღი, ქალაქი და დრო. დრო განსაზღვრავს ასცენდენტსა და სახლებს — ანუ ცხოვრების რომელ სფეროზე მოქმედებს კონკრეტული ტრანზიტი. დაიწყე <Link href="/piradi-ruka/rogor-shevadginot" className="text-[var(--vivida-violet)] underline-offset-4 hover:underline">პირადი რუკის შედგენის ინსტრუქციით</Link>.</p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">ხშირად დასმული კითხვები</h2>
          <div className="mt-5 space-y-3">{FAQ.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div>
        </section>

        <div className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center"><h2 className="text-2xl font-semibold">შექმენი შენი ასტროლოგიური საფუძველი</h2><p className="mt-2 text-sm text-foreground/75">პირადი რუკის საბაზისო გამოთვლა უფასოა და რეგისტრაციას არ საჭიროებს.</p><Link href="/piradi-ruka" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white">პირადი რუკის გამოთვლა <ArrowRight className="size-4" /></Link></div>
      </article>
      <SiteFooter />
    </main>
  );
}
