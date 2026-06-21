"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/pricing";

const ERRORS: Record<string, string> = {
  no_chart: "ჯერ შენი რუკა უნდა შეიქმნას. დაასრულე ონბორდინგი.",
  payments_unavailable: "გადახდა დროებით მიუწვდომელია. სცადე მოგვიანებით.",
  checkout_failed: "გადახდის გვერდის გახსნა ვერ მოხერხდა. სცადე ხელახლა.",
  unauthorized: "გთხოვ, შეხვიდე სისტემაში.",
};

/**
 * Buy / generate the full PDF report. Pro users are comped (button kicks off
 * generation and routes to the status page); everyone else is redirected to
 * Stripe Checkout. The endpoint decides which based on the user's plan.
 */
export function BuyReportCta({
  plan,
  priceLabel,
}: {
  plan: PlanId;
  priceLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPro = plan === "pro";

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "natal" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
        setLoading(false);
        return;
      }
      // Internal status page → client nav; Stripe → full redirect.
      if (data.url.startsWith("/")) router.push(data.url);
      else window.location.href = data.url;
    } catch {
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/30 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)/0.25,transparent_70%)]"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--vivida-gold)]">
            <Sparkles className="size-3" />
            სრული ანგარიში
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            შენი ნატალური რუკის ღრმა ანალიზი — PDF
          </h3>
          <p className="mt-1.5 text-sm text-foreground/75">
            10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში,
            პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და
            ზრდის ზონები — ლამაზად გაფორმებული, ჩამოსატვირთად.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button
            variant="mystic"
            size="lg"
            onClick={start}
            disabled={loading}
            className="min-w-44"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            {isPro ? "ანგარიშის შექმნა" : `ყიდვა — ${priceLabel}`}
          </Button>
          <span className="text-center text-xs text-muted-foreground sm:text-right">
            {isPro ? "შენი Pro გეგმით უფასოა" : "ერთჯერადი გადახდა · სამუდამო წვდომა"}
          </span>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--vivida-pink)]">{error}</p>}
    </div>
  );
}
