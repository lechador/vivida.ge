"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  discountedPremiumPlanForCountry,
  formatBillingAmount,
  premiumPlanSavingsPercent,
  type PremiumPlan,
} from "@/lib/billing-config";
import { USDC_PREMIUM_PASS } from "@/lib/crypto-config";
import { PayByCardButton } from "@/components/crypto/crypto-pay";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

const FEATURES_EN = [
  "Unlimited access to every credit-gated feature",
  "Full test results, compatibility and forecasts",
  "Unlimited AI chat, tarot and PDF reports",
  "Verified badge on your profile",
];
const FEATURES_KA = [
  "ყველა კრედიტიან ფუნქციაზე ულიმიტო წვდომა",
  "ტესტების სრული შედეგები, თავსებადობა და პროგნოზები",
  "ულიმიტო AI ჩატი, ტარო და PDF ანგარიშები",
  "Verified badge შენს პროფილზე",
];

export function PremiumPlanCard({
  plan,
  locale,
  active = false,
  placement = "premium_plan_card",
  returnTo,
  product,
  crypto = false,
}: {
  plan: PremiumPlan;
  locale: UserLocale;
  active?: boolean;
  placement?: string;
  returnTo?: string | null;
  product?: string | null;
  /** English site: one-time card pass instead of a Stripe subscription. */
  crypto?: boolean;
}) {
  const en = locale !== "ka";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const discountedPlan = discountedPremiumPlanForCountry(plan.countryCode);
  const [selectedKey, setSelectedKey] = useState(
    () => discountedPlan?.key ?? plan.key,
  );
  const selectedPlan =
    discountedPlan?.key === selectedKey ? discountedPlan : plan;
  const months = selectedPlan.intervalCount ?? 1;
  const isDiscounted = Boolean(
    discountedPlan && selectedPlan.key === discountedPlan.key,
  );
  const savings = discountedPlan
    ? premiumPlanSavingsPercent(plan, discountedPlan)
    : 0;

  useEffect(() => {
    if (active) return;
    const params = {
      product: selectedPlan.key,
      placement,
      value: selectedPlan.amountMinor / 100,
      currency: selectedPlan.currency,
    };
    trackEvent(ANALYTICS_EVENT.proExposure, params);
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      ...params,
      surface: placement,
    });
  }, [
    active,
    placement,
    selectedPlan.amountMinor,
    selectedPlan.currency,
    selectedPlan.key,
  ]);

  async function subscribe() {
    trackEvent(ANALYTICS_EVENT.productSelected, {
      product: selectedPlan.key,
      surface: placement,
      payment_model: "subscription",
      value: selectedPlan.amountMinor / 100,
      currency: selectedPlan.currency,
    });
    setPending(true);
    setError(false);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planKey: selectedPlan.key, returnTo, product }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        eventId?: string;
        value?: number;
        currency?: string;
        contentId?: string;
      };
      if (data.url) {
        fbTrack(
          "InitiateCheckout",
          {
            value: data.value,
            currency: data.currency,
            content_ids: [data.contentId],
            content_type: "product",
          },
          data.eventId,
        );
        trackEvent(ANALYTICS_EVENT.checkoutStarted, {
          product: data.contentId,
          value: data.value,
          currency: data.currency,
        });
        window.location.assign(data.url);
        return;
      }
    } catch {
      // The inline error below keeps Checkout failures recoverable.
    }
    setError(true);
    setPending(false);
  }

  // English site: crypto cannot auto-renew, so the card sells a one-time
  // 30-day pass paid by card, no plan toggles, no renewal promise.
  if (crypto && !active) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-gold)]/14 via-card/70 to-[var(--vivida-violet)]/12 p-6 ring-1 ring-foreground/5 sm:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--vivida-gold)]/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
              <Crown className="size-4" /> Vivida PRO
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Everything, without credit limits
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {FEATURES_EN.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 rounded-2xl border border-[var(--vivida-gold)]/25 bg-background/35 p-4 text-center sm:min-w-56">
            <div className="text-3xl font-bold tracking-tight">
              {formatBillingAmount(USDC_PREMIUM_PASS.amountMinor, "usdc", "en")}
            </div>
            <div className="text-xs text-muted-foreground">30-day pass</div>
            <PayByCardButton
              kind="premium_pass"
              days={USDC_PREMIUM_PASS.days}
              amountUsdcCents={USDC_PREMIUM_PASS.amountMinor}
              product={product}
              returnTo={returnTo}
              className="mt-3 w-full"
            >
              Get 30 days of PRO
            </PayByCardButton>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              One-time card payment. No auto-renewal, buy another pass whenever
              you like.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-gold)]/14 via-card/70 to-[var(--vivida-violet)]/12 p-6 ring-1 ring-foreground/5 sm:p-8">
      <div
        aria-hidden
        className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--vivida-gold)]/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {en
              ? "Everything, without credit limits"
              : "ყველაფერი, კრედიტების ლიმიტის გარეშე"}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            {(en ? FEATURES_EN : FEATURES_KA).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 rounded-2xl border border-[var(--vivida-gold)]/25 bg-background/35 p-4 text-center sm:min-w-56">
          {discountedPlan && !active && (
            <div className="mb-4 grid grid-cols-2 rounded-xl border border-border/60 bg-background/45 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedKey(discountedPlan.key)}
                className={`rounded-lg px-2 py-2 font-semibold transition-colors ${isDiscounted ? "bg-[var(--vivida-gold)]/18 text-[var(--vivida-gold)]" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={isDiscounted}
              >
                {en ? "3 months" : "3 თვე"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedKey(plan.key)}
                className={`rounded-lg px-2 py-2 font-semibold transition-colors ${!isDiscounted ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={!isDiscounted}
              >
                {en ? "Monthly" : "თვიური"}
              </button>
            </div>
          )}
          {isDiscounted && (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--vivida-gold)]/16 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--vivida-gold)]">
              <Sparkles className="size-3" />
              {en ? `Save ${savings}%` : `დაზოგე ${savings}%`}
            </div>
          )}
          <div className="text-3xl font-bold tracking-tight">
            {formatBillingAmount(
              selectedPlan.amountMinor,
              selectedPlan.currency,
              locale,
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            /
            {months === 1
              ? en
                ? "month"
                : "თვე"
              : en
                ? `${months} months`
                : `${months} თვე`}
          </div>
          {isDiscounted && (
            <div className="mt-1 text-xs text-foreground/70">
              {en ? "Only" : "მხოლოდ"}{" "}
              <span className="font-semibold text-foreground">
                {formatBillingAmount(
                  Math.round(selectedPlan.amountMinor / months),
                  selectedPlan.currency,
                  locale,
                )}
              </span>{" "}
              {en ? "per month" : "თვეში"}
            </div>
          )}
          {active ? (
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href="/subscription">
                {en ? "Manage PRO" : "PRO-ს მართვა"}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="mystic"
              className="mt-3 w-full"
              onClick={subscribe}
              disabled={pending}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isDiscounted
                ? en
                  ? "Get 3 months"
                  : "მიიღე 3 თვე"
                : en
                  ? "Get PRO"
                  : "გახდი PRO"}
            </Button>
          )}
          {error && (
            <p className="mt-2 text-xs text-destructive">
              {en ? "Checkout could not start." : "გადახდა ვერ დაიწყო."}
            </p>
          )}
          {!active && (
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              {isDiscounted
                ? en
                  ? "Renews every 3 months at the same price. Cancel anytime."
                  : "იგივე ფასად ყოველ 3 თვეში განახლდება. გაუქმება ნებისმიერ დროს შეგიძლია."
                : en
                  ? "Renews automatically each month. Cancel anytime."
                  : "ყოველთვიურად ავტომატურად განახლდება. გაუქმება ნებისმიერ დროს შეგიძლია."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
