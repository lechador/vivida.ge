"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * The one place a subscription can be cancelled: a modest inline text action
 * rendered under the Billing card on /account. Cancelling only turns off
 * auto-renew — access continues until the period end.
 */
export function SubscriptionCancelLink({
  locale,
  cancelAtPeriodEnd,
}: {
  locale: UserLocale;
  cancelAtPeriodEnd: boolean;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

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
    setPending(true);
    setError(false);
    const response = await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cancel }),
    }).catch(() => null);
    if (!response?.ok) setError(true);
    setPending(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => changeCancellation(!cancelAtPeriodEnd)}
        disabled={pending}
        className="underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
      >
        {cancelAtPeriodEnd
          ? en
            ? "Resume subscription"
            : "გამოწერის გაგრძელება"
          : pending
            ? en
              ? "Cancelling…"
              : "გაუქმება…"
            : en
              ? "Cancel subscription"
              : "გამოწერის გაუქმება"}
      </button>
      {error && (
        <span className="text-destructive">
          {en
            ? " Could not update. Try again."
            : " ვერ განახლდა. სცადე თავიდან."}
        </span>
      )}
    </>
  );
}
