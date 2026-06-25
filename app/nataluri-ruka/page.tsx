import Link from "next/link";
import type { Metadata } from "next";

import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";

const SITE_URL = "https://www.vivida.ge";
const URL = `${SITE_URL}/nataluri-ruka`;

const KEYWORDS = [
  "ნატალური რუკა",
  "ნატალური რუკა ონლაინ",
  "ნატალური რუკა უფასოდ",
  "პირადი ნატალური რუკა",
  "ნატალური რუკის გამოთვლა",
  "nataluri ruka",
];

export const metadata: Metadata = {
  title: { absolute: "ნატალური რუკა ონლაინ — უფასო კალკულატორი | Vivida" },
  description:
    "შექმენი ნატალური რუკა ონლაინ უფასოდ. შეიყვანე დაბადების თარიღი, დრო და ადგილი — მიიღე პლანეტების ზუსტი პოზიციები, 12 სახლი და ასპექტები ქართულად. რეგისტრაციის გარეშე.",
  keywords: KEYWORDS,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "ნატალური რუკა ონლაინ — უფასო კალკულატორი",
    description:
      "შექმენი ნატალური რუკა უფასოდ, რეგისტრაციის გარეშე. პლანეტები, სახლები და ასპექტები ქართულად.",
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ნატალური რუკა ონლაინ — უფასო კალკულატორი",
    description: "შექმენი ნატალური რუკა უფასოდ, რეგისტრაციის გარეშე.",
  },
};

const FAQ = [
  {
    q: "რა არის ნატალური რუკა?",
    a: "ნატალური რუკა არის ცის რუკა შენი დაბადების ზუსტ მომენტში — სად იდგა მზე, მთვარე და პლანეტები. ის აჩვენებს თითოეული პლანეტის ნიშანს, სახლსა და ერთმანეთთან კავშირებს (ასპექტებს).",
  },
  {
    q: "უფასოა ნატალური რუკის გამოთვლა?",
    a: "დიახ. შეიყვანე დაბადების თარიღი, დრო და ქალაქი და მიიღე შენი რუკის სრული მონაცემები უფასოდ, რეგისტრაციის გარეშე. ინტერპრეტაციისა და AI ანალიზისთვის საჭიროა მხოლოდ უფასო რეგისტრაცია.",
  },
  {
    q: "მჭირდება დაბადების ზუსტი დრო?",
    a: "მზის ნიშანი და პლანეტების უმეტესობა ზუსტი იქნება დროის გარეშეც. თუმცა ამომავალი ნიშანი (ასცენდენტი) და 12 სახლი დროზეა დამოკიდებული — ზუსტი დროით რუკა ბევრად ზუსტი იქნება.",
  },
  {
    q: "რა მონაცემები მჭირდება?",
    a: "დაბადების თარიღი, დაბადების დრო (თუ იცი) და დაბადების ქალაქი. ქალაქის მიხედვით ავტომატურად განისაზღვრება გეოგრაფიული კოორდინატები და დროის სარტყელი.",
  },
];

export default function NataluriRukaPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ნატალური რუკა ონლაინ — Vivida",
    url: URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: "ka-GE",
    alternateName: KEYWORDS,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GEL" },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ნატალური რუკა", item: URL },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={150} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            ნატალური რუკა{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ონლაინ
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-foreground/80 sm:text-lg">
            შეიყვანე დაბადების თარიღი, დრო და ადგილი — და მიიღე შენი რუკის სრული
            მონაცემები უფასოდ, რეგისტრაციის გარეშე. პლანეტები, 12 სახლი და
            ასპექტები ქართულად.
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator />
        </div>

        {/* SEO content */}
        <article className="mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              რა არის ნატალური რუკა?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              ნატალური რუკა (ანუ დაბადების რუკა) არის ცის ზუსტი სურათი იმ წამში,
              როცა დაიბადე — სად იდგა მზე, მთვარე და თითოეული პლანეტა ზოდიაქოს
              ნიშნებსა და 12 სახლში. ის ასტროლოგიის საფუძველია: გვიჩვენებს შენს
              ხასიათს, ძლიერ მხარეებს, ემოციურ ბუნებასა და ცხოვრების სფეროებს.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              როგორ იკითხება რუკა
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">პლანეტები</strong> — რას
                წარმოადგენს თითოეული ენერგია (მზე — ბირთვი, მთვარე — ემოციები,
                მერკური — აზროვნება და ა.შ.).
              </li>
              <li>
                <strong className="text-foreground">ნიშნები</strong> — როგორ
                გამოხატავს თავს ეს ენერგია (ვერძი, კურო… თევზები).
              </li>
              <li>
                <strong className="text-foreground">სახლები</strong> —
                ცხოვრების რომელ სფეროში ვლინდება (კარიერა, ურთიერთობები, ფული…).
              </li>
              <li>
                <strong className="text-foreground">ასპექტები</strong> — როგორ
                ურთიერთობენ პლანეტები ერთმანეთთან (ჰარმონია თუ დაძაბულობა).
              </li>
            </ul>
            <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/85">
              ზემოთ კალკულატორი გაძლევს ამ ყველაფრის სუფთა მონაცემებს.
              პერსონალური ინტერპრეტაციისა და AI ანალიზისთვის{" "}
              <Link href="/signup" className="text-[var(--vivida-violet)] underline-offset-4 hover:underline">
                დარეგისტრირდი უფასოდ
              </Link>
              .
            </p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              ხშირად დასმული კითხვები
            </h2>
            <div className="mt-5 space-y-3">
              {FAQ.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      ✦
                    </span>
                  </summary>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="flex flex-wrap gap-2">
            <Link
              href="/zodiac"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ზოდიაქოს ნიშნები
            </Link>
            <Link
              href="/zodiac/tavsebadoba"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              თავსებადობა
            </Link>
            <Link
              href="/horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              დღის ჰოროსკოპი
            </Link>
          </section>
        </article>

        <PopularSearches queries={KEYWORDS} />
      </section>

      <SiteFooter />
    </main>
  );
}
