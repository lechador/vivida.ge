"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  featuredPremiumPlanForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * A quiet, in-flow commerce reminder for the highest-frequency signed-in page.
 * It appears after the user's daily value, never overlays content, and offers
 * both payment models instead of forcing a subscription-only decision.
 */
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
    <section className="relative overflow-hidden rounded-2xl border border-[var(--vivida-gold)]/25 bg-gradient-to-r from-[var(--vivida-gold)]/8 via-card/55 to-[var(--vivida-violet)]/8 p-5 ring-1 ring-foreground/5">
      <div
        aria-hidden
        className="absolute -right-12 -top-16 size-40 rounded-full bg-[var(--vivida-gold)]/12 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-gold)]/14 text-[var(--vivida-gold)]">
            <Crown className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold tracking-tight">Vivida PRO</h2>
              {months > 1 && (
                <span className="rounded-full bg-[var(--vivida-gold)]/14 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--vivida-gold)]">
                  {en ? "Special price" : "სპეციალური ფასი"}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-xl text-sm text-foreground/70">
              {months > 1
                ? en
                  ? `Unlock everything for ${months} months for ${formatBillingAmount(pro.amountMinor, pro.currency, locale)}.`
                  : `გახსენი ყველაფერი ${months} თვით — ${formatBillingAmount(pro.amountMinor, pro.currency, locale)}-ად.`
                : en
                  ? "Unlock every paid feature without credit limits."
                  : "გახსენი ყველა ფასიანი ფუნქცია კრედიტების ლიმიტის გარეშე."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link
              href="/credits?next=%2Fdashboard"
              onClick={() => track("credits")}
            >
              <Sparkles className="size-4" />
              {en ? "Credits" : "კრედიტები"}
            </Link>
          </Button>
          <Button asChild variant="mystic" size="sm">
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
