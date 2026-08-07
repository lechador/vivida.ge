import Link from "next/link";
import { Check, Coins, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const CREDIT_HIGHLIGHTS = [
  "საწყისი კრედიტები რეგისტრაციისას",
  "უფასო ბონუსები აქტივობისა და ვიზიტების სერიისთვის",
  "დამატებითი კრედიტები მეგობრების მოწვევით",
  "სურვილის შემთხვევაში — ბალანსის ერთჯერადი შევსება",
];

/**
 * Credit explainer kept under the historical export path so existing call
 * sites can migrate without ever showing the retired subscription model.
 */
export function CreditUpsell({
  title = "ეს დამატებითი ფუნქციაა",
  description,
  compact = false,
  className,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={`flex flex-col gap-4 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/65 to-[var(--vivida-cyan)]/12 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
      >
        <div className="flex items-start gap-3">
          <Coins className="mt-0.5 size-5 shrink-0 text-[var(--vivida-gold)]" />
          <div>
            <p className="font-semibold tracking-tight">{title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description ?? "დამატებითი მოქმედებები კრედიტებით იხსნება. კრედიტების დაგროვება უფასოდაც შეგიძლია."}
            </p>
          </div>
        </div>
        <Button asChild variant="mystic" size="lg" className="shrink-0">
          <Link href="/credits">
            <Sparkles className="size-4" />
            კრედიტების ნახვა
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/14 via-card/65 to-[var(--vivida-cyan)]/12 p-7 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9 ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)/0.25,transparent_70%)]"
      />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--vivida-gold)]">
          <Coins className="size-3" />
          Vivida კრედიტები
        </div>
        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {CREDIT_HIGHLIGHTS.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild variant="mystic" size="lg">
            <Link href="/credits">
              <Sparkles className="size-4" />
              კრედიტების ნახვა
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            ყოველთვიური გამოწერის გარეშე
          </span>
        </div>
      </div>
    </div>
  );
}
