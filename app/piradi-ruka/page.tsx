import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { PaidNextStep } from "@/components/seo/paid-next-step";
import {
  creditPacksForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const URL = `${SITE_URL}/piradi-ruka`;

// "პირადი რუკა" is the synonym people search for alongside "ნატალური რუკა".
// This page targets that term head-on (slug + title + H1 + body) and owns it
// cleanly: GSC 2026-08 has it at position 2.3 with 46.8% CTR.
//
// The old split, this page owning "შედგენა", /nataluri-ruka owning
// "გამოთვლა", did not hold. Three pages now surface for "ნატალური რუკა"
// (homepage 2.8, this page 4.5, /nataluri-ruka 6.4), so the term earns 23.6%
// CTR against 28.9% for the cleanly-owned "პირადი რუკა". Step one of merging
// them is to give this page the ნატალური vocabulary, description, keywords
// and an FAQ entry using "გამოთვლა" phrasing, while leaving the title and H1
// alone, since they are what earns the 46.8%. If this page takes the head
// term, /nataluri-ruka gets 301'd here; if not, nothing has been lost.
//
// GSC (2026-07): "პირადი რუკის შედგენა [ონლაინ/უფასოდ/ქართულად]" gets real
// impressions (21 combined) but almost zero clicks, the page never used
// the word "შედგენა" anywhere, so it wasn't a strong match for that intent.
// Added below, plus the "რუქა" typo and standalone "ასტროლოგიური რუკა".
const KEYWORDS = [
  "პირადი რუკა",
  "პირადი რუკა ონლაინ",
  "პირადი ნატალური რუკა",
  "პირადი ასტროლოგიური რუკა",
  "ასტროლოგიური რუკა",
  "პირადი რუკის შედგენა",
  "პირადი რუკის შედგენა ონლაინ",
  "პირადი რუკის შედგენა უფასოდ",
  "პირადი რუკის შედგენა საიტები",
  "როგორ შევადგინო პირადი რუკა",
  "პირადი რუკა ქართულად",
  "პირადი ჰოროსკოპი",
  "ასტროლოგია პირადი რუკა",
  "პირადი რუქა",
  "piradi ruka",
  "piradi rukis shedgena",
  "piradi horoskopi",
  "ნატალური რუკა",
  // ნატალური variants /nataluri-ruka currently ranks 2.1–5.3 for; this page
  // needs to cover them before that page can be merged in.
  "ნატალური რუკა ონლაინ",
  "ნატალური რუკის გამოთვლა",
  "ნატალური რუკის შედგენა",
  "ნატალური რუკის",
  "nataluri ruka",
];

export const metadata: Metadata = {
  title: { absolute: "პირადი რუკა ონლაინ, უფასო გამოთვლა" },
  description:
    "პირადი რუკის (ნატალური რუკის) შედგენა და გამოთვლა ონლაინ, უფასოდ და ქართულად. შეიყვანე დაბადების თარიღი, დრო და ადგილი, ნახე პლანეტები, ასცენდენტი, 12 სახლი და ასპექტები რეგისტრაციის გარეშე.",
  keywords: KEYWORDS,
  alternates: { canonical: URL },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: URL,
    title: "პირადი რუკა ონლაინ, უფასო გამოთვლა",
    description:
      "შენი პირადი (ნატალური) რუკა ონლაინ, უფასოდ, პლანეტები, ასცენდენტი, სახლები და ასპექტები ქართულად.",
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: "პირადი რუკა ონლაინ, უფასო გამოთვლა",
    description: "შენი პირადი (ნატალური) რუკა ონლაინ, უფასოდ.",
  },
};

