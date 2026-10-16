"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CreditCard, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  contextualCreditsHref,
  normalizeReturnPath,
} from "@/lib/safe-return-path";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { trackExperimentOutcome, useExperiment } from "@/lib/use-experiment";
import { showSingleOffer } from "@/lib/first-purchase-experiment-config";
import { paywallPrimaryOffer } from "@/lib/paywall-offer";

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
  const missing = Math.max(1, cost - balance);
  const next = normalizeReturnPath(returnTo);
  // One primary one-time offer naming the locked outcome and its price for
  // every product, not only tarot; PRO stays the secondary, frequent-use path.
  const offer = paywallPrimaryOffer({ product, countryCode, locale });
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
  const proHref = `/subscription?${new URLSearchParams({ next, product }).toString()}`;

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      product,
      surface: placement,
      cost,
      balance,
    });
  }, [balance, cost, placement, product]);

  function trackChoice(destination: "credits" | "pro") {
    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
      placement,
      destination: destination === "pro" ? "subscription" : destination,
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

  return (
    <div className="space-y-2.5">
      <p className="text-sm text-[var(--vivida-pink)]">
        {variant === "value_message"
          ? en
            ? `Unlock this result by adding ${missing} more credit${missing === 1 ? "" : "s"}.`
            : `გახსენი ეს შედეგი კიდევ ${missing} კრედიტის დამატებით.`
          : en
            ? `You need ${missing} more credit${missing === 1 ? "" : "s"}.`
            : `გაკლია ${missing} კრედიტი.`}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="mystic">
          <Link href={creditsHref} onClick={() => trackChoice("credits")}>
            <CreditCard className="size-4" />
            {singleOffer
              ? offer.label
              : en
                ? "Top up and return"
                : "შეავსე და დაბრუნდი"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={proHref} onClick={() => trackChoice("pro")}>
            <Crown className="size-4" />
            {en ? "See PRO" : "ნახე PRO"}
          </Link>
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {singleOffer
          ? `${offer.detail}${en ? " PRO is for frequent use." : " PRO ხშირი გამოყენებისთვისაა."}`
          : en
            ? "Credits are one-time; PRO is for frequent use."
            : "კრედიტები ერთჯერადია, PRO ხშირი გამოყენებისთვისაა."}
      </p>
    </div>
  );
}
