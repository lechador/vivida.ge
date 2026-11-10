"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Cancellation retention flow.
 *
 * Cancelling used to be a bare `window.confirm()` — no value reminder, no
 * alternative, and no reason captured. That is the single highest-intent churn
 * moment the product has, and it produced no signal and no save attempt.
 *
 * This presents, in order:
 *   1. the concrete value being given up, in the user's own currency;
 *   2. a reason, so churn becomes legible;
 *   3. an honest, undark-patterned confirm.
 *
 * Deliberately NOT offered: pausing collection. `isPremiumUser` derives access
 * from `users.premiumUntil`, which is written from the Stripe period and would
 * stop advancing on a paused subscription — so a pause could hand out
 * indefinite free PRO. That needs a real resume/cap design first.
 */

const REASONS = [
  { id: "too_expensive", ka: "ძვირია", en: "Too expensive" },
  { id: "not_using", ka: "ბევრს არ ვიყენებ", en: "I don't use it enough" },
  { id: "missing_feature", ka: "მაკლია ფუნქცია", en: "Missing a feature" },
  {
    id: "unexpected_charge",
    ka: "მოულოდნელი გადახდა",
    en: "Unexpected charge",
  },
  { id: "other", ka: "სხვა მიზეზი", en: "Something else" },
] as const;

export function SubscriptionCancelFlow({
  locale,
  cancelAtPeriodEnd,
  /** Formatted price of the plan the user is currently on. */
  currentPriceLabel,
}: {
  locale: UserLocale;
  cancelAtPeriodEnd: boolean;
  currentPriceLabel: string;
  /**
   * Accepted but no longer rendered: the "switch to the cheaper plan" CTA
   * linked to /subscription, which shows no plan card to active subscribers
   * (and checkout refuses PRO users), so it was a dead end. The Stripe
   * billing portal's plan switching depends on dashboard config we cannot
   * verify from code, so the offer was removed rather than redirected.
   */
  discountedPriceLabel?: string | null;
  discountedPeriodLabel?: string | null;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  function openFlow() {
    setOpen(true);
    trackEvent(ANALYTICS_EVENT.cancelFlowViewed, {
      surface: "account",
      has_alternative: false,
    });
  }

  async function confirmCancel() {
    setPending(true);
    setError(false);
    const response = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cancel: true }),
    }).catch(() => null);
    if (!response?.ok) {
      setError(true);
      setPending(false);
      return;
    }
    trackEvent(ANALYTICS_EVENT.cancelConfirmed, {
      surface: "account",
      reason: reason ?? "none",
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  async function resume() {
    setPending(true);
    setError(false);
    const response = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cancel: false }),
    }).catch(() => null);
    if (!response?.ok) setError(true);
    else trackEvent(ANALYTICS_EVENT.cancelRetained, { surface: "account" });
    setPending(false);
    router.refresh();
  }

  if (cancelAtPeriodEnd) {
    return (
      <button
        type="button"
        onClick={resume}
        disabled={pending}
        className="underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
      >
        {pending
          ? en
            ? "Resuming…"
            : "გაგრძელება…"
          : en
            ? "Resume subscription"
            : "გამოწერის გაგრძელება"}
        {error && (
          <span className="text-destructive">
            {en ? " Could not update." : " ვერ განახლდა."}
          </span>
        )}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openFlow}
        className="underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
      >
        {en ? "Cancel subscription" : "გამოწერის გაუქმება"}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-flow-title"
      className="mt-4 rounded-2xl border border-border bg-card/70 p-5 text-left ring-1 ring-foreground/5 backdrop-blur-xl"
    >
      <h3
        id="cancel-flow-title"
        className="text-base font-semibold tracking-tight"
      >
        {en ? "Before you go" : "სანამ წახვიდე"}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {en
          ? `You are on ${currentPriceLabel}. PRO keeps every reading, report and AI chat unlocked.`
          : `შენს გეგმაა ${currentPriceLabel}. PRO ხსნის ყველა კითხვას, ანგარიშს და AI ჩატს.`}
      </p>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {en ? "Why are you leaving?" : "რატომ ტოვებ?"}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={reason === r.id}
              onClick={() => {
                setReason(r.id);
                trackEvent(ANALYTICS_EVENT.cancelReasonSelected, {
                  surface: "account",
                  reason: r.id,
                });
              }}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                reason === r.id
                  ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/20 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {en ? r.en : r.ka}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
        >
          {en ? "Keep my subscription" : "გამოწერა დარჩეს"}
        </Button>
        <button
          type="button"
          onClick={confirmCancel}
          disabled={pending}
          className="text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          {pending
            ? en
              ? "Cancelling…"
              : "გაუქმება…"
            : en
              ? "Continue cancelling"
              : "გაუქმების გაგრძელება"}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {en
          ? "Access continues until the end of the period you already paid for."
          : "წვდომა გაგრძელდება უკვე გადახდილი პერიოდის ბოლომდე."}
      </p>

      {error && (
        <p className="mt-2 text-sm text-destructive">
          {en
            ? "Could not update your subscription. Please try again."
            : "გამოწერა ვერ განახლდა. სცადე თავიდან."}
        </p>
      )}
    </div>
  );
}
