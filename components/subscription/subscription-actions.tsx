"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function SubscriptionActions({
  locale,
  active,
  cancelAtPeriodEnd,
  hasCustomer,
  source,
  store,
}: {
  locale: UserLocale;
  active: boolean;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  /** "stripe" subscriptions are cancelled via our API; store ones live in the App Store / Play Store. */
  source: string;
  store: string | null;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [pending, setPending] = useState<"cancel" | "resume" | "portal" | null>(
    null,
  );
  const [error, setError] = useState(false);
  const cancellable = source === "stripe";

  async function changeCancellation(cancel: boolean) {
    if (
      cancel &&
      !window.confirm(
        en
          ? "Cancel PRO at the end of this billing period? You keep access until then."
          : "გაუქმდეს PRO მიმდინარე პერიოდის ბოლოს? წვდომა ბოლომდე შენარჩუნდება.",
      )
    )
      return;
    setPending(cancel ? "cancel" : "resume");
    setError(false);
    const response = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cancel }),
    }).catch(() => null);
    if (!response?.ok) setError(true);
    setPending(null);
    router.refresh();
  }

  async function portal() {
    setPending("portal");
    setError(false);
    const response = await fetch("/api/subscription/portal", {
      method: "POST",
    }).catch(() => null);
    const data = response
      ? ((await response.json().catch(() => ({}))) as { url?: string })
      : {};
    if (data.url) {
      window.location.assign(data.url);
      return;
    }
    setPending(null);
    setError(true);
  }

  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <div className="flex flex-wrap gap-2">
        {active && cancelAtPeriodEnd && (
          <Button
            type="button"
            variant="outline"
            onClick={() => changeCancellation(false)}
            disabled={pending !== null}
          >
            {pending === "resume" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            {en ? "Resume subscription" : "გამოწერის გაგრძელება"}
          </Button>
        )}
        {hasCustomer && (
          <Button
            type="button"
            variant="ghost"
            onClick={portal}
            disabled={pending !== null}
          >
            {pending === "portal" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            {en
              ? "Payment methods and invoices"
              : "გადახდის მეთოდები და ინვოისები"}
          </Button>
        )}
      </div>
      {active && !cancelAtPeriodEnd && cancellable && (
        <button
          type="button"
          onClick={() => changeCancellation(true)}
          disabled={pending !== null}
          className="mt-3 text-xs text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
        >
          {pending === "cancel"
            ? en
              ? "Cancelling…"
              : "გაუქმება…"
            : en
              ? "Cancel subscription"
              : "გამოწერის გაუქმება"}
        </button>
      )}
      {active && !cancelAtPeriodEnd && !cancellable && (
        <p className="mt-3 text-xs text-muted-foreground">
          {store === "PLAY_STORE"
            ? en
              ? "This subscription is billed through Google Play — manage or cancel it in the Play Store settings."
              : "ეს გამოწერა Google Play-ით იხდება — მართე ან გააუქმე Play Store-ის პარამეტრებიდან."
            : en
              ? "This subscription is billed through the App Store — manage or cancel it in the App Store settings."
              : "ეს გამოწერა App Store-ით იხდება — მართე ან გააუქმე App Store-ის პარამეტრებიდან."}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-destructive">
          {en
            ? "Could not update the subscription. Please try again."
            : "გამოწერა ვერ განახლდა. სცადე თავიდან."}
        </p>
      )}
    </div>
  );
}
