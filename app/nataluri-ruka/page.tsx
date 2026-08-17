import Link from "next/link";
import type { Metadata } from "next";

import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { signByIndex } from "@/lib/zodiac";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { NatalChartPageEn } from "@/components/seo/natal-chart-page-en";

const SITE_URL = "https://www.vivida.ge";
const URL = `${SITE_URL}/nataluri-ruka`;

const KEYWORDS = [
  "ნატალური რუკა",
  "ნატალური რუკა ონლაინ",
  "ნატალური რუკა უფასოდ",
  "პირადი ნატალური რუკა",
  "პირადი რუკა",
  "ნატალური რუკის გამოთვლა",
  "ნატალური რუკის გაკეთება",
  "ნატალური რუკის შედგენა",
  "ნატალური რუკა ქართულად",
  "nataluri ruka",
  "nataluri rukis shedgena",
  "piradi ruka",
];

const BASE_META: Metadata = {
  // Keyword-first, brandless title (Google shows "vivida.ge" separately) using
  // the high-intent terms "ონლაინ" + "გამოთვლა".
  title: { absolute: "ნატალური რუკა ონლაინ — უფასო გამოთვლა" },
  description:
    "ნატალური რუკის ონლაინ გამოთვლა უფასოდ. შეიყვანე დაბადების თარიღი, დრო და ადგილი — მიიღე პლანეტების ზუსტი პოზიციები, ასცენდენტი, 12 სახლი და ასპექტები ქართულად, რეგისტრაციის გარეშე.",
  keywords: KEYWORDS,
  alternates: localizedAlternates("/nataluri-ruka", "/en/natal-chart", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: URL,
    title: "ნატალური რუკა ონლაინ — უფასო გამოთვლა",
    description:
      "ნატალური რუკის ონლაინ გამოთვლა უფასოდ, რეგისტრაციის გარეშე. პლანეტები, ასცენდენტი, სახლები და ასპექტები ქართულად.",
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ნატალური რუკა ონლაინ — უფასო გამოთვლა",
    description: "ნატალური რუკის ონლაინ გამოთვლა უფასოდ, რეგისტრაციის გარეშე.",
  },
};

const BASE_META_EN: Metadata = {
  title: { absolute: "Free Birth Chart Calculator — Natal Chart Online" },
  description:
    "Calculate your natal chart online for free. Discover exact planet positions, your rising sign, 12 houses, and major aspects—no registration required.",
  keywords: [
    "free birth chart",
    "birth chart calculator",
    "natal chart",
    "astrology chart",
    "rising sign calculator",
    "12 houses astrology",
  ],
  // Canonical path comes first: for the English rendering that is the English
  // route, otherwise this self-canonicalises to a URL that 301-redirects.
  alternates: localizedAlternates("/en/natal-chart", "/nataluri-ruka", "en"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: "https://www.vividaastro.com/natal-chart",
    title: "Free Birth Chart Calculator",
    description:
      "Calculate your planets, rising sign, houses, and aspects online for free.",
    siteName: "Vivida",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Birth Chart Calculator",
    description: "Calculate your natal chart online for free.",
  },
};

