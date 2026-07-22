import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PillarsSection } from "@/components/landing/pillars-section";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SiteSearch } from "@/components/search/site-search";
import { VividaMark } from "@/components/brand/vivida-mark";

const SITE_URL = "https://www.vivida.ge";

/**
 * Home page is the brand landing — Google-facing copy lives here. Title is
 * absolute (no "· Vivida" suffix) so the brand reads as the primary name in
 * results. Description is keyword-tuned around what Georgians actually
 * search ("ნატალური რუკა", "ჰოროსკოპი ქართულად").
 */
export const metadata: Metadata = {
  // Keyword-first title — Google shows the brand ("vivida.ge") on its own line,
  // so leading with "ნატალური რუკა" wins the bolded match instead of burying it
  // behind the brand.
  title: {
    absolute: "ნატალური რუკა, ჰოროსკოპი და თავსებადობა ქართულად — Vivida",
  },
  description:
    "ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობა — შენი დაბადების ზუსტი მომენტის მიხედვით. შექმენი შენი რუკა უფასოდ, ქართულად.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "ნატალური რუკა და ჰოროსკოპი ქართულად — Vivida",
    description:
      "ცოცხალი ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობის ანალიზი — შენი დაბადების ზუსტი მომენტის მიხედვით.",
    url: SITE_URL,
  },
  twitter: {
    title: "Vivida — ნატალური რუკა ქართულად",
    description:
      "ცოცხალი ნატალური რუკა და ყოველდღიური ჰოროსკოპი — შენი დაბადების ზუსტი მომენტის მიხედვით.",
  },
};

/**
 * Structured data injected on / so Google can render rich snippets and
 * the sitelinks search box. Two graphs:
 *   - Organization: who we are (logo, social, contact)
 *   - WebSite: the site itself + an internal search action that wires up
 *     Google's "Search this site" box for branded queries
 */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vivida",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "პერსონალური ასტროლოგიური სერვისი — ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობა ქართულად.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@vivida.ge",
    contactType: "customer support",
    availableLanguage: ["Georgian", "ka"],
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vivida",
  url: SITE_URL,
  inLanguage: "ka-GE",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/discover?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  // If you're already signed in there's nothing for you on the marketing
  // page — straight to the app. Keeps the back-button from leaving authed
  // users staring at a "Sign in" CTA. Feed is the in-app home; if the
  // user hasn't completed onboarding, /feed bounces them to /onboarding.
  const session = await auth();
  if (session?.user?.id) {
    redirect("/feed");
  }
  const { signs, pairs } = buildCalculatorData();
  return (
    <>
      {/* Structured data — search engines parse these inline scripts even
          though they're hidden from users. Two separate scripts so a
          parse error in one doesn't void the other. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
      />

      <main className="relative isolate flex-1 overflow-hidden">
        {/* Cosmic backdrop layers */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_0%,oklch(0.28_0.12_300/0.55),transparent_70%),radial-gradient(40%_30%_at_85%_70%,oklch(0.32_0.13_200/0.4),transparent_70%),radial-gradient(35%_25%_at_15%_85%,oklch(0.35_0.15_350/0.35),transparent_70%)]"
        />
        <Starfield />

        {/* Top nav */}
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <VividaMark size={40} id="landing" />
              <span
                className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
                }}
              >
                vivida
              </span>
            </Link>

            <SiteSearch
              compact
              placeholder="ძებნა…"
              className="min-w-0 flex-1 sm:max-w-xs"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
              <Link
                href="/how-it-works"
                className="transition-colors hover:text-foreground"
              >
                როგორ მუშაობს
              </Link>
              <Link
                href="/features"
                className="transition-colors hover:text-foreground"
              >
                ფუნქციები
              </Link>
            </nav>
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/8 px-4 py-1.5 text-sm font-medium text-[var(--vivida-cyan)] transition-all hover:border-[var(--vivida-cyan)]/70 hover:bg-[var(--vivida-cyan)]/14 hover:text-foreground"
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[var(--vivida-cyan)] vivida-pulse"
              />
              შესვლა
            </Link>
          </div>
        </header>

        <Hero />

        {/* Interactive compatibility calculator — an instant, no-signup hook
            that turns cold traffic into engaged visitors before asking for
            anything. Shareable results feed the viral loop. */}
        <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-4 pt-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              შეამოწმე{" "}
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                შენი თავსებადობა
              </span>{" "}
              ახლავე
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              აირჩიე ორი ნიშანი — დანარჩენს ვარსკვლავები ამბობენ.
            </p>
          </div>
          <CompatibilityCalculator signs={signs} pairs={pairs} />
        </section>

        {/* Explore rail — internal links to every free tool. The homepage is
            high-traffic + high-bounce and previously linked to nothing
            SEO-relevant; this distributes crawl paths and gives cold visitors
            an obvious, low-commitment next step (a 2nd pageview = engaged). */}
        <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="mb-5 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            გამოიკვლიე უფასოდ
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { href: "/nataluri-ruka", label: "ნატალური რუკა", emoji: "🌌" },
              { href: "/horoskopi", label: "დღის ჰოროსკოპი", emoji: "☀️" },
              { href: "/zodiac/tavsebadoba", label: "თავსებადობა", emoji: "💞" },
              { href: "/taro", label: "ტარო", emoji: "🔮" },
              { href: "/tests", label: "ტესტები", emoji: "🧠" },
              { href: "/numerologia", label: "ნუმეროლოგია", emoji: "🔢" },
              { href: "/chinuri-horoskopi", label: "ჩინური ჰოროსკოპი", emoji: "🐉" },
              { href: "/zodiac", label: "ზოდიაქოს ნიშნები", emoji: "✨" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3.5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-[var(--vivida-violet)]/50 hover:bg-card/80"
              >
                <span aria-hidden className="text-lg">
                  {item.emoji}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                <span
                  aria-hidden
                  className="ml-auto text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <PillarsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        <FinalCta />

        {/* Bottom fade into the dark background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent"
        />
      </main>
      <SiteFooter />
    </>
  );
}
