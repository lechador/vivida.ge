import type { Metadata } from "next";
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
import { MarketingHeader } from "@/components/marketing-header";
import { LatestArticlesSection } from "@/components/articles/latest-articles-section";
import { PricingAnchor } from "@/components/landing/pricing-anchor";
import { TrackedPublicLink } from "@/components/seo/tracked-public-link";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { localizedAlternates } from "@/lib/seo/locales";
import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
} from "@/lib/billing-config";
import { HOME_CONTENT } from "@/lib/seo/home-content";
import { faqLd, productLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

export const metadata: Metadata = {
  title: {
    absolute: "ნატალური რუკა, ჰოროსკოპი და თავსებადობა ქართულად, Vivida",
  },
  description:
    "ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობა, შენი დაბადების ზუსტი მომენტის მიხედვით. შექმენი შენი რუკა უფასოდ, ქართულად.",
  alternates: localizedAlternates("", "/en", "ka"),
  openGraph: {
    title: "ნატალური რუკა და ჰოროსკოპი ქართულად, Vivida",
    description:
      "ცოცხალი ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობის ანალიზი, შენი დაბადების ზუსტი მომენტის მიხედვით.",
    url: SITE_URL,
  },
  twitter: {
    title: "Vivida, ნატალური რუკა ქართულად",
    description:
      "ცოცხალი ნატალური რუკა და ყოველდღიური ჰოროსკოპი, შენი დაბადების ზუსტი მომენტის მიხედვით.",
  },
};

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vivida",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "პერსონალური ასტროლოგიური სერვისი, ნატალური რუკა, ყოველდღიური ჰოროსკოპი და თავსებადობა ქართულად.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@vivida.ge",
    contactType: "customer support",
    availableLanguage: ["Georgian", "English", "ka", "en"],
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vivida",
  url: SITE_URL,
  inLanguage: "ka-GE",
};

const FAQ_LD = faqLd(HOME_CONTENT.faq);

const PRO_PLAN = featuredPremiumPlanForCountry("GE");
const PRO_MONTHS = PRO_PLAN.intervalCount ?? 1;

const PRODUCT_LD = productLd({
  name: "Vivida PRO / Credits",
  url: SITE_URL,
  description:
    "დამატებითი ინსტრუმენტები ხელმისაწვდომია კრედიტებით ან PRO გამოწერით.",
  offers: [
    {
      name: PRO_MONTHS > 1 ? `Vivida PRO — ${PRO_MONTHS} თვე` : "Vivida PRO",
      price: PRO_PLAN.amountMinor / 100,
      priceCurrency: PRO_PLAN.currency.toUpperCase(),
      url: `${SITE_URL}/subscription`,
    },
    ...creditPacksForCountry("GE").map((pack) => ({
      name: `Vivida Credits — ${pack.credits} კრედიტი`,
      price: pack.amountMinor / 100,
      priceCurrency: pack.currency.toUpperCase(),
      url: `${SITE_URL}/credits`,
    })),
  ],
});

export default async function Home() {
  const { signs, pairs } = buildCalculatorData("ka");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(FAQ_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(PRODUCT_LD) }}
      />

      <main className="relative isolate flex-1 overflow-x-clip bg-background">
        <Starfield count={56} />

        {/* Unified 3-Zone Top Bar + Persistent Celestial Context Strip + Slide-Over Observatory Drawer */}
        <MarketingHeader />

        {/* Swiss-Grid Architectural Hero Ledger with Interactive Astrolabe Console */}
        <Hero />

        {/* Interactive Synastry & Solar Resonance Calculator */}
        <CompatibilityCalculator signs={signs} pairs={pairs} locale="ka" />

        {/* Explore Almanac Directory: Outlined cards inside recessed architectural frame */}
        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-md">
            <CornerCrosshair position="tl" />
            <CornerCrosshair position="tr" />
            <CornerCrosshair position="bl" />
            <CornerCrosshair position="br" />

            <div className="flex flex-col justify-between gap-2 border-b border-border bg-background/70 px-5 py-6 sm:flex-row sm:items-end sm:px-8">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--vivida-gold)]">
                  <span
                    aria-hidden
                    className="inline-block h-px w-5 bg-[var(--vivida-gold)]/70"
                  />
                  <span>ასტროლოგიური ალმანახი · ცნობარი</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  გამოიკვლიე ობსერვატორიის ინსტრუმენტები
                </h2>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                INDEX · 10 DIRECTORIES
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
              {[
                {
                  href: "/nataluri-ruka",
                  label: "ნატალური რუკა",
                  glyph: "☉",
                  code: "01",
                  accent: "text-[var(--vivida-gold)]",
                },
                {
                  href: "/horoskopi",
                  label: "დღის ჰოროსკოპი",
                  glyph: "☽",
                  code: "02",
                  accent: "text-[var(--vivida-cyan)]",
                },
                {
                  href: "/zodiac/tavsebadoba",
                  label: "თავსებადობა",
                  glyph: "♀",
                  code: "03",
                  accent: "text-[var(--vivida-pink)]",
                },
                {
                  href: "/taro",
                  label: "ტაროს არკანები",
                  glyph: "✦",
                  code: "04",
                  accent: "text-primary",
                },
                {
                  href: "/sizmris-akhsna",
                  label: "სიზმრის ახსნა",
                  glyph: "♆",
                  code: "05",
                  accent: "text-[var(--vivida-cyan)]",
                },
                {
                  href: "/mtvaris-kalendari",
                  label: "მთვარის კალენდარი",
                  glyph: "◐",
                  code: "06",
                  accent: "text-[var(--vivida-gold)]",
                },
                {
                  href: "/tests",
                  label: "ფსიქოლოგიური ტესტები",
                  glyph: "Ψ",
                  code: "07",
                  accent: "text-[var(--vivida-pink)]",
                },
                {
                  href: "/numerologia",
                  label: "ნუმეროლოგია",
                  glyph: "∑",
                  code: "08",
                  accent: "text-primary",
                },
                {
                  href: "/chinuri-horoskopi",
                  label: "ჩინური ჰოროსკოპი",
                  glyph: "辰",
                  code: "09",
                  accent: "text-[var(--vivida-gold)]",
                },
                {
                  href: "/zodiac",
                  label: "ზოდიაქოს ნიშნები",
                  glyph: "♈",
                  code: "10",
                  accent: "text-[var(--vivida-cyan)]",
                },
              ].map((item) => (
                <TrackedPublicLink
                  key={item.href}
                  href={item.href}
                  event="next"
                  target={item.href}
                  feature="home"
                  surface="explore_rail"
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs transition-all hover:border-primary/45 hover:bg-secondary/50"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">{item.code}</span>
                    <span className={`font-mono text-base ${item.accent}`}>
                      {item.glyph}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="font-mono text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    >
                      →
                    </span>
                  </div>
                </TrackedPublicLink>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />
        <PillarsSection />
        <HowItWorksSection />
        <PricingAnchor />
        <LatestArticlesSection locale="ka" />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
