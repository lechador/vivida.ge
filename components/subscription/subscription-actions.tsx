"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Billing self-service on /subscription. Cancellation deliberately does NOT
 * live here, it lives on /account as a modest text action.
 */
export function SubscriptionActions({
  locale,
  hasCustomer,
}: {
  locale: UserLocale;
  hasCustomer: boolean;
}) {
  const en = locale !== "ka";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function portal() {
    setPending(true);
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
    setPending(false);
    setError(true);
  }

  if (!hasCustomer) return null;

  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={portal}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ExternalLink className="size-4" />
          )}
          {en
            ? "Payment methods and invoices"
            : "გადახდის მეთოდები და ინვოისები"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive">
          {en
            ? "Could not open the billing portal. Please try again."
            : "ბილინგის პორტალი ვერ გაიხსნა. სცადე თავიდან."}
        </p>
      )}
    </div>
  );
}
