"use client";

import { useEffect, useState } from "react";
import { Clock, Crown, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBillingAmount, type PremiumPlan } from "@/lib/billing-config";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

const FEATURES_EN = [
  "Unlimited AI chat with your astrologer",
  "Compatibility readings with anyone, as often as you like",
  "Full test results, personality, IQ, EQ, Big Five",
  "7-day forecasts, tarot readings and PDF charts",
  "Verified badge on your profile",
];
const FEATURES_KA = [
  "ულიმიტო AI ჩატი შენს ასტროლოგთან",
  "თავსებადობა ნებისმიერთან, რამდენჯერაც გინდა",
  "ტესტების სრული შედეგები, პიროვნება, IQ, EQ, Big Five",
  "7-დღიანი პროგნოზები, ტარო და PDF რუკები",
  "Verified badge შენს პროფილზე",
];

/**
 * The ₾29/3-month win-back offer, rendered only for users the low-credit
 * campaign actually emailed (see lib/promo-offer.ts, the page decides, this
 * component only draws).
 *
 * It posts `offer: "low_credits"` rather than a price: the checkout route
 * resolves eligibility again server-side, so this button cannot be replayed by
 * someone who was never sent the campaign.
 */
export function LowCreditOfferCard({
  plan,
  months,
  deadlineLabel,
  standardPlan,
  locale,
}: {
  plan: PremiumPlan;
  months: number;
  /**
   * Localised last day of the offer, already in the form the sentence needs,
   * genitive in Georgian ("1 სექტემბრის"), plain in English ("1 September").
   */
  deadlineLabel: string;
  /** The ordinary monthly plan, shown struck through for comparison. */
  standardPlan: PremiumPlan | null;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const isSingleMonth = months === 1;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const price = formatBillingAmount(plan.amountMinor, plan.currency, locale);
  const standardTotal = standardPlan
    ? formatBillingAmount(
        standardPlan.amountMinor * months,
        standardPlan.currency,
        locale,
      )
    : null;

  useEffect(() => {
    const params = {
      product: plan.key,
      placement: "low_credit_offer",
      offer: "low_credits",
      value: plan.amountMinor / 100,
      currency: plan.currency,
    };
    trackEvent(ANALYTICS_EVENT.proExposure, params);
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      ...params,
      surface: "credits_hub",
    });
  }, [plan.amountMinor, plan.currency, plan.key]);

  async function subscribe() {
    trackEvent(ANALYTICS_EVENT.productSelected, {
      product: plan.key,
      surface: "low_credit_offer",
      offer: "low_credits",
      payment_model: "subscription",
      value: plan.amountMinor / 100,
      currency: plan.currency,
    });
    setPending(true);
    setError(false);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: "low_credits" }),
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

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/45 bg-gradient-to-br from-[var(--vivida-gold)]/16 via-card/70 to-[var(--vivida-violet)]/14 p-6 ring-1 ring-foreground/5 sm:p-8">
      <div
        aria-hidden
        className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--vivida-gold)]/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--vivida-gold)]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--vivida-gold)]">
              <Sparkles className="size-3.5" />
              {en
                ? "🎃 Halloween Special · Personal offer"
                : "🎃 ჰელოუინის სპეციალური შეთავაზება"}
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {en
              ? isSingleMonth
                ? "1 month of unlimited Vivida PRO"
                : `${months} months of unlimited Vivida`
              : isSingleMonth
                ? "1 თვე ულიმიტო Vivida PRO"
                : `${months} თვე ულიმიტო Vivida`}
          </h2>
          <p className="mt-1.5 text-sm text-foreground/75">
            {en
              ? "Your credits are nearly gone. Open everything for Halloween week — no credits, no limits."
              : "შენი კრედიტები იწურება. ჰელოუინის კვირაში გახსენი ყველაფერი სპეციალურ ფასად — კრედიტებისა და ლიმიტების გარეშე."}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            {(en ? FEATURES_EN : FEATURES_KA).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Crown className="mt-0.5 size-4 shrink-0 text-[var(--vivida-gold)]" />
                {feature}
              </li>
            ))}
          </ul>

          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--vivida-gold)]">
            <Clock className="size-3.5" />
            {en
              ? `Available until ${deadlineLabel}`
              : `ძალაშია ${deadlineLabel} ჩათვლით`}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-[var(--vivida-gold)]/30 bg-background/40 p-4 text-center sm:min-w-48">
          {standardTotal && (
            <div className="text-sm text-muted-foreground line-through">
              {standardTotal}
            </div>
          )}
          <div className="text-3xl font-bold tracking-tight">{price}</div>
          <div className="text-xs text-muted-foreground">
            {en
              ? isSingleMonth
                ? "for 1 month · unlimited"
                : `for ${months} months`
              : isSingleMonth
                ? "1 თვის განმავლობაში · ულიმიტო"
                : `${months} თვის განმავლობაში`}
          </div>

          <Button
            type="button"
            variant="mystic"
            className="mt-3 w-full"
            onClick={subscribe}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {en ? "Activate the offer" : "გაააქტიურე შეთავაზება"}
          </Button>

          {error && (
            <p className="mt-2 text-xs text-destructive">
              {en ? "Checkout could not start." : "გადახდა ვერ დაიწყო."}
            </p>
          )}

          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            {en
              ? isSingleMonth
                ? `Renews at ${price} every month. Cancel any time.`
                : `Renews at ${price} every ${months} months. Cancel any time.`
              : isSingleMonth
                ? `განახლდება ${price}-ად ყოველ თვეში. გაუქმება ნებისმიერ დროს.`
                : `განახლდება ${price}-ად ყოველ ${months} თვეში. გაუქმება ნებისმიერ დროს.`}
          </p>
        </div>
      </div>
    </section>
  );
}