const FAQ = [
  {
    q: "როგორ შევადგინო პირადი რუკა?",
    a: "პირადი რუკის შედგენა 3 ნაბიჯშია: (1) შეიყვანე დაბადების თარიღი, ზუსტი დრო და ქალაქი ზემოთ მოცემულ კალკულატორში, (2) დააჭირე „გამოთვლას“, შედეგი მყისიერად გამოჩნდება, (3) ნახე პლანეტების პოზიციები, ასცენდენტი, 12 სახლი და ასპექტები. რეგისტრაცია არ სჭირდება.",
  },
  {
    q: "პირადი რუკა და ნატალური რუკა ერთი და იგივეა?",
    a: "დიახ. „პირადი რუკა“ და „ნატალური რუკა“ (დაბადების რუკა) ერთი და იმავე რამის სხვადასხვა სახელია, ცის პერსონალური სურათი შენი დაბადების ზუსტ მომენტში. იგი მხოლოდ შენია, რადგან შენს ზუსტ დროსა და ადგილს ეფუძნება.",
  },
  {
    q: "როგორ გამოვთვალო ნატალური რუკა ონლაინ?",
    a: "ნატალური რუკის გამოთვლა იგივეა, რაც პირადი რუკის შედგენა, შეიყვანე დაბადების თარიღი, ზუსტი დრო და ქალაქი ზემოთ მოცემულ კალკულატორში და შედეგს მყისიერად მიიღებ: პლანეტების პოზიციები, ასცენდენტი, 12 სახლი და ასპექტები, ქართულად და უფასოდ, რეგისტრაციის გარეშე.",
  },
  {
    q: "უფასოა პირადი რუკის შედგენა?",
    a: "დიახ. შეიყვანე დაბადების თარიღი, დრო და ქალაქი და მიიღე შენი პირადი რუკის სრული მონაცემები უფასოდ, რეგისტრაციის გარეშე. ღრმა ინტერპრეტაციისა და AI ანალიზისთვის საჭიროა მხოლოდ უფასო რეგისტრაცია.",
  },
  {
    q: "რას აჩვენებს ჩემი პირადი რუკა?",
    a: "შენს ბირთვულ ხასიათს, ემოციურ ბუნებას, ძლიერ მხარეებსა და ცხოვრების სფეროებს, პლანეტების ნიშნების, 12 სახლისა და ასპექტების მეშვეობით.",
  },
  {
    q: "როგორ ავირჩიო პირადი რუკის შესადგენი საიტი?",
    a: "კარგი საიტი დაბადების ქალაქით ავტომატურად უნდა ადგენდეს კოორდინატებსა და ისტორიულ დროის სარტყელს, ითვლიდეს ასცენდენტს, 12 სახლსა და პლანეტების ასპექტებს და გასაგებად ხსნიდეს შედეგს. Vivida-ზე საბაზისო პირადი რუკის შედგენა უფასოა, ქართულად და რეგისტრაციის გარეშე.",
  },
  {
    q: "პირადი რუკა და პირადი ჰოროსკოპი განსხვავდება?",
    a: "დიახ. პირადი რუკა დაბადების მომენტის უცვლელი ასტროლოგიური სურათია. პირადი ჰოროსკოპი კი ამ რუკას მიმდინარე პლანეტების მოძრაობას ადარებს და კონკრეტული პერიოდის პერსონალურ ტენდენციებს აღწერს.",
  },
  {
    q: "მჭირდება დაბადების ზუსტი დრო?",
    a: "მზის ნიშანი და პლანეტების უმეტესობა ზუსტი იქნება დროის გარეშეც. თუმცა ამომავალი ნიშანი (ასცენდენტი) და 12 სახლი დროზეა დამოკიდებული, ზუსტი დროით პირადი რუკა ბევრად ზუსტი იქნება.",
  },
];

