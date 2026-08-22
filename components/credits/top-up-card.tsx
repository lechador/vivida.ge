"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  creditPacksForCountry,
  formatBillingAmount,
} from "@/lib/credits-config";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Stripe credit top-up — pick a pack, redirect to Checkout. The webhook awards
 * the credits on completion, so on return the /credits balance is already
 * updated.
 */
export function TopUpCard({
  locale,
  countryCode,
}: {
  locale: UserLocale;
  countryCode?: string | null;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const packs = creditPacksForCountry(countryCode);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.paywallViewed, {
      product: "credit_pack",
      surface: "credits_hub",
      country: countryCode ?? "unknown",
    });
  }, [countryCode]);

  async function buy(packId: string) {
    const selected = packs.find((pack) => pack.id === packId);
    trackEvent(ANALYTICS_EVENT.productSelected, {
      product: packId,
      surface: "credits_hub",
      payment_model: "one_time",
      credits: selected?.credits,
      value: selected ? selected.amountMinor / 100 : undefined,
      currency: selected?.currency,
    });
    setPending(packId);
    try {
      const r = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        url?: string; eventId?: string; value?: number; currency?: string; contentId?: string;
      };
      if (data.url) {
        const params = { value: data.value, currency: data.currency, content_ids: [data.contentId], content_type: "product" };
        fbTrack("InitiateCheckout", params, data.eventId);
        trackEvent(ANALYTICS_EVENT.checkoutStarted, { product: data.contentId, value: data.value, currency: data.currency });
        window.location.assign(data.url);
      }
      else setPending(null);
    } catch {
      setPending(null);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <CreditCard className="size-4 text-[var(--vivida-cyan)]" />
          {am ? "Լիցքավորել հաշվեկշիռը" : en ? "Top up balance" : "ბალანსის შევსება"}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Check className="size-3.5 text-[var(--vivida-cyan)]" />
          {am ? "Անվտանգ միանվագ վճարում" : en ? "Secure one-time payment" : "ერთჯერადი უსაფრთხო გადახდა"}
        </span>
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        {am ? "Քանի՞ կրեդիտ է ձեզ անհրաժեշտ։" : en ? "How many credits do you need?" : "რამდენი კრედიტი გჭირდება?"}
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {packs.map((p, i) => {
          const featured = i === 1;
          const badge = i === 0 ? (am ? "Սկզբնական" : en ? "Starter" : "საწყისი") : i === 1 ? (am ? "Ամենահանրաճանաչը" : en ? "Most popular" : "რჩეული") : (am ? "Լավագույն արժեք" : en ? "Best value" : "საუკეთესო ფასი");
          return (
            <button
              key={p.id}
              type="button"
              disabled={pending !== null}
              onClick={() => buy(p.id)}
              className={cn(
                "relative flex min-w-0 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4 transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:p-5",
                featured
                  ? "border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]/8 shadow-[0_0_28px_-10px_var(--vivida-cyan)]"
                  : "border-border bg-background/40 hover:border-[var(--vivida-violet)]/50",
              )}
            >
              <span className={cn("absolute -top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", featured ? "bg-[var(--vivida-cyan)] text-[oklch(0.14_0.02_260)]" : "border border-border bg-background text-muted-foreground")}>{badge}</span>
              <div className="flex items-center gap-1.5 text-2xl font-bold tabular-nums">
                {pending === p.id ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="size-5 text-[var(--vivida-cyan)]" />
                    {p.credits}
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {am ? "կրեդիտներ" : en ? "credits" : "კრედიტი"}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {formatBillingAmount(p.amountMinor, p.currency, locale)}
              </div>
              <div className="text-[10px] text-muted-foreground">≈ {Math.floor(p.credits / 5)} {am ? "բացում է" : en ? "unlocks" : "გახსნა"}</div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {en
          ? "Select a pack to continue to secure checkout."
          : "ღილაკზე დაჭერით პირდაპირ გადახდაზე გადახვალ."}
      </p>
    </div>
  );
}
