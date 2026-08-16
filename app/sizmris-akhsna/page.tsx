import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularSearches } from "@/components/seo/popular-searches";
import { DREAMS_HUB_EN, DreamsHubEn } from "@/components/seo/dreams-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DREAMS_FAQ,
  DREAMS_LATIN_QUERIES,
  DREAM_SYMBOLS,
  dreamsByLetter,
} from "@/lib/seo/dreams";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "სიზმრის ახსნა ანბანის მიხედვით — რას ნიშნავს შენი სიზმარი";
const DESCRIPTION =
  "სიზმრის ახსნა ქართულად და უფასოდ: გველი, წყალი, კბილი, ბავშვი, მიცვალებული, ფული და კიდევ ათეულობით სიმბოლო ანბანის მიხედვით. თითოეულს აქვს ზოგადი მნიშვნელობაც და კონკრეტული ვარიანტებიც — იპოვე, რას ნიშნავს ის, რაც სიზმრად ნახე.";

const KA_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "სიზმრის ახსნა",
    "სიზმრების ახსნა",
    "სიზმრის ახსნა ანბანის მიხედვით",
    "სიზმრის ახსნა ქართულად",
    "რას ნიშნავს სიზმარი",
    "სიზმარში ვნახე",
    "სიზმრის განმარტება",
    "სიზმრები",
    "sizmris axsna",
    "sizmrebis axsna",
    "sizmris axsna anbanis mixedvit",
  ],
  alternates: localizedAlternates("/sizmris-akhsna", "/sizmris-akhsna", "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/sizmris-akhsna`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export async function generateMetadata(): Promise<Metadata> {
  if ((await getRequestLocale()) !== "en") return KA_METADATA;
  const path = "/sizmris-akhsna";
  return {
    title: { absolute: DREAMS_HUB_EN.title },
    description: DREAMS_HUB_EN.description,
    keywords: ["dream dictionary", "dream meanings", "dream interpretation", "common dream symbols"],
    alternates: localizedAlternates(path, path, "en"),
    openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title: DREAMS_HUB_EN.title, description: DREAMS_HUB_EN.description, siteName: "Vivida", locale: "en_US" },
    twitter: { card: "summary_large_image", title: DREAMS_HUB_EN.title, description: DREAMS_HUB_EN.description },
  };
}

/**
 * Dream-dictionary hub. Structured as an A–Z index on purpose: "ანბანის
 * მიხედვით" is the dominant modifier on this query family, and it's also
 * genuinely the fastest way for someone to find the symbol they woke up
 * thinking about.
 */
export default async function DreamsHubPage() {
  if ((await getRequestLocale()) === "en") return <DreamsHubEn />;
  const groups = dreamsByLetter();

  const ld = [
    articleLd({
      url: `${SITE_URL}/sizmris-akhsna`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-29T00:00:00.000Z",
      about: {
        "@type": "Thing",
        name: "სიზმრის ახსნა",
        alternateName: ["სიზმრების ახსნა", "sizmris axsna", "dream interpretation"],
      },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "სიზმრის ახსნა", url: `${SITE_URL}/sizmris-akhsna` },
    ]),
    faqLd(DREAMS_FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "სიზმრის სიმბოლოები",
      itemListElement: DREAM_SYMBOLS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/sizmris-akhsna/${s.slug}`,
        name: s.titleKa,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_265/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.28_0.14_300/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
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
          <span className="text-foreground/80">სიზმრის ახსნა</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სიზმრების ლექსიკონი
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            სიზმრის ახსნა{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ანბანის მიხედვით
            </span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
            იპოვე ის, რაც სიზმრად ნახე — გველი, წყალი, კბილი, ბავშვი,
            მიცვალებული — და წაიკითხე, რას ნიშნავს ტრადიციულად და რას ამბობს
            იმავე სიმბოლოზე თანამედროვე ფსიქოლოგია. უფასოა, რეგისტრაციის
            გარეშე.
          </p>
        </header>

        {/* A–Z index */}
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.letter}>
              <h2 className="mb-2.5 flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-lg font-semibold text-[var(--vivida-violet)]">
                  {g.letter}
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.items.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/sizmris-akhsna/${s.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-colors hover:bg-card/75"
                  >
                    <span className="text-xl leading-none">{s.glyph}</span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground/90">
                        {s.titleKa}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {s.summaryKa}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Editorial */}
        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            როგორ გავშიფროთ სიზმარი სწორად
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            სიმბოლოს მნიშვნელობა ამოსავალი წერტილია და არა საბოლოო პასუხი.
            ერთი და იგივე გველი სხვადასხვა ადამიანთან სხვადასხვას ნიშნავს —
            იმიტომ, რომ სიზმარს შენი ცხოვრება ხსნის და არა ლექსიკონი. სამი
            კითხვა, რომელიც ყველაზე მეტად ეხმარება:
          </p>
          <ol className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/85">
            <li className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--vivida-cyan)]/15 text-xs font-semibold text-[var(--vivida-cyan)]">
                1
              </span>
              <span>
                <strong>რას გრძნობდი?</strong> ემოცია სიზმრის ყველაზე ზუსტი
                ნაწილია — შიში, სიმშვიდე თუ სიხარული მთელ მნიშვნელობას ცვლის.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--vivida-violet)]/15 text-xs font-semibold text-[var(--vivida-violet)]">
                2
              </span>
              <span>
                <strong>რა ხდება ახლა შენს ცხოვრებაში?</strong> სიზმარი
                თითქმის ყოველთვის ბოლო დღეების თემას ამუშავებს.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--vivida-pink)]/15 text-xs font-semibold text-[var(--vivida-pink)]">
                3
              </span>
              <span>
                <strong>რომელი დეტალი გამახსოვრდა ყველაზე კარგად?</strong>
                სწორედ ის დეტალია მთავარი სიმბოლო — და არა სიუჟეტი.
              </span>
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {DREAMS_FAQ.map((item) => (
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
            სიზმარი ერთი ღამეა — რუკა მთელი შენი ისტორიაა
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            მთვარე ნატალურ რუკაში სწორედ იმაზე ამბობს, როგორ განიცდი, ოცნებობ
            და რას მალავ. შექმენი შენი რუკა უფასოდ.
          </p>
          <Link
            href="/nataluri-ruka"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ჩემი ნატალური რუკა
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <PopularSearches queries={DREAMS_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