export default function PiradiRukaPage() {
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
    name: "პირადი რუკა ონლაინ, Vivida",
    url: URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: "ka-GE",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GEL" },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "პირადი რუკა", item: URL },
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
            პირადი რუკა{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ონლაინ
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-foreground/80 sm:text-lg">
            შენი პირადი რუკა მხოლოდ შენია, ცის სურათი შენი დაბადების წამში.
            შეიყვანე დაბადების თარიღი, დრო და ადგილი და ნახე ის უფასოდ,
            რეგისტრაციის გარეშე.
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator />
        </div>

        {/* Single paid continuation after the free calculation: the full
            interpreted PDF report, priced before signup is asked for. */}
        <PaidNextStep
          title="მონაცემები გაქვს, ახლა სრული პასუხი"
          body="უფასო კალკულატორი პლანეტების პოზიციებს გაჩვენებს. სრული ანგარიში მათ შენს ხასიათს, ძლიერ მხარეებსა და ზრდის ზონებს უკავშირებს და ჩამოსატვირთ PDF-ად გაძლევს."
          ctaHref="/signup?next=%2Freport"
          ctaLabel="შექმენი ანგარიში უფასოდ"
          priceNote={`სრული PDF ანგარიში ${CREDIT_COST.pdfReport} კრედიტი · კრედიტები ${formatBillingAmount(creditPacksForCountry("GE")[0].amountMinor, "gel", "ka")}-დან, ერთჯერადად`}
        />

        {/* SEO content */}
        <article className="mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              რა არის პირადი რუკა?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              პირადი რუკა (იგივე{" "}
              <Link
                href="/nataluri-ruka"
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                ნატალური რუკა
              </Link>{" "}
              ან დაბადების რუკა) არის ცის ზუსტი სურათი იმ წამში, როცა დაიბადე.
              ის მხოლოდ შენია, რადგან შენს უნიკალურ დროსა და ადგილს ეფუძნება, და
              სწორედ ამიტომ აჩვენებს შენს პიროვნებას უფრო ღრმად, ვიდრე მხოლოდ
              მზის ნიშანი.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              პირადი რუკის შედგენა ონლაინ, რა უნდა შეეძლოს კარგ საიტს?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              პირადი რუკის შესადგენი საიტები მხოლოდ მზის ნიშანს არ უნდა
              აჩვენებდნენ. ზუსტი ონლაინ კალკულატორი დაბადების ქალაქის მიხედვით
              ადგენს გეოგრაფიულ კოორდინატებსა და დროის სარტყელს, შემდეგ კი
              ითვლის პლანეტებს, ასცენდენტს, 12 სახლსა და ასპექტებს. Vivida ამ
              მონაცემებს ქართულად გაჩვენებს და საბაზისო შედეგისთვის რეგისტრაციას
              არ მოითხოვს.
            </p>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85">
              თუ პირველად ქმნი რუკას, ნახე დეტალური ინსტრუქცია,{" "}
              <Link
                href="/piradi-ruka/rogor-shevadginot"
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                როგორ შევადგინოთ პირადი რუკა ონლაინ
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              პირადი ასტროლოგიური რუკა და პირადი ჰოროსკოპი
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              პირადი ასტროლოგიური რუკა დაბადების მომენტის უცვლელი საფუძველია: ის
              აღწერს პლანეტების საწყის განლაგებას. პირადი ჰოროსკოპი კი ამ
              საფუძველს დღევანდელ ან მომავალი პერიოდის ტრანზიტებს ადარებს.
              ამიტომ ზოგადი ზოდიაქოს პროგნოზისგან განსხვავებით, პერსონალური
              პროგნოზი შენს დაბადების დროსა და ადგილს ითვალისწინებს.
            </p>
            <Link
              href="/piradi-horoskopi"
              className="mt-3 inline-flex text-sm font-medium text-[var(--vivida-cyan)] underline-offset-4 hover:underline"
            >
              გაიგე, როგორ მუშაობს პირადი ჰოროსკოპი →
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              როგორ შევადგინო პირადი რუკა?
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              პირადი რუკის შედგენა ონლაინ და უფასოდ, 3 ნაბიჯში:
            </p>
            <ol className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">
                  1. შეიყვანე მონაცემები
                </strong>{" "}
                , დაბადების თარიღი, ზუსტი დრო და ქალაქი ზემოთ მოცემულ
                კალკულატორში.
              </li>
              <li>
                <strong className="text-foreground">2. გამოთვალე</strong>,
                შედეგი მყისიერად ჩნდება, რეგისტრაციის გარეშე.
              </li>
              <li>
                <strong className="text-foreground">3. გაეცანი შედეგს</strong>,
                პლანეტების პოზიციები, ასცენდენტი, 12 სახლი და ასპექტები.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              რას აჩვენებს შენი პირადი რუკა
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">პლანეტები</strong>, შენი
                შინაგანი ენერგიები: მზე (ბირთვი), მთვარე (ემოციები), მერკური
                (აზროვნება) და სხვა.
              </li>
              <li>
                <strong className="text-foreground">ნიშნები</strong>, როგორ
                გამოხატავ თითოეულ ამ ენერგიას.
              </li>
              <li>
                <strong className="text-foreground">სახლები</strong>, ცხოვრების
                რომელ სფეროში ვლინდება (კარიერა, ურთიერთობები, ფული…).
              </li>
              <li>
                <strong className="text-foreground">ასპექტები</strong>, როგორ
                ერწყმის ეს ენერგიები ერთმანეთს შენს ხასიათში.
              </li>
            </ul>
            <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/85">
              კალკულატორი გაძლევს სუფთა მონაცემებს. პერსონალური ინტერპრეტაციისა
              და AI ანალიზისთვის{" "}
              <Link
                href="/signup"
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                დარეგისტრირდი უფასოდ
              </Link>
              .
            </p>
          </section>

          {/* Contextual hand-off into the horoscope hub.
              GSC: this page ranks p4.0 with 2,514 impressions, it's the
              strongest page on the site, while /horoskopi sits at p36 for
              its head term. It linked here to nataluri-ruka and zodiac but
              never to the horoscope hub, so none of that authority reached
              it. Descriptive in-content anchors, not just a pill. */}
          <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              რუკა და ყოველდღიური პროგნოზი, როგორ უკავშირდება
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              პირადი რუკა შენს მუდმივ სურათს ხატავს: სად იდგა თითოეული პლანეტა
              შენი დაბადების წუთს. ის არ იცვლება. რაც იცვლება, ის პლანეტების
              დღევანდელი მდებარეობაა, და სწორედ ამ მოძრაობას აღწერს{" "}
              <Link
                href="/horoskopi"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                დღის ჰოროსკოპი
              </Link>
              . ორივე ერთად ბევრად მეტს ამბობს, ვიდრე ცალ-ცალკე: რუკა გეუბნება,{" "}
              <em>ვინ ხარ</em>, ჰოროსკოპი კი, <em>რა ხდება ახლა</em>.
            </p>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              თუ მხოლოდ დღევანდელი პროგნოზი გაინტერესებს, გადადი{" "}
              <Link
                href="/horoskopi"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                ჰოროსკოპზე ყველა ზოდიაქოს ნიშნისთვის
              </Link>
              ; კვირისა და თვის ხედვისთვის კი,{" "}
              <Link
                href="/horoskopi/kvireuli"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                კვირის ჰოროსკოპი
              </Link>{" "}
              და{" "}
              <Link
                href="/horoskopi/tviuri"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                თვის ჰოროსკოპი
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
              href="/nataluri-ruka"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ნატალური რუკა
            </Link>
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
              href="/piradi-ruka/rogor-shevadginot"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              როგორ შევადგინოთ პირადი რუკა
            </Link>
            <Link
              href="/piradi-horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              პირადი ჰოროსკოპი
            </Link>
            <Link
              href="/horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              დღის ჰოროსკოპი
            </Link>
            <Link
              href="/mtvaris-kalendari"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              მთვარის კალენდარი
            </Link>
          </section>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
