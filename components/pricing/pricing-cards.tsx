"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";

import {
  effectiveMonthlyPrice,
  FEATURES,
  formatPrice,
  PLANS,
  yearlySavingsPercent,
  type IntervalId,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { IntervalToggle } from "./interval-toggle";
import { UpgradeButton } from "./upgrade-button";

export function PricingCards({
  authed,
  currentPlan,
  onTrial = false,
}: {
  authed: boolean;
  currentPlan: "free" | "pro";
  /** True when currentPlan === 'pro' is granted via the auto trial, not a paid sub. */
  onTrial?: boolean;
}) {
  const [interval, setInterval] = useState<IntervalId>("month");
  const yearlySavings = yearlySavingsPercent("pro");

  const proMonthlyEquivalent = formatPrice(effectiveMonthlyPrice("pro", interval));
  const proStrikethrough =
    interval === "year" ? formatPrice(PLANS.pro.price.month) : null;

  return (
    <div className="space-y-12">
      <div className="flex justify-center">
        <IntervalToggle
          value={interval}
          onChange={setInterval}
          yearlyDiscountPercent={yearlySavings}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free */}
        <article className="relative rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-xl">
          <header className="mb-6">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {PLANS.free.name}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-4xl font-semibold tracking-tight">
                {formatPrice(PLANS.free.price.month)}
              </div>
              <div className="text-sm text-muted-foreground">/თვე</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {PLANS.free.tagline}
            </p>
          </header>

          <ul className="space-y-3 text-sm">
            {FEATURES.filter((f) => f.free).map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                <span className="text-foreground/85">
                  {f.label}
                  {typeof f.free === "string" && (
                    <span className="ml-1 text-muted-foreground">
                      · {f.free}
                    </span>
                  )}
                </span>
              </li>
            ))}
            {FEATURES.filter((f) => !f.free).slice(0, 3).map((f, i) => (
              <li key={`x${i}`} className="flex items-start gap-3 opacity-60">
                <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground line-through decoration-muted-foreground/30">
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </article>

        {/* Pro — highlighted */}
        <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/50 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-8 shadow-[0_30px_80px_-30px_oklch(0.65_0.24_305/0.5)] backdrop-blur-xl">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 size-44 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-30 blur-3xl"
          />

          <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
            <Sparkles className="size-3" />
            პოპულარული
          </span>

          <header className="relative mb-6">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {PLANS.pro.name}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-4xl font-semibold tracking-tight">
                {proMonthlyEquivalent}
              </div>
              <div className="text-sm text-muted-foreground">/თვე</div>
              {proStrikethrough && (
                <div className="text-sm text-muted-foreground line-through">
                  {proStrikethrough}
                </div>
              )}
            </div>
            {interval === "year" && (
              <div className="mt-1 text-xs text-[var(--vivida-cyan)]">
                წელიწადში {formatPrice(PLANS.pro.price.year)} · 2 თვე საჩუქრად
              </div>
            )}
            <p className="mt-3 text-sm text-foreground/80">
              {PLANS.pro.tagline}
            </p>
          </header>

          <ul className="relative space-y-3 text-sm">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                <span className="text-foreground/90">
                  {f.label}
                  {typeof f.pro === "string" && (
                    <span className="ml-1 text-muted-foreground">
                      · {f.pro}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mt-8">
            <UpgradeButton
              interval={interval}
              authed={authed}
              className={cn(
                "w-full",
                // Disable only for paid Pro — trial users SHOULD be able to upgrade.
                currentPlan === "pro" && !onTrial && "pointer-events-none opacity-50"
              )}
              label={
                currentPlan === "pro" && !onTrial
                  ? "უკვე გაქვს Pro"
                  : onTrial
                    ? "გადადი ფასიან Pro-ზე"
                    : authed
                      ? "გადადი Pro-ზე"
                      : "დაიწყე"
              }
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              გააუქმე ნებისმიერ დროს · დაცული გადახდა Flitt-ით
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
