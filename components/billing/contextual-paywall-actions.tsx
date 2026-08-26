"use client";

import Link from "next/link";
import { CreditCard, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contextualCreditsHref, normalizeReturnPath } from "@/lib/safe-return-path";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  return (
    <div className="space-y-2.5">
      <p className="text-sm text-[var(--vivida-pink)]">
        {am ? `Պակասում է ${missing} կրեդիտ։` : en ? `You need ${missing} more credit${missing === 1 ? "" : "s"}.` : `გაკლია ${missing} კრედიტი.`}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="mystic">
          <Link href={creditsHref} onClick={() => trackEvent(ANALYTICS_EVENT.recommendationClicked, { placement, destination: "credits", product })}>
            <CreditCard className="size-4" />
            {am ? "Լիցքավորել և վերադառնալ" : en ? "Top up and return" : "შეავსე და დაბრუნდი"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={proHref} onClick={() => trackEvent(ANALYTICS_EVENT.recommendationClicked, { placement, destination: "subscription", product })}>
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
