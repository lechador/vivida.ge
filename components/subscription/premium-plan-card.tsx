"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBillingAmount, type PremiumPlan } from "@/lib/billing-config";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";

const FEATURES_EN = [
  "Unlimited access to every credit-gated feature",
  "Full test results, compatibility and forecasts",
  "Unlimited AI chat, tarot and PDF reports",
  "Verified badge on your profile",
];
const FEATURES_KA = [
  "ყველა კრედიტიან ფუნქციაზე ულიმიტო წვდომა",
  "ტესტების სრული შედეგები, თავსებადობა და პროგნოზები",
  "ულიმიტო AI ჩატი, ტარო და PDF ანგარიშები",
  "Verified badge შენს პროფილზე",
];

export function PremiumPlanCard({
  plan,
  locale,
  active = false,
}: {
  plan: PremiumPlan;
  locale: UserLocale;
  active?: boolean;
}) {
  const en = locale !== "ka";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function subscribe() {
    setPending(true);
    setError(false);
    try {
      const response = await fetch("/api/subscription/checkout", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string; eventId?: string; value?: number; currency?: string; contentId?: string;
      };
      if (data.url) {
        fbTrack("InitiateCheckout", { value: data.value, currency: data.currency, content_ids: [data.contentId], content_type: "product" }, data.eventId);
        trackEvent(ANALYTICS_EVENT.checkoutStarted, { product: data.contentId, value: data.value, currency: data.currency });
        window.location.assign(data.url);
        return;
      }
    } catch {
      // The inline error below keeps Checkout failures recoverable.
    }
    setError(true);
    setPending(false);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--vivida-gold)]/35 bg-gradient-to-br from-[var(--vivida-gold)]/14 via-card/70 to-[var(--vivida-violet)]/12 p-6 ring-1 ring-foreground/5 sm:p-8">
      <div aria-hidden className="absolute -right-16 -top-20 size-56 rounded-full bg-[var(--vivida-gold)]/15 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
            <Crown className="size-4" /> Vivida PRO
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {en ? "Everything, without credit limits" : "ყველაფერი, კრედიტების ლიმიტის გარეშე"}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            {(en ? FEATURES_EN : FEATURES_KA).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 rounded-2xl border border-[var(--vivida-gold)]/25 bg-background/35 p-4 text-center sm:min-w-44">
          <div className="text-3xl font-bold tracking-tight">
            {formatBillingAmount(plan.amountMinor, plan.currency, locale)}
          </div>
          <div className="text-xs text-muted-foreground">/{en ? "month" : "თვე"}</div>
          {active ? (
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href="/subscription">{en ? "Manage PRO" : "PRO-ს მართვა"}</Link>
            </Button>
          ) : (
            <Button type="button" variant="mystic" className="mt-3 w-full" onClick={subscribe} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {en ? "Get PRO" : "გახდი PRO"}
            </Button>
          )}
          {error && (
            <p className="mt-2 text-xs text-destructive">
              {en ? "Checkout could not start." : "გადახდა ვერ დაიწყო."}
            </p>
          )}
          {!active && (
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              {en ? "Renews automatically each month. Cancel anytime." : "ყოველთვიურად ავტომატურად განახლდება. გაუქმება ნებისმიერ დროს შეგიძლია."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
