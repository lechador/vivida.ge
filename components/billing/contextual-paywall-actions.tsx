"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, Crown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  contextualCreditsHref,
  normalizeReturnPath,
} from "@/lib/safe-return-path";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { fbTrack } from "@/lib/fb-pixel";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { trackExperimentOutcome, useExperiment } from "@/lib/use-experiment";
import { showSingleOffer } from "@/lib/first-purchase-experiment-config";
import { paywallImpulseOffer, paywallPrimaryOffer } from "@/lib/paywall-offer";
import type { CreditPack } from "@/lib/billing-config";

export function ContextualPaywallActions({
  locale,
  balance,
  cost,
  product,
  returnTo,
  placement,
  countryCode,
}: {
  locale: UserLocale;
  balance: number;
  cost: number;
  product: string;
  returnTo: string;
  placement: string;
  countryCode?: string | null;
}) {
  const en = locale === "en";
  const [pendingPackId, setPendingPackId] = useState<string | null>(null);
  const missing = Math.max(1, cost - balance);
  const next = normalizeReturnPath(returnTo);
  // One primary one-time offer naming the locked outcome and its price for
  // every product, not only tarot; PRO stays the secondary, frequent-use path.
  const offer = paywallPrimaryOffer({ product, countryCode, locale });
  const impulse = paywallImpulseOffer({
    product,
    countryCode,
    locale,
    missing,
  });
  const variant = useExperiment(EXPERIMENTS.contextualPaywall, placement);
  // Controlled first-purchase test (never-payers, assigned server-side):
  // control keeps the legacy generic choice, treatment leads with the single
  // priced outcome. Payers are never enrolled and keep the treatment framing.
  const firstPurchaseVariant = useExperiment(
    EXPERIMENTS.firstPurchaseOffer,
    placement,
  );
  const singleOffer = showSingleOffer(firstPurchaseVariant);
  const creditsHref = contextualCreditsHref({
    returnTo: next,
    need: cost,
    product,
    // Control arm keeps the legacy un-preselected hub for non-tarot gates so
    // the experiment isolates offer framing, not pack preselection.
    packId: singleOffer || product === "tarot" ? offer.pack.id : null,
  });

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      product,
      surface: placement,
      cost,
      balance,
    });
  }, [balance, cost, placement, product]);

  // "pro" is the experiment's alternative branch: the secondary action now
  // lands on the credits hub (other packs and PRO sit at its top), so the GA4
  // destination is passed explicitly instead of claiming /subscription.
  function trackChoice(
    destination: "credits" | "pro",
    analyticsDestination?: string,
  ) {
    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
      placement,
      destination:
        analyticsDestination ??
        (destination === "pro" ? "subscription" : destination),
      product,
    });
    trackExperimentOutcome(
      EXPERIMENTS.contextualPaywall,
      placement,
      destination === "pro" ? "choice_pro" : "choice_credits",
    );
    trackExperimentOutcome(
      EXPERIMENTS.firstPurchaseOffer,
      placement,
      destination === "pro" ? "choice_pro" : "choice_credits",
    );
  }

  /**
   * One-tap Stripe Checkout for the priced pack, so the paywall no longer
   * detours through the credits hub (that hop was where most buyers left).
   * Any refusal or failure falls back to the hub with the pack preselected,
   * never a dead button: `crypto_only` on the English host, a failed session,
   * or no URL all land the user on a working payment surface.
   */
  async function startDirectCheckout(chosenPack: CreditPack = offer.pack) {
    if (pendingPackId) return;
    trackChoice("credits");
    trackEvent(ANALYTICS_EVENT.productSelected, {
      product: chosenPack.id,
      surface: placement,
      payment_model: "one_time",
      credits: chosenPack.credits,
      value: chosenPack.amountMinor / 100,
      currency: chosenPack.currency,
    });
    setPendingPackId(chosenPack.id);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          packId: chosenPack.id,
          returnTo: next,
          product,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        eventId?: string;
        value?: number;
        currency?: string;
        contentId?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        window.location.assign(creditsHref);
        return;
      }
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
    } catch {
      window.location.assign(creditsHref);
    }
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm text-[var(--vivida-pink)]">
        {balance > 0
          ? en
            ? `You already have ${balance} credit${balance === 1 ? "" : "s"} — you only need ${missing} more.`
            : `ბალანსზე უკვე გაქვს ${balance} კრედიტი — გაკლია მხოლოდ ${missing} კრედიტი.`
          : variant === "value_message"
            ? en
              ? `Unlock this result by adding ${missing} more credit${missing === 1 ? "" : "s"}.`
              : `გახსენი ეს შედეგი კიდევ ${missing} კრედიტის დამატებით.`
            : en
              ? `You need ${missing} more credit${missing === 1 ? "" : "s"}.`
              : `გაკლია ${missing} კრედიტი.`}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {impulse && (
          <Button
            type="button"
            variant="mystic"
            disabled={pendingPackId !== null}
            onClick={() => startDirectCheckout(impulse.pack)}
          >
            {pendingPackId === impulse.pack.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4" />
            )}
            {impulse.label}
          </Button>
        )}
        <Button
          type="button"
          variant={impulse ? "secondary" : "mystic"}
          disabled={pendingPackId !== null}
          onClick={() => startDirectCheckout(offer.pack)}
        >
          {pendingPackId === offer.pack.id ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CreditCard className="size-4" />
          )}
          {offer.label}
        </Button>
        <Button asChild variant="outline">
          <Link
            href={creditsHref}
            onClick={() => trackChoice("pro", "credits_hub")}
          >
            <Crown className="size-4" />
            {en ? "Other packs / Unlimited PRO" : "სხვა პაკეტები / ულიმიტო PRO"}
          </Link>
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {`${impulse ? impulse.detail : offer.detail}${en ? " PRO is for frequent use." : " PRO ხშირი გამოყენებისთვისაა."}`}
      </p>
    </div>
  );
}
