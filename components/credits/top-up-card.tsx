"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { CREDIT_PACKS } from "@/lib/credits-config";

/**
 * Stripe credit top-up — pick a pack, redirect to Checkout. The webhook awards
 * the credits on completion, so on return the /credits balance is already
 * updated.
 */
export function TopUpCard({ locale }: { locale: "ka" | "en" }) {
  const en = locale === "en";
  const [pending, setPending] = useState<string | null>(null);

  async function buy(packId: string) {
    setPending(packId);
    try {
      const r = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = (await r.json().catch(() => ({}))) as { url?: string };
      if (data.url) window.location.assign(data.url);
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
          {en ? "Top up balance" : "ბალანსის შევსება"}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Check className="size-3.5 text-[var(--vivida-cyan)]" />
          {en ? "Secure one-time payment" : "ერთჯერადი უსაფრთხო გადახდა"}
        </span>
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        {en ? "How many credits do you need?" : "რამდენი კრედიტი გჭირდება?"}
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {CREDIT_PACKS.map((p, i) => {
          const featured = i === 0;
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
              {featured && (
                <span className="absolute -top-2.5 rounded-full bg-[var(--vivida-cyan)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.14_0.02_260)]">
                  <span className="sm:hidden">{en ? "Popular" : "რჩეული"}</span>
                  <span className="hidden sm:inline">
                    {en ? "Most popular" : "ყველაზე ხშირად ირჩევენ"}
                  </span>
                </span>
              )}
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
              <div className="mt-1 text-lg font-semibold">{p.gel} ₾</div>
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