/**
 * When the page is opened from a shared link (`?big=<sun>.<moon>.<asc>`) we
 * swap in a personalized OG card showing those signs. The <title> and canonical
 * stay clean (the param is for social previews, not indexing).
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ big?: string }>;
}): Promise<Metadata> {
  const en = (await getRequestLocale()) !== "ka";
  const sp = await searchParams;
  const big = typeof sp.big === "string" ? sp.big : "";
  const idxs = big.split(".").map((s) => parseInt(s, 10));
  const valid =
    idxs.length === 3 &&
    idxs.every((n) => Number.isInteger(n) && n >= 0 && n < 12);
  if (!valid) return en ? BASE_META_EN : BASE_META;

  const [sun, moon, asc] = idxs.map((i) =>
    en ? signByIndex(i).labelEn : signByIndex(i).labelKa,
  );
  const ogTitle = en
    ? `My birth chart: Sun ${sun} · Moon ${moon} · Rising ${asc}`
    : `ჩემი ნატალური რუკა: მზე ${sun} · მთვარე ${moon} · ამომავალი ${asc}`;
  const ogImage = `${en ? "https://www.vividaastro.com" : SITE_URL}/api/og/chart?big=${encodeURIComponent(big)}`;
  return {
    ...(en ? BASE_META_EN : BASE_META),
    openGraph: {
      ...(en ? BASE_META_EN.openGraph : BASE_META.openGraph),
      title: ogTitle,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      ...(en ? BASE_META_EN.twitter : BASE_META.twitter),
      title: ogTitle,
      images: [ogImage],
    },
  };
}

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
  {
    q: "როგორ გავაკეთო ნატალური რუკა ქართულად?",
    a: "ზემოთ მოცემულ კალკულატორში შეიყვანე დაბადების თარიღი, დრო და ქალაქი. Vivida ავტომატურად გამოთვლის პლანეტების ნიშნებს, ასცენდენტს, 12 სახლსა და ასპექტებს და შედეგს ქართულად გაჩვენებს.",
  },
];

export default async function NataluriRukaPage() {
  if ((await getRequestLocale()) !== "ka") return <NatalChartPageEn />;
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
              ნატალური რუკა (ანუ პირადი რუკა, დაბადების რუკა) არის ცის ზუსტი
              სურათი იმ წამში, როცა დაიბადე — სად იდგა მზე, მთვარე და თითოეული
              პლანეტა ზოდიაქოს ნიშნებსა და 12 სახლში. ის ასტროლოგიის საფუძველია:
              გვიჩვენებს შენს ხასიათს, ძლიერ მხარეებს, ემოციურ ბუნებასა და
              ცხოვრების სფეროებს.
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
                <strong className="text-foreground">სახლები</strong> — ცხოვრების
                რომელ სფეროში ვლინდება (კარიერა, ურთიერთობები, ფული…).
              </li>
              <li>
                <strong className="text-foreground">ასპექტები</strong> — როგორ
                ურთიერთობენ პლანეტები ერთმანეთთან (ჰარმონია თუ დაძაბულობა).
              </li>
            </ul>
            <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/85">
              ზემოთ კალკულატორი გაძლევს ამ ყველაფრის სუფთა მონაცემებს.
              პერსონალური ინტერპრეტაციისა და AI ანალიზისთვის{" "}
              <Link
                href="/signup"
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                დარეგისტრირდი უფასოდ
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              ნატალური რუკის გაკეთება ქართულად
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              ნატალური რუკის გამოთვლას სამი მონაცემი სჭირდება: დაბადების თარიღი,
              დაბადების ქალაქი და შეძლებისდაგვარად ზუსტი დრო. მათი შეყვანის
              შემდეგ კალკულატორი ავტომატურად ადგენს ციური სხეულების პოზიციებს და
              შედეგს ქართულად გაჩვენებს. თუ დაბადების დრო არ იცი, პლანეტების
              ნიშნებს მაინც მიიღებ, თუმცა ასცენდენტი და სახლები შესაძლოა ზუსტი
              არ იყოს.
            </p>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85">
              ყოველდღიური ნაბიჯების სანახავად გამოიყენე{" "}
              <Link
                href="/piradi-ruka/rogor-shevadginot"
                className="text-[var(--vivida-violet)] underline-offset-4 hover:underline"
              >
                პირადი რუკის შედგენის სრული ინსტრუქცია
              </Link>
              .
            </p>
          </section>

          {/* Contextual hand-off into the horoscope hub — see the same note
              on /piradi-ruka. This page carries 1,816 impressions at p6.5
              and previously reached /horoskopi only through a pill. */}
          <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              რუკის შემდეგ — ყოველდღიური ცა
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              ნატალური რუკა ერთხელ იქმნება და აღარ იცვლება. პლანეტები კი
              დღეს-დღეზე მოძრაობენ და შენს რუკას სხვადასხვა კუთხით ეხებიან —
              ამას ტრანზიტი ჰქვია და სწორედ ამაზეა აგებული{" "}
              <Link
                href="/horoskopi"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                დღის ჰოროსკოპი ყველა ზოდიაქოს ნიშნისთვის
              </Link>
              . შეადარე რუკაში ნანახი მთვარის ნიშანი{" "}
              <Link
                href="/mtvaris-kalendari"
                className="font-medium text-[var(--vivida-violet)] underline underline-offset-4 hover:no-underline"
              >
                მთვარის დღევანდელ ფაზას
              </Link>{" "}
              — ხშირად სწორედ აქ ჩანს, რატომ გრძნობ თავს ასე კონკრეტულ დღეს.
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
              href="/piradi-ruka"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              პირადი რუკა
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
              href="/horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              დღის ჰოროსკოპი
            </Link>
            <Link
              href="/piradi-horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              პირადი ჰოროსკოპი
            </Link>
            <Link
              href="/taro"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ტარო
            </Link>
            <Link
              href="/tests"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ტესტები
            </Link>
            <Link
              href="/numerologia"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ნუმეროლოგია
            </Link>
            <Link
              href="/chinuri-horoskopi"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ჩინური ჰოროსკოპი
            </Link>
            <Link
              href="/astrologiuri-kalendari"
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              ასტროლოგიური კალენდარი
            </Link>
          </section>
        </article>

        <PopularSearches queries={KEYWORDS} />
      </section>

      <SiteFooter />
    </main>
  );
}
