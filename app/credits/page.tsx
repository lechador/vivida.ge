import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getBalance } from "@/lib/credits";
import { getReferralStats } from "@/lib/referral";
import { getStreakProgress } from "@/lib/streak-credits";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { InviteCard } from "@/components/invite/invite-card";
import { TopUpCard } from "@/components/credits/top-up-card";
import { CreditEarnInfo } from "@/components/credits/earn-info";
import { StreakCard } from "@/components/credits/streak-card";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLocale()) === "en";
  return { title: en ? "Credits" : "კრედიტები", robots: { index: false } };
}
export const dynamic = "force-dynamic";

const SITE_URL = {
  ka: "https://www.vivida.ge",
  en: "https://vividaastro.com",
} as const;

/**
 * Credits hub — balance, the invite/earn loop, and (Phase 3) Stripe top-up.
 */
export default async function CreditsPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const user = await requireUser();
  const [balance, ref, streak] = await Promise.all([
    getBalance(user.id),
    getReferralStats(user.id),
    getStreakProgress(user.id),
  ]);
  const link = `${SITE_URL[locale]}/?ref=${ref.code}`;

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <AppHeader authed />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        {/* Balance */}
        <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Your balance" : "შენი ბალანსი"}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Sparkles className="size-7 text-[var(--vivida-cyan)]" />
            <span className="text-6xl font-bold tabular-nums tracking-tight">
              {balance}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {en ? "credits" : "კრედიტი"}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/75">
            {en
              ? "Use credits to unlock full test results, new compatibility readings, AI chat, and audio horoscopes. Invite friends or top up your balance."
              : "კრედიტებით ხსნი ტესტების სრულ შედეგებს, ახალ სინასტრიებს, AI-ჩატსა და აუდიო-ჰოროსკოპს. მოიწვიე მეგობრები ან შეავსე ბალანსი."}
          </p>
        </div>

        {/* Top-up is kept directly below the balance so there is no hunt or scroll. */}
        <div className="mt-4">
          <TopUpCard locale={locale} />
        </div>

        {/* Completed-ritual streak — repeatable weekly reward cycle. */}
        <div className="mt-4">
          <StreakCard progress={streak} locale={locale} />
        </div>

        {/* How to earn for free. */}
        <div className="mt-4">
          <CreditEarnInfo locale={locale} />
        </div>

        {/* Invite / earn */}
        <div className="mt-4">
          <InviteCard
            link={link}
            invited={ref.invited}
            qualified={ref.qualified}
            locale={locale}
          />
        </div>
      </section>
    </main>
  );
}
