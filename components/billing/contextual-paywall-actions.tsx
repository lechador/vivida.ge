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
import {
  creditPacksForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";

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
  const starterPack = creditPacksForCountry(countryCode)[0];
  const isTarot = product === "tarot";
  const creditsHref = contextualCreditsHref({
    returnTo: next,
    need: cost,
    product,
    packId: isTarot ? starterPack.id : null,
  });
  const proHref = `/subscription?${new URLSearchParams({ next, product }).toString()}`;
  const variant = useExperiment(EXPERIMENTS.contextualPaywall, placement);

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
            {isTarot
              ? en
                ? `${Math.floor(starterPack.credits / CREDIT_COST.tarot)} more readings, ${formatBillingAmount(starterPack.amountMinor, starterPack.currency, locale)}`
                : `${Math.floor(starterPack.credits / CREDIT_COST.tarot)} დამატებითი კითხვა, ${formatBillingAmount(starterPack.amountMinor, starterPack.currency, locale)}`
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
        {isTarot
          ? en
            ? `${starterPack.credits} credits · one-time payment · no auto-renewal`
            : `${starterPack.credits} კრედიტი · ერთჯერადი გადახდა · ავტოგანახლების გარეშე`
          : en
            ? "Credits are one-time; PRO is for frequent use."
            : "კრედიტები ერთჯერადია, PRO, ხშირი გამოყენებისთვის."}
      </p>
    </div>
  );
}
