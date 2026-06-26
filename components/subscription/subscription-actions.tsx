"use client";

import { useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const ERRORS: Record<string, string> = {
  already_subscribed: "შენ უკვე გაქვს Pro გამოწერა.",
  payments_unavailable: "გადახდა დროებით მიუწვდომელია.",
  no_customer: "გადახდის ისტორია ვერ მოიძებნა.",
  checkout_failed: "გადახდის გვერდის გახსნა ვერ მოხერხდა.",
  portal_failed: "მართვის გვერდის გახსნა ვერ მოხერხდა.",
  unauthorized: "გთხოვ, შეხვიდე სისტემაში.",
};

export function SubscriptionActions({
  mode,
  priceLabel,
}: {
  mode: "subscribe" | "manage";
  priceLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        mode === "subscribe"
          ? "/api/subscription/checkout"
          : "/api/subscription/portal",
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant={mode === "subscribe" ? "mystic" : "outline"}
        size="lg"
        onClick={go}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : mode === "subscribe" ? (
          <Sparkles className="size-4" />
        ) : (
          <CreditCard className="size-4" />
        )}
        {mode === "subscribe"
          ? `გადადი Pro-ზე — ${priceLabel}/თვე`
          : "მართე გამოწერა და ბარათები"}
      </Button>
      {error && <p className="mt-2 text-sm text-[var(--vivida-pink)]">{error}</p>}
    </div>
  );
}
