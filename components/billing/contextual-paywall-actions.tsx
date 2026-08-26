"use client";

import Link from "next/link";
import { CreditCard, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contextualCreditsHref, normalizeReturnPath } from "@/lib/safe-return-path";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { trackExperimentOutcome, useExperiment } from "@/lib/use-experiment";

export function ContextualPaywallActions({
  locale,
  balance,
  cost,
  product,
  returnTo,
  placement,
}: {
  locale: UserLocale;
  balance: number;
  cost: number;
  product: string;
  returnTo: string;
  placement: string;
}) {
  const en = locale === "en";
  const am = locale === "am";
  const missing = Math.max(1, cost - balance);
  const next = normalizeReturnPath(returnTo);
  const creditsHref = contextualCreditsHref({ returnTo: next, need: cost, product });
  const proHref = `/subscription?next=${encodeURIComponent(next)}`;
  const variant = useExperiment(EXPERIMENTS.contextualPaywall, placement);

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
          ? am
            ? `Բացեք այս արդյունքը՝ ավելացնելով ևս ${missing} կրեդիտ։`
            : en
              ? `Unlock this result by adding ${missing} more credit${missing === 1 ? "" : "s"}.`
              : `გახსენი ეს შედეგი კიდევ ${missing} კრედიტის დამატებით.`
          : am
            ? `Պակասում է ${missing} կրեդիտ։`
            : en
              ? `You need ${missing} more credit${missing === 1 ? "" : "s"}.`
              : `გაკლია ${missing} კრედიტი.`}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="mystic">
          <Link href={creditsHref} onClick={() => trackChoice("credits")}>
            <CreditCard className="size-4" />
            {am ? "Լիցքավորել և վերադառնալ" : en ? "Top up and return" : "შეავსე და დაბრუნდი"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={proHref} onClick={() => trackChoice("pro")}>
            <Crown className="size-4" />
            {am ? "Դիտել PRO-ն" : en ? "See PRO" : "ნახე PRO"}
          </Link>
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {am ? "Կրեդիտները մեկանգամյա են, PRO-ն՝ հաճախակի օգտագործման համար։" : en ? "Credits are one-time; PRO is for frequent use." : "კრედიტები ერთჯერადია, PRO — ხშირი გამოყენებისთვის."}
      </p>
    </div>
  );
}
