import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Crown, Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import {
  getBalance,
  getCreditHistoryPage,
  getRecentSpend,
  type CreditHistoryFilter,
} from "@/lib/credits";
import { getReferralStats } from "@/lib/referral";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { InviteCard } from "@/components/invite/invite-card";
import { TopUpCard } from "@/components/credits/top-up-card";
import { CreditEarnInfo } from "@/components/credits/earn-info";
import {
  getRequestLocale,
  requestIsEnglishHost,
} from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";
import {
  premiumPlanForCountry,
  shouldShowPurchasePromotion,
} from "@/lib/billing-config";
import {
  countryCodeFromHeaders,
  setResidenceCountryIfMissing,
} from "@/lib/residence";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import { LowCreditOfferCard } from "@/components/subscription/low-credit-offer-card";
import { getLowCreditOffer } from "@/lib/promo-offer";
import { kaDayMonthGenitive } from "@/lib/i18n/ka-date";
import { Suspense } from "react";
import { CheckoutSuccessTracker } from "@/components/billing/checkout-success-tracker";
import { CreditsVsPro } from "@/components/billing/credits-vs-pro";
import { SpendAnchor } from "@/components/billing/spend-anchor";
import { CreditHistory } from "@/components/credits/credit-history";
import { CreditProgressCard } from "@/components/credits/credit-progress-card";
import { PhoneGiftCard } from "@/components/phone-gift/phone-gift-card";
import { CryptoPayHost } from "@/components/crypto/crypto-pay";
import { isCryptoPayConfigured } from "@/lib/crypto-pay";
import { getPhoneGiftState } from "@/lib/phone-gift";
import { phoneGiftCardEligible } from "@/lib/phone-gift-pure";
import { nextMonthlyBonusDate } from "@/lib/credit-progress";
import { monthlyBonusEligible } from "@/lib/monthly-bonus-eligibility";
import { monthlyGateFor } from "@/lib/payer";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return { title: en ? "Credits" : "კრედიტები", robots: { index: false } };
}
export const dynamic = "force-dynamic";

const SITE_URL: Record<UserLocale, string> = {
  ka: "https://www.vivida.ge",
  en: "https://www.vividaastro.com",
};

/**
 * Credits hub, balance, the invite/earn loop, and (Phase 3) Stripe top-up.
 */
