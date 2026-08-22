import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Crown, Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getBalance } from "@/lib/credits";
import { getReferralStats } from "@/lib/referral";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { InviteCard } from "@/components/invite/invite-card";
import { TopUpCard } from "@/components/credits/top-up-card";
import { CreditEarnInfo } from "@/components/credits/earn-info";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";
import { premiumPlanForCountry } from "@/lib/billing-config";
import { countryCodeFromHeaders, setResidenceCountryIfMissing } from "@/lib/residence";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import { LowCreditOfferCard } from "@/components/subscription/low-credit-offer-card";
import { getLowCreditOffer } from "@/lib/promo-offer";
import { kaDayMonthGenitive } from "@/lib/i18n/ka-date";
import { Suspense } from "react";
import { CheckoutSuccessTracker } from "@/components/billing/checkout-success-tracker";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";
  return { title: am ? "Կրեդիտներ" : en ? "Credits" : "კრედიტები", robots: { index: false } };
}
export const dynamic = "force-dynamic";

const SITE_URL: Record<UserLocale, string> = {
  ka: "https://www.vivida.ge",
  en: "https://www.vividaastro.com",
  am: "https://www.vividaastro.com/am",
};

/**
 * Credits hub — balance, the invite/earn loop, and (Phase 3) Stripe top-up.
 */
export default async function CreditsPage() {
  const user = await requireUser();
  // getUserLocale, not getRequestLocale: this surface has no `/am` prefix, so
  // the stored preference is the only way an Armenian user stays in Armenian
  // once signed in.
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";
  const am = locale === "am";
  const [balance, ref, storedIdentity, premium, offer] = await Promise.all([
    getBalance(user.id),
    getReferralStats(user.id),
    getBillingIdentity(user.id),
    isPremiumUser(user.id),
    // Null for everyone the low-credit campaign did not email, which is the
    // whole point — the promo price must not leak to the rest of Georgia.
    getLowCreditOffer(user.id),
  ]);
  // Accounts created before residence tracking have no country, which would
  // hide PRO and fall the packs back to GEL by luck rather than by geo. Same
  // one-time backfill /subscription does.
  let identity = storedIdentity;
  if (identity && !identity.countryCode) {
    const detected = countryCodeFromHeaders(await headers());
    await setResidenceCountryIfMissing(user.id, detected);
    identity = { ...identity, countryCode: detected };
  }
  const link = `${SITE_URL[locale]}/?ref=${ref.code}`;
  const premiumPlan = premiumPlanForCountry(identity?.countryCode);

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
      <Suspense fallback={null}><CheckoutSuccessTracker /></Suspense>

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        {/* Balance */}
        <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {am ? "Ձեր հաշվեկշիռը" : en ? "Your balance" : "შენი ბალანსი"}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Sparkles className="size-7 text-[var(--vivida-cyan)]" />
            <span className="text-6xl font-bold tabular-nums tracking-tight">
              {balance}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {am ? "կրեդիտներ" : en ? "credits" : "კრედიტი"}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/75">
            {en
              ? "Use credits to unlock full test results, compatibility readings, AI chat, forecasts, and reports. Invite friends or top up your balance."
              : "კრედიტებით ხსნი ტესტების სრულ შედეგებს, სინასტრიებს, AI-ჩატს, პროგნოზებსა და რეპორტებს. მოიწვიე მეგობრები ან შეავსე ბალანსი."}
          </p>
        </div>

        {premium ? (
          <Link
            href="/subscription"
            className="mt-4 flex items-center justify-between rounded-3xl border border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/8 p-6 transition-colors hover:bg-[var(--vivida-gold)]/12"
          >
            <span className="flex items-center gap-3 font-semibold">
              <Crown className="size-5 text-[var(--vivida-gold)]" />
              {am ? "Կառավարեք Ձեր Vivida PRO բաժանորդագրությունը" : en ? "Manage your Vivida PRO subscription" : "Vivida PRO გამოწერის მართვა"}
            </span>
            <span aria-hidden>→</span>
          </Link>
        ) : offer ? (
          // The offer replaces the standard PRO card rather than sitting beside
          // it: two prices for the same thing is a reason to hesitate.
          <div className="mt-4">
            <LowCreditOfferCard
              plan={offer.plan}
              months={offer.months}
              deadlineLabel={
                locale === "ka"
                  ? kaDayMonthGenitive(offer.endsAt)
                  : new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                    }).format(offer.endsAt)
              }
              standardPlan={premiumPlan}
              locale={locale}
            />
          </div>
        ) : premiumPlan ? (
          <div className="mt-4">
            <PremiumPlanCard
              plan={premiumPlan}
              locale={locale}
              placement="credits_hub"
            />
          </div>
        ) : null}

        {/* Top-up is kept directly below the balance so there is no hunt or scroll. */}
        <div className="mt-4">
          <TopUpCard locale={locale} countryCode={identity?.countryCode} />
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
