import type { Metadata } from "next";
import Link from "next/link";
import { Check, Heart, Lock, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { SiteFooter } from "@/components/site-footer";
import { VividaMark } from "@/components/brand/vivida-mark";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { DEFAULT_OG_IMAGE, samePathAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/tavsebadoba";

/**
 * Focused, distraction-light landing page used as the Facebook ad
 * destination. The interactive compatibility calculator is the hero, cold
 * traffic gets an instant, shareable result with no signup, then a single
 * CTA into the product. Kept separate from the SEO hub at
 * /zodiac/tavsebadoba so the ad message → page → action stays tight.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  const en = locale === "en";
  const title = en
    ? "Zodiac Compatibility Calculator, Check Your Match | Vivida"
    : "ზოდიაქოს თავსებადობა, შეამოწმე შენი წყვილი | Vivida";
  const description = en
    ? "Choose two zodiac signs and check your love compatibility instantly, free and without registration. Then explore complete natal-chart compatibility on Vivida."
    : "გაიგე რამდენად თავსებადი ხართ შენ და შენი სიყვარული ზოდიაქოს ნიშნების მიხედვით, უფასოდ, 10 წამში. შემდეგ ნახე სრული ნატალური თავსებადობა Vivida-ზე.";
  return {
    title: { absolute: title },
    description,
    keywords: en
      ? [
          "zodiac compatibility",
          "love compatibility calculator",
          "astrology compatibility",
          "zodiac match",
        ]
      : [
          "თავსებადობა",
          "ზოდიაქოს თავსებადობა",
          "სიყვარულის თავსებადობა",
          "ნიშნების თავსებადობა",
          "თავსებადობის ტესტი",
          "ვის ვუხდები",
          "tavsebadoba",
        ],
    // Keep the ad landing self-canonical on each host. /compatibility is
    // already paired with the separate Georgian hub /zodiac/tavsebadoba, so
    // its English twin is the same path on the English host, not the alias.
    alternates: samePathAlternates(PATH, en ? "en" : "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${en ? "https://www.vividaastro.com" : SITE_URL}${PATH}`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const TRUST_KA = [
  { icon: Check, label: "უფასო, ბარათის გარეშე" },
  { icon: Lock, label: "რეგისტრაციის გარეშე" },
  { icon: Sparkles, label: "ქართულად" },
];

const TRUST_EN = [
  { icon: Check, label: "Free, no card required" },
  { icon: Lock, label: "No registration" },
  { icon: Sparkles, label: "Instant result" },
];

export default async function TavsebadobaPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const { signs, pairs } = buildCalculatorData(locale);
  const trustList = en ? TRUST_EN : TRUST_KA;

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_350/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(35%_25%_at_12%_80%,oklch(0.32_0.16_305/0.35),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />

      {/* Minimal header, fewer exits on cold ad traffic */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href={"/"} className="flex items-center gap-2">
          <VividaMark size={36} id="tavsebadoba" />
          <span
            className="bg-clip-text text-lg font-semibold tracking-tight text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {en ? "Log in" : "შესვლა"}
        </Link>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 text-center sm:px-6 sm:pt-12">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Heart
            className="size-3.5 text-[var(--vivida-pink)]"
            fill="currentColor"
          />
          {en ? "Zodiac compatibility" : "ზოდიაქოს თავსებადობა"}
        </span>

        <h1 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          {en ? "How compatible are " : "რამდენად თავსებადი ხართ "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {en ? "you and your person?" : "შენ და შენი სიყვარული?"}
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          {en
            ? "Choose two zodiac signs and discover your compatibility instantly, free."
            : "აირჩიე ორი ნიშანი და გაიგე თქვენი თავსებადობა მყისიერად, უფასოდ."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {trustList.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
            >
              <Icon className="size-3.5" strokeWidth={2.5} />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <CompatibilityCalculator
            signs={signs}
            pairs={pairs}
            locale={locale}
          />
        </div>
      </section>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent"
      />
      {/* Without an explicit locale the footer falls back to Georgian, which
          was the entire source of Georgian text on the English page. */}
      <SiteFooter locale={locale} />
    </main>
  );
}