export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{
    history?: string | string[];
    page?: string | string[];
    next?: string | string[];
    need?: string | string[];
    product?: string | string[];
    pack?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const returnTo = rawNext ? normalizeReturnPath(rawNext) : null;
  const rawNeed = Array.isArray(query.need) ? query.need[0] : query.need;
  const parsedNeed = Number.parseInt(rawNeed ?? "", 10);
  const neededCredits =
    Number.isFinite(parsedNeed) && parsedNeed > 0 && parsedNeed <= 100
      ? parsedNeed
      : null;
  const loginQuery = new URLSearchParams();
  if (returnTo) loginQuery.set("next", returnTo);
  if (neededCredits) loginQuery.set("need", String(neededCredits));
  const rawProduct = Array.isArray(query.product)
    ? query.product[0]
    : query.product;
  const product =
    typeof rawProduct === "string" && /^[a-z0-9_-]{1,60}$/i.test(rawProduct)
      ? rawProduct
      : null;
  if (product) loginQuery.set("product", product);
  const rawPack = Array.isArray(query.pack) ? query.pack[0] : query.pack;
  const selectedPackId =
    rawPack === "s" || rawPack === "m" || rawPack === "l" ? rawPack : null;
  if (selectedPackId) loginQuery.set("pack", selectedPackId);
  const loginReturn =
    loginQuery.size > 0 ? `/credits?${loginQuery.toString()}` : "/credits";
  // Campaign emails link here directly. Preserve the destination for readers
  // whose browser session expired so signing in still lands on their offer.
  const user = await requireUser(loginReturn);
  // getUserLocale, not getRequestLocale: this surface has no `/am` prefix, so
  // the stored preference is the only way an Armenian user stays in Armenian
  // once signed in.
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";
  const historyParam = Array.isArray(query.history)
    ? query.history[0]
    : query.history;
  const historyFilter: CreditHistoryFilter =
    historyParam === "earned" || historyParam === "spent"
      ? historyParam
      : "all";
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const historyPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  // Phone-gift needs a Georgian number: gate by host, not by the stored
  // interface preference (an English-preference account on vivida.ge keeps
  // the card; a Georgian-preference account on vividaastro.com hides it).
  const hostEn = (await getRequestLocale()) === "en";
  // English host pays by card (Stripe checkout is disabled there); the
  // Georgian site keeps its Stripe surfaces untouched.
  const cryptoPay = (await requestIsEnglishHost()) && isCryptoPayConfigured();
  const [
    balance,
    ref,
    storedIdentity,
    premium,
    offer,
    history,
    recentSpend,
    giftState,
    monthlyGate,
  ] = await Promise.all([
    getBalance(user.id),
    getReferralStats(user.id),
    getBillingIdentity(user.id),
    isPremiumUser(user.id),
    // Null for everyone the low-credit campaign did not email, which is the
    // whole point, the promo price must not leak to the rest of Georgia.
    getLowCreditOffer(user.id),
    getCreditHistoryPage(user.id, {
      filter: historyFilter,
      page: historyPage,
    }),
    // Trailing-30-day gated-action spend for the PRO value anchor (one
    // indexed SUM; the component stays hidden for premium/light spenders).
    getRecentSpend(user.id),
    // Phone-gift campaign eligibility for the verify-your-number card.
    getPhoneGiftState(user.id),
    // Monthly-drop gate, so the progress card never promises a paused bonus.
    monthlyGateFor(user.id),
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
  const showPurchasePromotions = shouldShowPurchasePromotion({
    isPremium: premium,
    balance,
  });
  // need/product/pack only come from a paywall, where the buyer already chose:
  // the phone-gift campaign must not push the paid options any further down.
  const fromPaywall = Boolean(neededCredits || product || selectedPackId);

  return (
    <CryptoPayHost>
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
        <Suspense fallback={null}>
          <CheckoutSuccessTracker locale={locale} />
        </Suspense>

        <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
          {/* Payment options open the page: a paywall bounce has no scroll to spare. */}
          <div id="credit-packs" className="scroll-mt-20">
            <TopUpCard
              locale={locale}
              countryCode={identity?.countryCode}
              balance={balance}
              neededCredits={neededCredits}
              returnTo={returnTo}
              product={product}
              selectedPackId={selectedPackId}
              crypto={cryptoPay}
            />
          </div>

          {premium ? (
            <Link
              href="/subscription"
              className="mt-4 flex items-center justify-between rounded-3xl border border-[var(--vivida-gold)]/35 bg-[var(--vivida-gold)]/8 p-6 transition-colors hover:bg-[var(--vivida-gold)]/12"
            >
              <span className="flex items-center gap-3 font-semibold">
                <Crown className="size-5 text-[var(--vivida-gold)]" />
                {en
                  ? "Manage your Vivida PRO subscription"
                  : "Vivida PRO გამოწერის მართვა"}
              </span>
              <span aria-hidden>→</span>
            </Link>
          ) : showPurchasePromotions && cryptoPay ? (
            <div id="pro-plan" className="mt-4 scroll-mt-20">
              <PremiumPlanCard
                plan={premiumPlan}
                locale={locale}
                placement="credits_hub"
                crypto
              />
            </div>
          ) : showPurchasePromotions && offer ? (
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
          ) : showPurchasePromotions && premiumPlan ? (
            <div id="pro-plan" className="mt-4 scroll-mt-20">
              <PremiumPlanCard
                plan={premiumPlan}
                locale={locale}
                placement="credits_hub"
              />
            </div>
          ) : null}

          {showPurchasePromotions && !offer && (
            <div className="mt-4">
              <CreditsVsPro
                locale={locale}
                countryCode={identity?.countryCode}
                placement="credits_hub_comparison"
                creditHref="#credit-packs"
                proHref="#pro-plan"
                balance={balance}
                crypto={cryptoPay}
              />
            </div>
          )}

          {/* Balance */}
          <div className="mt-4">
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
                  ? "Use credits to unlock full test results, compatibility readings, AI chat, forecasts, and reports. Invite friends or top up your balance."
                  : "კრედიტებით ხსნი ტესტების სრულ შედეგებს, სინასტრიებს, AI-ჩატს, პროგნოზებსა და რეპორტებს. მოიწვიე მეგობრები ან შეავსე ბალანსი."}
              </p>
            </div>
          </div>

          {!premium && (
            <div className="mt-4">
              <SpendAnchor
                spend={recentSpend}
                countryCode={identity?.countryCode}
                locale={locale}
              />
            </div>
          )}

          <div className="mt-4">
            <CreditProgressCard
              balance={balance}
              nextMonthlyDate={nextMonthlyBonusDate()}
              locale={locale}
              monthlyPausedReason={
                monthlyBonusEligible(monthlyGate) ? null : "inactivity"
              }
            />
          </div>

          {!hostEn && !fromPaywall && phoneGiftCardEligible(giftState) && (
            <div className="mt-4">
              <PhoneGiftCard locale={locale} />
            </div>
          )}

          <div className="mt-4">
            <CreditHistory
              history={history}
              filter={historyFilter}
              locale={locale}
            />
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
    </CryptoPayHost>
  );
}
