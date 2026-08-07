"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Loader2, Plus, Sparkles } from "lucide-react";

import { CREDIT_PACKS } from "@/lib/credits-config";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Header wallet menu. It keeps the current balance visible while making a
 * top-up available from every signed-in screen, without a trip to /credits.
 */
export function CreditBalanceMenu({
  balance,
  locale,
}: {
  balance: number;
  locale: UserLocale;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const en = locale === "en";

  async function buy(packId: string) {
    setPending(packId);
    setFailed(false);
    try {
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = (await response.json().catch(() => ({}))) as { url?: string };
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
          className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-2.5 py-1 text-sm font-semibold tabular-nums text-foreground transition-all hover:border-[var(--vivida-cyan)]/65 hover:bg-[var(--vivida-cyan)]/20"
        >
          <Sparkles className="size-3.5 text-[var(--vivida-cyan)]" />
          {balance}
          <span className="grid size-4 place-items-center rounded-full bg-[var(--vivida-cyan)]/20 text-[var(--vivida-cyan)] transition-transform group-data-[state=open]:rotate-45">
            <Plus className="size-3" />
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-3">
        <div className="flex items-start justify-between gap-4 px-1 pb-3 pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <CreditCard className="size-3.5 text-[var(--vivida-cyan)]" />
              {en ? "Quick top-up" : "სწრაფი შევსება"}
            </div>
            <p className="mt-1 text-sm text-foreground/80">
              {en ? "Choose a credit pack" : "აირჩიე კრედიტების პაკეტი"}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--vivida-cyan)]/10 px-2.5 py-1.5 text-right">
            <div className="text-[10px] text-muted-foreground">{en ? "Balance" : "ბალანსი"}</div>
            <div className="font-bold tabular-nums text-[var(--vivida-cyan)]">{balance}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {CREDIT_PACKS.map((pack, index) => (
            <button
              key={pack.id}
              type="button"
              disabled={pending !== null}
              onClick={() => buy(pack.id)}
              className="relative flex min-h-24 flex-col items-center justify-center rounded-2xl border border-border/70 bg-background/45 px-2 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-cyan)]/55 hover:bg-[var(--vivida-cyan)]/8 disabled:opacity-60"
            >
              {index === 0 && (
                <span className="absolute -top-1.5 rounded-full bg-[var(--vivida-cyan)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[oklch(0.14_0.02_260)]">
                  {en ? "Popular" : "რჩეული"}
                </span>
              )}
              {pending === pack.id ? (
                <Loader2 className="size-5 animate-spin text-[var(--vivida-cyan)]" />
              ) : (
                <span className="text-lg font-bold tabular-nums">{pack.credits}</span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {en ? "credits" : "კრედიტი"}
              </span>
              <span className="mt-1 text-sm font-semibold tabular-nums">{pack.gel} ₾</span>
            </button>
          ))}
        </div>

        {failed && (
          <p role="alert" className="mt-2 text-center text-xs text-destructive">
            {en ? "Could not start payment. Please try again." : "გადახდა ვერ დაიწყო. სცადე თავიდან."}
          </p>
        )}

        <Link
          href="/credits"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/15 hover:text-foreground"
        >
          {en ? "Credits, rewards and visit streak" : "კრედიტები, ბონუსები და ვიზიტების სერია"}
          <ArrowRight className="size-3.5" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
