"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  creditPacksForCountry,
  CREDIT_COST,
  formatBillingAmount,
} from "@/lib/credits-config";
import { USDC_CREDIT_PACKS } from "@/lib/crypto-config";
import { PayWithUsdcButton } from "@/components/crypto/crypto-pay";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Credit top-up — Stripe Checkout on the Georgian site; on the English site
 * (`crypto`) a pack opens the USDC payment dialog instead, and the server
 * verifies the on-chain transfer before awarding the credits.
 */
export function TopUpCard({
  locale,
  countryCode,
  balance,
  neededCredits,
  returnTo,
  product,
  selectedPackId,
  crypto = false,
}: {
  locale: UserLocale;
  countryCode?: string | null;
  balance: number;
  neededCredits?: number | null;
  returnTo?: string | null;
  product?: string | null;
  selectedPackId?: "s" | "m" | "l" | null;
  /** English site: pay in USDC on Solana (Stripe is off there). */
  crypto?: boolean;
}) {
  const en = locale !== "ka";
  const packs: readonly {
    id: "s" | "m" | "l";
    credits: number;
    amountMinor: number;
    currency: string;
  }[] = crypto
    ? USDC_CREDIT_PACKS.map((pack) => ({ ...pack, currency: "usdc" }))
    : creditPacksForCountry(countryCode);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deficit =
    neededCredits && neededCredits > balance ? neededCredits - balance : null;
  const selectedPack = packs.find((pack) => pack.id === selectedPackId);
  const recommendedId = selectedPack
    ? selectedPack.id
    : deficit
      ? (
          packs.find((pack) => pack.credits >= deficit) ??
          packs[packs.length - 1]
        ).id
      : (packs[1]?.id ?? packs[0].id);
  const isTarot = product === "tarot";

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
    setError(null);
    try {
      const r = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId, returnTo, product }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        url?: string;
        eventId?: string;
        value?: number;
        currency?: string;
        contentId?: string;
        error?: string;
      };
      if (data.url) {
        const params = {
          value: data.value,
          currency: data.currency,
          content_ids: [data.contentId],
          content_type: "product",
        };
        fbTrack("InitiateCheckout", params, data.eventId);
        trackEvent(ANALYTICS_EVENT.checkoutStarted, {
          product: data.contentId,
          value: data.value,
          currency: data.currency,
        });
        window.location.assign(data.url);
        return;
      }
      // No URL — visible failure, safe to retry (each attempt mints a fresh
      // Stripe session; nothing is charged until checkout completes there).
      const reason = !r.ok ? `http_${r.status}` : "no_url";
      trackEvent(ANALYTICS_EVENT.checkoutFailed, {
        product: packId,
        surface: "credits_hub",
        payment_model: "one_time",
        reason,
      });
      setError(
        en
          ? "Checkout could not start. Check your connection and try again — you won't be charged twice."
          : "გადახდა ვერ დაიწყო. შეამოწმე ინტერნეტი და ცადე ისევ — ორჯერ ჩამოჭრა არ მოხდება.",
      );
      setPending(null);
    } catch {
      trackEvent(ANALYTICS_EVENT.checkoutFailed, {
        product: packId,
        surface: "credits_hub",
        payment_model: "one_time",
        reason: "network",
      });
      setError(
        en
          ? "Checkout could not start. Check your connection and try again — you won't be charged twice."
          : "გადახდა ვერ დაიწყო. შეამოწმე ინტერნეტი და ცადე ისევ — ორჯერ ჩამოჭრა არ მოხდება.",
      );
      setPending(null);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <CreditCard className="size-4 text-[var(--vivida-cyan)]" />
          {en ? "Top up balance" : "ბალანსის შევსება"}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Check className="size-3.5 text-[var(--vivida-cyan)]" />
          {crypto
            ? "Pay in USDC · Solana"
            : en
              ? "Secure one-time payment"
              : "ერთჯერადი უსაფრთხო გადახდა"}
        </span>
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        {isTarot
          ? en
            ? "How many more readings do you want?"
            : "რამდენი დამატებითი კითხვა გინდა?"
          : en
            ? "How many credits do you need?"
            : "რამდენი კრედიტი გჭირდება?"}
      </h2>
      {deficit && (
        <p className="mt-2 rounded-xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 px-3 py-2 text-sm text-foreground/80">
          {en
            ? `You need ${deficit} more credit${deficit === 1 ? "" : "s"} for this unlock.`
            : `ამ გახსნისთვის გაკლია ${deficit} კრედიტი.`}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {packs.map((p, i) => {
          const featured = p.id === recommendedId;
          const badge =
            p.id === selectedPack?.id
              ? en
                ? "Your choice"
                : "შენი არჩევანი"
              : featured && deficit
                ? en
                  ? "Recommended"
                  : "რეკომენდებული"
                : i === 0
                  ? en
                    ? "Starter"
                    : "საწყისი"
                  : i === 1
                    ? en
                      ? "Most popular"
                      : "რჩეული"
                    : en
                      ? "Best value"
                      : "საუკეთესო ფასი";
          const cardClass = cn(
            "relative flex h-auto min-w-0 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4 transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:p-5",
            featured
              ? "border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]/8 shadow-[0_0_28px_-10px_var(--vivida-cyan)]"
              : "border-border bg-background/40 hover:border-[var(--vivida-violet)]/50",
          );
          const cardBody = (
            <>
              <span
                className={cn(
                  "absolute -top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  featured
                    ? "bg-[var(--vivida-cyan)] text-[oklch(0.14_0.02_260)]"
                    : "border border-border bg-background text-muted-foreground",
                )}
              >
                {badge}
              </span>
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
                {en ? "credits" : "კრედიტი"}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {formatBillingAmount(p.amountMinor, p.currency, locale)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isTarot
                  ? `${Math.floor(p.credits / CREDIT_COST.tarot)} ${en ? "tarot readings" : "ტარო კითხვა"}`
                  : `≈ ${Math.floor(p.credits / 5)} ${en ? "unlocks" : "გახსნა"}`}
              </div>
            </>
          );
          return crypto ? (
            <PayWithUsdcButton
              key={p.id}
              kind="credits"
              packId={p.id}
              credits={p.credits}
              amountUsdcCents={p.amountMinor}
              product={product}
              returnTo={returnTo}
              variant="ghost"
              className={cardClass}
            >
              {cardBody}
            </PayWithUsdcButton>
          ) : (
            <button
              key={p.id}
              type="button"
              disabled={pending !== null}
              onClick={() => buy(p.id)}
              className={cardClass}
            >
              {cardBody}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {crypto
          ? "Select a pack to pay with USDC."
          : en
            ? "Select a pack to continue to secure checkout."
            : "ღილაკზე დაჭერით პირდაპირ გადახდაზე გადახვალ."}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
