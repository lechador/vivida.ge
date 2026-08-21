import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  isMercuryRetrogradeNow,
  mercuryRetrogradePeriods,
} from "@/lib/retrograde";
import { RETROGRADE_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  MERCURY_RETROGRADE_EN,
  MercuryRetrogradePageEn,
} from "@/components/seo/mercury-retrograde-en";
import {
  MERCURY_RETROGRADE_AM,
  MercuryRetrogradePageAm,
} from "@/components/seo/mercury-retrograde-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { englishSiteHref, armenianSiteHref, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

// Recompute daily — the "is it retrograde right now" banner and the year
// tables come straight from the ephemeris, so the page never goes stale.
export const revalidate = 86400;

const TITLE = "მერკური რეტროგრადში — თარიღები, მნიშვნელობა და რჩევები";
const DESCRIPTION =
  "როდის არის მერკური რეტროგრადული — ზუსტი თარიღები ასტრონომიული გამოთვლით, რას ნიშნავს რეტროგრადული მერკური, რაზე მოქმედებს და როგორ გაუმკლავდე. ქართულად, Vivida-ზე.";

const KA_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "მერკური რეტროგრადში",
    "რეტროგრადული მერკური",
    "მერკურის რეტროგრადი",
    "მერკური რეტროგრადში 2026",
    "რეტროგრადი რას ნიშნავს",
    "პლანეტების რეტროგრადი",
    "merkuri retrogradshi",
    "retrograduli merkuri",
  ],
  alternates: localizedAlternates("/merkuri-retrogradi", "/merkuri-retrogradi", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/merkuri-retrogradi`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "am") {
    const path = "/merkuri-retrogradi";
    const { title, description } = MERCURY_RETROGRADE_AM;
    return {
      title: { absolute: `${title} — Vivida` },
      description,
      keywords: [
        "Մերկուրիի ռետրոգրադ",
        "Մերկուրի ռետրոգրադ",
        "ռետրոգրադ Մերկուրի 2026",
        "հետընթաց Մերկուրի",
      ],
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: armenianSiteHref(path, false),
        title,
        description,
        siteName: "Vivida",
        locale: "hy_AM",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  if (locale === "en") {
    const path = "/merkuri-retrogradi";
    const { title, description } = MERCURY_RETROGRADE_EN;
    return {
      title: { absolute: title },
      description,
      keywords: [
        "Mercury retrograde",
        "Mercury retrograde dates",
        "is Mercury retrograde",
        "Mercury retrograde meaning",
      ],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: englishSiteHref(path, false),
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  return KA_METADATA;
}

const FAQ = [
  {
    q: "რას ნიშნავს „მერკური რეტროგრადში“?",
    a: "რეტროგრადული მოძრაობა ოპტიკური ილუზიაა: დედამიწიდან ჩანს, თითქოს მერკური ცაზე უკუსვლით მოძრაობს. ასტროლოგიურად ეს პერიოდი გადამოწმების, გადახედვისა და დასრულების დროა — კომუნიკაციაში, ტექნიკასა და შეთანხმებებში მეტი სიფრთხილე ღირს.",
  },
  {
    q: "რამდენ ხანს გრძელდება მერკურის რეტროგრადი?",
    a: "დაახლოებით სამი კვირა, წელიწადში სამჯერ (ზოგჯერ ოთხჯერ). ზუსტი თარიღები ამ გვერდზეა — ისინი პირდაპირ ასტრონომიული გამოთვლით დგება.",
  },
  {
    q: "რა არ უნდა გავაკეთო რეტროგრადის დროს?",
    a: "ხელშეკრულების დაუფიქრებლად ხელმოწერა, მნიშვნელოვანი ტექნიკის ყიდვა ან დიდი გამოცხადებები — ჯობია გადამოწმებას დაუთმო დრო. სამაგიეროდ, რეტროგრადი იდეალურია რევიზიისთვის: დაასრულე ძველი საქმეები, დაუბრუნდი გადადებულ საუბრებს.",
  },
  {
    q: "მოქმედებს თუ არა რეტროგრადი ყველა ნიშანზე ერთნაირად?",
    a: "არა — ყველაზე მეტად იმ ნიშნებზე, სადაც რეტროგრადი ხდება, და მერკურით მართულ ნიშნებზე (ტყუპები, ქალწული). შენს პერსონალურ სურათს ნატალური რუკა აჩვენებს.",
  },
];

const KA_DATE = new Intl.DateTimeFormat("ka-GE", {
  day: "numeric",
  month: "long",
});

function formatKa(isoDate: string): string {
  return KA_DATE.format(new Date(`${isoDate}T12:00:00Z`));
}

export default async function MercuryRetrogradePage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <MercuryRetrogradePageAm />;
  if (locale === "en") return <MercuryRetrogradePageEn />;
  const now = new Date();
  const year = now.getUTCFullYear();
  const retroNow = isMercuryRetrogradeNow(now);
  const thisYear = mercuryRetrogradePeriods(year);
  const nextYear = mercuryRetrogradePeriods(year + 1);

  const ld = [
    articleLd({
      url: `${SITE_URL}/merkuri-retrogradi`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: now.toISOString(),
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "მერკური რეტროგრადში", url: `${SITE_URL}/merkuri-retrogradi` },
    ]),
    faqLd(FAQ),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">მერკური რეტროგრადში</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            მერკური{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              რეტროგრადში
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">
            ზუსტი თარიღები ასტრონომიული გამოთვლით, რას ნიშნავს რეტროგრადული
            მერკური და როგორ გამოიყენო ეს პერიოდი შენს სასარგებლოდ.
          </p>
        </header>

        {/* Live status banner */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 ${
            retroNow
              ? "border-[var(--vivida-pink)]/45 bg-[var(--vivida-pink)]/10"
              : "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/8"
          }`}
        >
          <div className="flex items-center gap-3">
            <RotateCcw
              className={`size-6 shrink-0 ${
                retroNow
                  ? "text-[var(--vivida-pink)]"
                  : "text-[var(--vivida-cyan)]"
              }`}
            />
            <div>
              <div className="text-lg font-semibold tracking-tight">
                {retroNow
                  ? "მერკური ახლა რეტროგრადულია"
                  : "მერკური ახლა დირექტულია"}
              </div>
              <p className="mt-0.5 text-sm text-foreground/80">
                {retroNow
                  ? "გადაამოწმე დეტალები, დაასრულე ძველი საქმეები და ნუ იჩქარებ ხელმოწერებს."
                  : "ცა კომუნიკაციისთვის ღიაა — ახალი შეთანხმებებისა და დაწყებებისთვის კარგი დროა."}
              </p>
            </div>
          </div>
        </div>

        {/* Period tables */}
        {[
          { label: `მერკურის რეტროგრადი ${year}`, periods: thisYear },
          { label: `მერკურის რეტროგრადი ${year + 1}`, periods: nextYear },
        ].map(({ label, periods }) => (
          <section key={label} className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
            <div className="mt-3 space-y-2">
              {periods.map((p) => (
                <div
                  key={p.startIso}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/50 px-4 py-3 ring-1 ring-foreground/5 backdrop-blur-xl"
                >
                  <div className="text-[15px] font-medium text-foreground/95">
                    {formatKa(p.startIso)} — {formatKa(p.endIso)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {p.startSignKa === p.endSignKa
                      ? p.startSignKa
                      : `${p.startSignKa} → ${p.endSignKa}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* What it means — content block */}
        <section className="mt-10 space-y-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
              რაზე მოქმედებს
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              მერკური კომუნიკაციის, ტექნიკის, გზებისა და შეთანხმებების პლანეტაა.
              რეტროგრადის დროს ხშირდება გაუგებრობები მიმოწერაში, ტექნიკური
              შეფერხებები, დაგვიანებული ტრანსპორტი და „წარსულიდან დაბრუნებული“
              ადამიანები თუ თემები. ეს კატასტროფა არ არის — უბრალოდ ცა
              გირჩევს, ორჯერ გადაამოწმო.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-cyan)]">
              რისთვის არის კარგი
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              ყველაფრისთვის, რაც „რე“-თი იწყება: რევიზია, რედაქტირება,
              რემონტი, შერიგება, დაბრუნება. დაასრულე გაჩერებული პროექტები,
              გადახედე ბიუჯეტს, დაუბრუნდი ძველ იდეებს — რეტროგრადი ამ საქმეებს
              უჭერს მხარს.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            როგორ მოქმედებს რეტროგრადი ზუსტად შენზე?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            პასუხი შენს ნატალურ რუკაშია — სად დგას შენი მერკური და რომელ
            სახლში გადის ტრანზიტი. შექმენი უფასოდ.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href="/nataluri-ruka">
              ჩემი ნატალური რუკა
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <PopularSearches queries={RETROGRADE_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
