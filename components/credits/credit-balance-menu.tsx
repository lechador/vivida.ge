"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Crown,
  Loader2,
  Plus,
} from "lucide-react";

import {
  creditPacksForCountry,
  featuredPremiumPlanForCountry,
  formatBillingAmount,
  shouldShowPurchasePromotion,
} from "@/lib/credits-config";
import { USDC_CREDIT_PACKS, USDC_PREMIUM_PASS } from "@/lib/crypto-config";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Editorial Celestial Header Wallet & Credit Balance Menu.
 * Displays tabular credit balance in a crisp hairline control with quick top-up options.
 */
export function CreditBalanceMenu({
  balance,
  locale,
  isPremium = false,
  countryCode,
  crypto = false,
}: {
  balance: number;
  locale: UserLocale;
  isPremium?: boolean;
  countryCode?: string | null;
  crypto?: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const en = locale !== "ka";
  const packs: readonly {
    id: "s" | "m" | "l";
    credits: number;
    amountMinor: number;
    currency: string;
  }[] = crypto
    ? USDC_CREDIT_PACKS.map((pack) => ({ ...pack, currency: "usdc" }))
    : creditPacksForCountry(countryCode);
  const featuredPro = featuredPremiumPlanForCountry(countryCode);
  const proMonths = featuredPro.intervalCount ?? 1;

  if (isPremium) {
    return (
      <Link
        href="/subscription"
        aria-label={en ? "Open PRO subscription" : "PRO გამოწერის გახსნა"}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-primary/50 bg-primary/10 px-3 font-mono text-xs font-semibold tracking-wider text-primary transition-colors hover:bg-primary/20"
      >
        <Crown className="size-3.5" />
        PRO
      </Link>
    );
  }

  async function buy(packId: string) {
    setPending(packId);
    setFailed(false);
    try {
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
      };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    }
    setPending(null);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${en ? "Credits" : "კრედიტები"}: ${balance}. ${en ? "Top up" : "ბალანსის შევსება"}`}
          className="group inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 font-mono text-xs font-medium tabular-nums text-foreground transition-colors hover:border-primary/60 hover:bg-secondary"
        >
          <span className="text-primary">✦</span>
          <span>{balance}</span>
          <Plus className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-45 group-hover:text-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] rounded-md border-border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              <CreditCard className="size-3.5" />
              {en ? "Quick top-up" : "სწრაფი შევსება"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {en ? "Choose a credit pack" : "აირჩიე კრედიტების პაკეტი"}
            </p>
          </div>
          <div className="border border-border bg-secondary/50 px-2.5 py-1 text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {en ? "Balance" : "ბალანსი"}
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums text-primary">
              {balance}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-px border border-border bg-border">
          {packs.map((pack, index) => {
            const cardClass =
              "relative flex min-h-24 flex-col items-center justify-center bg-card px-2 py-3 text-center transition-colors hover:bg-secondary disabled:opacity-60";
            const cardBody = (
              <>
                {index === 0 && (
                  <span className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-primary">
                    {en ? "Popular" : "რჩეული"}
                  </span>
                )}
                {pending === pack.id ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                    {pack.credits}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {en ? "credits" : "კრედიტი"}
                </span>
                <span className="mt-1 font-mono text-xs font-medium tabular-nums text-primary">
                  {formatBillingAmount(pack.amountMinor, pack.currency, locale)}
                </span>
              </>
            );
            return crypto ? (
              <Link
                key={pack.id}
                href={`/credits?pack=${pack.id}&product=header_menu`}
                className={cardClass}
              >
                {cardBody}
              </Link>
            ) : (
              <button
                key={pack.id}
                type="button"
                disabled={pending !== null}
                onClick={() => buy(pack.id)}
                className={cardClass}
              >
                {cardBody}
              </button>
            );
          })}
        </div>

        {shouldShowPurchasePromotion({ isPremium, balance }) && (
          <Link
            href="/subscription"
            className="mt-3 flex items-center gap-3 rounded-md border border-primary/40 bg-primary/8 p-3 transition-colors hover:bg-primary/14"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-sm border border-primary/30 text-primary">
              <Crown className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                {crypto
                  ? "Vivida PRO · 30-day pass"
                  : proMonths > 1
                    ? en
                      ? `${proMonths} months of Vivida PRO`
                      : `${proMonths} თვე Vivida PRO`
                    : en
                      ? "Unlimited with PRO"
                      : "ულიმიტო წვდომა PRO-თი"}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                {en
                  ? "Every feature, without credit limits"
                  : "ყველა ფუნქცია კრედიტების ლიმიტის გარეშე"}
              </span>
            </span>
            <span className="shrink-0 text-right font-mono tabular-nums">
              <span className="block text-xs font-semibold text-primary">
                {crypto
                  ? formatBillingAmount(
                      USDC_PREMIUM_PASS.amountMinor,
                      "usdc",
                      locale,
                    )
                  : formatBillingAmount(
                      featuredPro.amountMinor,
                      featuredPro.currency,
                      locale,
                    )}
              </span>
              <span className="block text-[9px] text-muted-foreground">
                /
                {crypto
                  ? "30 days"
                  : proMonths > 1
                    ? en
                      ? `${proMonths} mo`
                      : `${proMonths} თვე`
                    : en
                      ? "mo"
                      : "თვე"}
              </span>
            </span>
            <ArrowRight className="size-3.5 shrink-0 text-primary" />
          </Link>
        )}

        {failed && (
          <p role="alert" className="mt-2 text-center text-xs text-destructive">
            {en
              ? "Could not start payment. Please try again."
              : "გადახდა ვერ დაიწყო. სცადე თავიდან."}
          </p>
        )}

        <Link
          href="/credits"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-sm border-t border-border/70 pt-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {en ? "Credits and rewards" : "კრედიტები და ბონუსები"}
          <ArrowRight className="size-3.5" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
