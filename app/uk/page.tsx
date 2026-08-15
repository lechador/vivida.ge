import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, ShieldCheck, Sparkles, Star } from "lucide-react";

import { VividaMark } from "@/components/brand/vivida-mark";
import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { creditPacksForCountry, formatBillingAmount, premiumPlanForCountry } from "@/lib/billing-config";

export const metadata: Metadata = {
  title: "Free Birth Chart & Personal Astrology | Vivida UK",
  description: "Calculate your full birth chart free, then unlock personal readings with Vivida PRO or one-time credits.",
  robots: { index: false, follow: true },
};

const pro = premiumPlanForCountry("GB")!;
const packs = creditPacksForCountry("GB");

export default function UkCampaignLandingPage() {
  return (
    <main lang="en" className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(65%_42%_at_50%_-5%,oklch(0.36_0.19_305/0.52),transparent_72%),radial-gradient(42%_32%_at_86%_28%,oklch(0.34_0.15_220/0.38),transparent_70%)]" />
      <Starfield count={135} shooting={3} />
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/uk" className="flex items-center gap-2"><VividaMark size={38} id="uk-campaign" /><span className="text-lg font-semibold">vivida</span></Link>
        <Button asChild size="sm" variant="outline"><Link href="/login?next=%2Freport">Log in</Link></Button>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-8 pt-8 text-center sm:px-6 sm:pt-14">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/8 px-3 py-1.5 text-xs text-[var(--vivida-gold)]"><Star className="size-3.5" /> Your chart is more than your star sign</div>
        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">Your Sun sign is only the beginning.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-foreground/75 sm:text-xl">Calculate your full birth chart free. Discover your Moon, Rising sign, houses and the patterns that make you unmistakably you.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[var(--vivida-cyan)]" /> Instant result</span><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[var(--vivida-cyan)]" /> No card required</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--vivida-cyan)]" /> Private by design</span></div>
        <Button asChild variant="mystic" size="lg" className="mt-7"><a href="#calculator"><Sparkles className="size-4" /> Calculate my free chart</a></Button>
      </section>

      <section id="calculator" className="relative z-10 mx-auto w-full max-w-3xl scroll-mt-6 px-4 py-10 sm:px-6">
        <div className="mb-5 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">Free birth chart</p><h2 className="mt-2 text-3xl font-semibold">Enter your birth details</h2><p className="mt-2 text-sm text-muted-foreground">Exact birth time gives the most accurate Rising sign and houses.</p></div>
        <PublicNatalCalculator locale="en" acquisitionMode />
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">Choose your depth</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Go unlimited, or unlock only what you want</h2></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-3xl border border-[var(--vivida-gold)]/40 bg-gradient-to-br from-[var(--vivida-gold)]/14 via-card/70 to-[var(--vivida-violet)]/12 p-7">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--vivida-gold)]"><Crown className="size-5" /> VIVIDA PRO</div>
            <div className="mt-3 text-4xl font-bold">{formatBillingAmount(pro.amountMinor, pro.currency, "en")}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">{["Unlimited personal astrology readings", "Unlimited compatibility, forecasts and AI chat", "Full test results and PDF reports", "Verified badge on your profile"].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />{item}</li>)}</ul>
            <Button asChild variant="mystic" className="mt-6 w-full"><Link href="/signup?next=%2Fonboarding%3Fnext%3D%252Fsubscription">Start free account & get PRO</Link></Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Renews monthly. Cancel anytime. Secure checkout by Stripe.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card/60 p-7">
            <div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="size-5 text-[var(--vivida-cyan)]" /> PAY AS YOU GO</div>
            <p className="mt-2 text-sm text-muted-foreground">One-time credit packs. No subscription.</p>
            <div className="mt-5 space-y-3">{packs.map((pack, i) => <div key={pack.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/30 px-4 py-3"><div><span className="font-semibold">{pack.credits} credits</span><span className="ml-2 text-xs text-muted-foreground">{i === 0 ? "Starter" : i === 1 ? "Most popular" : "Best value"}</span></div><span className="font-semibold">{formatBillingAmount(pack.amountMinor, pack.currency, "en")}</span></div>)}</div>
            <Button asChild variant="outline" className="mt-6 w-full"><Link href="/signup?next=%2Fonboarding%3Fnext%3D%252Fcredits">Create free account</Link></Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">Entertainment and self-reflection, not medical or professional advice. <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link></footer>
    </main>
  );
}
