import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Heart, Lock, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { Starfield } from "@/components/landing/starfield";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { SiteFooter } from "@/components/site-footer";
import { VividaMark } from "@/components/brand/vivida-mark";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/tavsebadoba";

/**
 * Focused, distraction-light landing page used as the Facebook ad
 * destination. The interactive compatibility calculator is the hero — cold
 * traffic gets an instant, shareable result with no signup, then a single
 * CTA into the product. Kept separate from the SEO hub at
 * /zodiac/tavsebadoba so the ad message → page → action stays tight.
 */
export const metadata: Metadata = {
  title: {
    absolute: "ზოდიაქოს თავსებადობა — შეამოწმე შენი წყვილი | Vivida",
  },
  description:
    "გაიგე რამდენად თავსებადი ხართ შენ და შენი სიყვარული ზოდიაქოს ნიშნების მიხედვით — უფასოდ, 10 წამში. შემდეგ ნახე სრული ნატალური თავსებადობა Vivida-ზე.",
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PATH}`,
    title: "ზოდიაქოს თავსებადობა — შეამოწმე შენი წყვილი",
    description:
      "აირჩიე ორი ნიშანი და გაიგე თქვენი თავსებადობა მყისიერად. უფასოდ.",
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ზოდიაქოს თავსებადობა — შეამოწმე შენი წყვილი",
    description: "აირჩიე ორი ნიშანი და გაიგე თქვენი თავსებადობა მყისიერად.",
  },
};

const TRUST = [
  { icon: Check, label: "უფასო, ბარათის გარეშე" },
  { icon: Lock, label: "რეგისტრაციის გარეშე" },
  { icon: Sparkles, label: "ქართულად" },
];

export default async function TavsebadobaPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/feed");

  const { signs, pairs } = buildCalculatorData();

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_350/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(35%_25%_at_12%_80%,oklch(0.32_0.16_305/0.35),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />

      {/* Minimal header — fewer exits on cold ad traffic */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
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
          შესვლა
        </Link>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 text-center sm:px-6 sm:pt-12">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Heart className="size-3.5 text-[var(--vivida-pink)]" fill="currentColor" />
          ზოდიაქოს თავსებადობა
        </span>

        <h1 className="text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          რამდენად თავსებადი ხართ{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            შენ და შენი სიყვარული?
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          აირჩიე ორი ნიშანი და გაიგე თქვენი თავსებადობა მყისიერად — უფასოდ.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {TRUST.map(({ icon: Icon, label }) => (
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
          <CompatibilityCalculator signs={signs} pairs={pairs} />
        </div>
      </section>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent"
      />
      <SiteFooter />
    </main>
  );
}
