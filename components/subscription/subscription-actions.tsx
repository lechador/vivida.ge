"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function SubscriptionActions({ locale, active, cancelAtPeriodEnd, hasCustomer }: { locale: UserLocale; active: boolean; cancelAtPeriodEnd: boolean; hasCustomer: boolean }) {
  const en = locale === "en";
  const router = useRouter();
  const [pending, setPending] = useState<"cancel" | "resume" | "portal" | null>(null);
  const [error, setError] = useState(false);

  async function changeCancellation(cancel: boolean) {
    if (cancel && !window.confirm(en ? "Cancel PRO at the end of this billing period?" : "გაუქმდეს PRO მიმდინარე პერიოდის ბოლოს?")) return;
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
    const response = await fetch("/api/subscription/portal", { method: "POST" }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as { url?: string }) : {};
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
        {active && (cancelAtPeriodEnd ? (
          <Button type="button" variant="outline" onClick={() => changeCancellation(false)} disabled={pending !== null}>
            {pending === "resume" ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
            {en ? "Resume subscription" : "გამოწერის გაგრძელება"}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => changeCancellation(true)} disabled={pending !== null}>
            {pending === "cancel" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
            {en ? "Cancel subscription" : "გამოწერის გაუქმება"}
          </Button>
        ))}
        {hasCustomer && (
          <Button type="button" variant="ghost" onClick={portal} disabled={pending !== null}>
            {pending === "portal" ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
            {en ? "Payment methods and invoices" : "გადახდის მეთოდები და ინვოისები"}
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{en ? "Could not update the subscription. Please try again." : "გამოწერა ვერ განახლდა. სცადე თავიდან."}</p>}
    </div>
  );
}
