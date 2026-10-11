"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Coins, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  creditPacksForCountry,
  discountedPremiumPlanForCountry,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
  premiumPlanSavingsPercent,
  premiumPlanForCountry,
  shouldShowPurchasePromotion,
} from "@/lib/billing-config";
import {
  USDC_CREDIT_PACKS,
  USDC_CURRENCY,
  USDC_PREMIUM_PASS,
} from "@/lib/crypto-config";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { trackExperimentOutcome, useExperiment } from "@/lib/use-experiment";
import { cn } from "@/lib/utils";

type BillingContext = "general" | "natal_report";

export function CreditsVsPro({
  locale,
  countryCode,
  placement,
  creditHref,
  proHref,
  context = "general",
  compact = false,
  balance,
  isPremium = false,
  crypto = false,
  experimentEnabled = true,
}: {
  locale: UserLocale;
  countryCode?: string | null;
  placement: string;
  creditHref: string;
  proHref: string;
  context?: BillingContext;
  compact?: boolean;
  balance?: number;
  isPremium?: boolean;
  crypto?: boolean;
  experimentEnabled?: boolean;
}) {
  const en = locale === "en";
  // Crypto rail (English host): the comparison prices the USDC pack and the
  // one-time 30-day PRO pass instead of the Stripe catalogue, and there is no
  // discounted multi-month plan to upsell.
  const cryptoPack = USDC_CREDIT_PACKS[0];
  const starterPack = creditPacksForCountry(countryCode)[0];
  const standardPro = premiumPlanForCountry(countryCode);
  const discountedPro = crypto
    ? undefined
    : discountedPremiumPlanForCountry(countryCode);
  const pro = featuredPremiumPlanForCountry(countryCode);
  const proMonths = pro.intervalCount ?? 1;
  const proSavings = discountedPro
    ? premiumPlanSavingsPercent(standardPro, discountedPro)
    : 0;
  const creditAmountMinor = crypto
    ? cryptoPack.amountMinor
    : starterPack.amountMinor;
  const creditCurrency = crypto ? USDC_CURRENCY : starterPack.currency;
  const creditCount = crypto ? cryptoPack.credits : starterPack.credits;
  const proAmountMinor = crypto
    ? USDC_PREMIUM_PASS.amountMinor
    : pro.amountMinor;
  const proCurrency = crypto ? USDC_CURRENCY : pro.currency;
  const proTrackingKey = crypto ? USDC_PREMIUM_PASS.key : pro.key;
  const variant = useExperiment(
    EXPERIMENTS.pricingPresentation,
    placement,
    experimentEnabled,
  );
  const showPromotion =
    balance == null
      ? !isPremium
      : shouldShowPurchasePromotion({ isPremium, balance });

  useEffect(() => {
    if (!showPromotion) return;
    trackEvent(ANALYTICS_EVENT.proExposure, {
      product: proTrackingKey,
      placement,
      value: proAmountMinor / 100,
      currency: proCurrency,
    });
  }, [placement, proAmountMinor, proCurrency, proTrackingKey, showPromotion]);

  function trackChoice(destination: "credits" | "subscription") {
    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
      placement,
      destination,
      product: "billing_choice",
      payment_model: destination === "credits" ? "one_time" : "subscription",
    });
    if (experimentEnabled) {
      trackExperimentOutcome(
        EXPERIMENTS.pricingPresentation,
        placement,
        destination === "credits" ? "choice_credits" : "choice_pro",
      );
    }
  }

  const heading =
    context === "natal_report"
      ? en
        ? "Choose how to unlock deeper insight"
        : "აირჩიე, როგორ გახსნა ღრმა ანალიზი"
      : en
        ? "Choose what fits your rhythm"
        : "აირჩიე შენთვის მოსახერხებელი გზა";

  if (!showPromotion) return null;

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-card/55 ring-1 ring-foreground/5 backdrop-blur-xl",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
      )}
    >
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {en ? "Simple pricing" : "მარტივი არჩევანი"}
        </p>
        <h2
          className={cn(
            "mt-2 font-semibold tracking-tight",
            compact ? "text-xl" : "text-2xl",
          )}
        >
          {heading}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          {context === "natal_report"
            ? en
              ? crypto
                ? "Pay once with credits for this report, or get 30 days of PRO — unlimited reports, tarot, AI chat, and forecasts."
                : "Pay once with credits for this report, or choose PRO for unlimited reports, tarot, AI chat, and forecasts."
              : "ამ ანგარიშისთვის გადაიხადე ერთხელ კრედიტებით, ან აირჩიე PRO — ულიმიტო ანგარიშებისთვის, ტაროსთვის, AI ჩატისა და პროგნოზებისთვის."
            : en
              ? crypto
                ? "Credits are a one-time purchase. PRO is a one-time 30-day pass — no auto-renewal."
                : discountedPro
                  ? "Credits are a one-time purchase. PRO unlocks everything for 3 months at a discounted price."
                  : "Credits are a one-time purchase. PRO is unlimited monthly access."
              : discountedPro
                ? "კრედიტები ერთჯერადი შენაძენია, PRO კი ყველაფერს 3 თვით, ფასდაკლებით ხსნის."
                : "კრედიტები ერთჯერადი შენაძენია, PRO კი — ყოველთვიური ულიმიტო წვდომა."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <article
          className={cn(
            "flex flex-col rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/7 p-5",
            variant === "pro_first" && "sm:order-2",
          )}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
            <Coins className="size-4" />
            {en ? "Pay as you go" : "გადაიხადე საჭიროებისას"}
          </div>
          <h3 className="mt-3 text-xl font-semibold">
            {en ? "Credits" : "კრედიტები"}
          </h3>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">
              {formatBillingAmount(creditAmountMinor, creditCurrency, locale)}
            </span>
            <span className="text-xs text-muted-foreground">
              / {creditCount} {en ? "credits" : "კრედიტი"}
            </span>
          </div>
          <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground/75">
            {[
              en
                ? "Best for occasional unlocks"
                : "საუკეთესოა იშვიათი გახსნებისთვის",
              en
                ? "No subscription or auto-renewal"
                : "გამოწერისა და ავტოგანახლების გარეშე",
              en
                ? "Unused credits stay in your balance"
                : "დარჩენილი კრედიტები ბალანსზე ინახება",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href={creditHref} onClick={() => trackChoice("credits")}>
              {en ? "Choose credits" : "აირჩიე კრედიტები"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>

        <article
          className={cn(
            "relative flex flex-col overflow-hidden rounded-2xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-gold)]/12 to-[var(--vivida-violet)]/10 p-5",
            variant === "pro_first" && "sm:order-1",
          )}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-12 size-36 rounded-full bg-[var(--vivida-gold)]/12 blur-3xl"
          />
          <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
            {discountedPro && (
              <span className="ml-auto rounded-full bg-[var(--vivida-gold)]/16 px-2 py-0.5 text-[9px]">
                −{proSavings}%
              </span>
            )}
          </div>
          <h3 className="relative mt-3 text-xl font-semibold">
            {en ? "Unlimited access" : "ულიმიტო წვდომა"}
          </h3>
          <div className="relative mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">
              {formatBillingAmount(proAmountMinor, proCurrency, locale)}
            </span>
            <span className="text-xs text-muted-foreground">
              /{" "}
              {crypto
                ? en
                  ? "30 days"
                  : "30 დღე"
                : proMonths === 1
                  ? en
                    ? "month"
                    : "თვე"
                  : en
                    ? `${proMonths} months`
                    : `${proMonths} თვე`}
            </span>
          </div>
          {discountedPro && (
            <p className="relative mt-1 text-xs font-medium text-[var(--vivida-gold)]">
              {en ? "Only" : "მხოლოდ"}{" "}
              {formatBillingAmount(
                Math.round(pro.amountMinor / proMonths),
                pro.currency,
                locale,
              )}
              {en ? " per month" : " თვეში"}
            </p>
          )}
          <ul className="relative mt-4 flex-1 space-y-2 text-sm text-foreground/75">
            {[
              en
                ? "Every credit-gated feature, unlimited"
                : "ყველა კრედიტიანი ფუნქცია ულიმიტოდ",
              en
                ? "Best for frequent readings and questions"
                : "საუკეთესოა ხშირი კითხვებისა და წაკითხვებისთვის",
              crypto
                ? "No auto-renewal — buy again anytime"
                : en
                  ? "Cancel anytime"
                  : "გააუქმე ნებისმიერ დროს",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-gold)]" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="mystic" className="relative mt-5 w-full">
            <Link href={proHref} onClick={() => trackChoice("subscription")}>
              {en ? "Choose PRO" : "აირჩიე PRO"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>
      </div>
    </section>
  );
}
