import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularSearches } from "@/components/seo/popular-searches";
import { ANGEL_HUB_EN, AngelNumbersHubEn } from "@/components/seo/angel-numbers-en";
import { ANGEL_HUB_AM, AngelNumbersHubAm } from "@/components/seo/angel-numbers-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ANGEL_FAQ,
  ANGEL_LATIN_QUERIES,
  ANGEL_NUMBERS,
} from "@/lib/seo/angel-numbers";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "ანგელოზური რიცხვები — 111, 222, 333, 11:11 მნიშვნელობა";
const DESCRIPTION =
  "რას ნიშნავს ერთნაირი ციფრები საათზე: 111, 222, 333, 444, 555, 777, 888, 999, 11:11 და 12:12. თითოეული ანგელოზური რიცხვის მნიშვნელობა ქართულად — სიყვარულში, საქმეში და რა ნაბიჯი გადადგა, როცა მას ხედავ.";

const KA_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "ანგელოზური რიცხვები",
    "ანგელოზური რიცხვი",
    "11:11 რას ნიშნავს",
    "1111 მნიშვნელობა",
    "111 მნიშვნელობა",
    "222 მნიშვნელობა",
    "333 მნიშვნელობა",
    "444 რას ნიშნავს",
    "ერთნაირი ციფრები საათზე",
    "რიცხვების მნიშვნელობა",
    "angeluri ricxvebi",
    "11 11 ras nishnavs",
  ],
  alternates: localizedAlternates("/angeluri-ricxvebi", "/angeluri-ricxvebi", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/angeluri-ricxvebi`,
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
    const path = "/angeluri-ricxvebi";
    return {
      title: { absolute: `${ANGEL_HUB_AM.title} — Vivida` },
      description: ANGEL_HUB_AM.description,
      keywords: ["հրեշտակային թվեր", "111 նշանակություն", "222 նշանակություն", "11:11 նշանակություն", "կրկնվող թվեր"],
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${path}`,
        title: ANGEL_HUB_AM.title,
        description: ANGEL_HUB_AM.description,
        siteName: "Vivida",
        locale: "hy_AM",
      },
      twitter: { card: "summary_large_image", title: ANGEL_HUB_AM.title, description: ANGEL_HUB_AM.description },
    };
  }
  if (locale === "en") {
    const path = "/angeluri-ricxvebi";
    return {
      title: { absolute: ANGEL_HUB_EN.title },
      description: ANGEL_HUB_EN.description,
      keywords: ["angel numbers", "111 meaning", "222 meaning", "11:11 meaning", "repeating numbers"],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title: ANGEL_HUB_EN.title, description: ANGEL_HUB_EN.description, siteName: "Vivida", locale: "en_US" },
      twitter: { card: "summary_large_image", title: ANGEL_HUB_EN.title, description: ANGEL_HUB_EN.description },
    };
  }
  return KA_METADATA;
}

export default async function AngelNumbersHubPage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <AngelNumbersHubAm />;
  if (locale === "en") return <AngelNumbersHubEn />;
  const ld = [
    articleLd({
      url: `${SITE_URL}/angeluri-ricxvebi`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-29T00:00:00.000Z",
      about: {
        "@type": "Thing",
        name: "ანგელოზური რიცხვები",
        alternateName: ["angel numbers", "angeluri ricxvebi", "11:11"],
      },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ანგელოზური რიცხვები", url: `${SITE_URL}/angeluri-ricxvebi` },
    ]),
    faqLd(ANGEL_FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "ანგელოზური რიცხვები",
      itemListElement: ANGEL_NUMBERS.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/angeluri-ricxvebi/${a.slug}`,
        name: a.titleKa,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ანგელოზური რიცხვები</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ნუმეროლოგია
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            ანგელოზური{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              რიცხვები
            </span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
            ხშირად ხედავ 11:11-ს საათზე? ან 222-ს ყველგან? აირჩიე რიცხვი და
            წაიკითხე, რას ნიშნავს ის სიყვარულში, საქმეში და რა ნაბიჯს
            გთავაზობს ახლა.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {ANGEL_NUMBERS.map((a) => (
            <Link
              key={a.slug}
              href={`/angeluri-ricxvebi/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/75"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  {a.slug}
                </span>
                {a.clockKa && (
                  <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {a.clockKa}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                {a.essenceKa}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-violet)]">
                სრული მნიშვნელობა
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რატომ ვხედავთ ერთნაირ ციფრებს
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            ორი ახსნა არსებობს და ისინი ერთმანეთს არ ეწინააღმდეგება.
            ფსიქოლოგიური: როცა რომელიმე რიცხვი ერთხელ შეამჩნიე, ტვინი მას
            შემდეგ ყოველთვის გამოყოფს ფონიდან — ამას სელექციური ყურადღება
            ჰქვია. სიმბოლური: სწორედ ის მომენტები, როცა ასეთ დამთხვევას
            ამჩნევ, ჩვეულებრივ ემთხვევა პერიოდს, როცა რაღაც მნიშვნელოვან
            გადაწყვეტილებაზე ფიქრობ.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            პრაქტიკული სარგებელი ორივე შემთხვევაში ერთია: რიცხვი პაუზის
            მიზეზი ხდება. და სწორედ პაუზაში ჩნდება ის კითხვა, რომელსაც
            ჩვეულებრივ გაურბიხარ.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {ANGEL_FAQ.map((item) => (
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

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            შენი მუდმივი რიცხვი — ბედის რიცხვი
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ანგელოზური რიცხვი მომენტზეა, ბედის რიცხვი კი მთელ ცხოვრებაზე.
            გამოთვალე უფასოდ დაბადების თარიღით.
          </p>
          <Link
            href="/numerologia"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ჩემი ბედის რიცხვი
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <PopularSearches queries={ANGEL_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
