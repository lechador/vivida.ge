"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  featuredPremiumPlanForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function DashboardBillingNudge({
  locale,
  countryCode,
}: {
  locale: UserLocale;
  countryCode?: string | null;
}) {
  const en = locale === "en";
  const pro = featuredPremiumPlanForCountry(countryCode);
  const months = pro.intervalCount ?? 1;
  const placement = "dashboard_inline";

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.proExposure, {
      product: pro.key,
      placement,
      value: pro.amountMinor / 100,
      currency: pro.currency,
    });
  }, [pro.amountMinor, pro.currency, pro.key]);

  function track(destination: "subscription" | "credits") {
    trackEvent(ANALYTICS_EVENT.recommendationClicked, {
      placement,
      destination,
      product: destination === "subscription" ? pro.key : "credit_packs",
      payment_model:
        destination === "subscription" ? "subscription" : "one_time",
    });
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
            <Crown className="size-4.5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Vivida PRO
              </h2>
              {months > 1 && (
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
                  · {en ? "Special price" : "სპეციალური ფასი"}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {months > 1
                ? en
                  ? `Unlock everything for ${months} months for ${formatBillingAmount(pro.amountMinor, pro.currency, locale)}.`
                  : `გახსენი ყველაფერი ${months} თვით, ${formatBillingAmount(pro.amountMinor, pro.currency, locale)}-ად.`
                : en
                  ? "Unlock every paid feature without credit limits."
                  : "გახსენი ყველა ფასიანი ფუნქცია კრედიტების ლიმიტის გარეშე."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Button asChild variant="outline" size="sm">
            <Link
              href="/credits?next=%2Fdashboard"
              onClick={() => track("credits")}
            >
              {en ? "Credits" : "კრედიტები"}
            </Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link
              href="/subscription?next=%2Fdashboard"
              onClick={() => track("subscription")}
            >
              {months > 1
                ? en
                  ? `Get ${months} months`
                  : `მიიღე ${months} თვე`
                : en
                  ? "Get PRO"
                  : "გახდი PRO"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
