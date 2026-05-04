import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice, PLANS } from "@/lib/pricing";
import { isOnTrial, trialDaysLeft } from "@/lib/plan";
import type { Subscription } from "@/db/schema";

const STATUS_LABEL: Record<string, string> = {
  active: "აქტიური",
  trialing: "საცდელი",
  past_due: "ვადაგადაცილებული",
  canceled: "გაუქმებული",
  incomplete: "მუშავდება",
  inactive: "არააქტიური",
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function SubscriptionStatusCard({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const onTrial = isOnTrial(subscription);
  const isPaidPro =
    subscription?.plan === "pro" && subscription.status === "active";

  // Free / no trial / expired — upsell card
  if (!onTrial && !isPaidPro) {
    return (
      <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              შენი პაკეტი
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              უფასო
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              გადადი Pro-ზე და მიიღე პერსონალური AI ჰოროსკოპები, ყოველდღიური
              პროგნოზები და თავსებადობის ანალიზი.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Button asChild variant="mystic" size="lg">
            <Link href="/pricing">
              <Sparkles />
              პაკეტების ნახვა
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const sub = subscription!;

  // Active free trial — Pro features unlocked, show countdown + upsell.
  if (onTrial) {
    const days = trialDaysLeft(sub);
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-6 backdrop-blur-xl">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-40 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              შენი გეგმა
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-violet)]">
              <Sparkles className="size-2.5" />
              საცდელი
            </span>
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            Pro · უფასო საცდელი
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            შენ ახლა Pro-ს ყველა ფუნქციით სარგებლობ. საცდელის ბოლოს ვერ
            გამოიყენებ Pro ფუნქციებს, თუ ფასიან გეგმაზე არ გადახვალ.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Field
              label="დარჩენილია"
              value={days === 1 ? "1 დღე" : `${days} დღე`}
            />
            <Field
              label="საცდელი სრულდება"
              value={formatDate(sub.currentPeriodEnd)}
            />
          </dl>

          <div className="mt-6">
            <Button asChild variant="mystic" size="lg">
              <Link href="/pricing">
                <Sparkles />
                გადადი Pro-ზე
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Paid Pro
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-6 backdrop-blur-xl">
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-40 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            შენი გეგმა
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
            <Sparkles className="size-2.5" />
            Pro
          </span>
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          {PLANS.pro.name} ·{" "}
          {sub.interval === "year" ? "წლიური" : "თვიური"}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <Field
            label="სტატუსი"
            value={STATUS_LABEL[sub.status] ?? sub.status}
          />
          <Field
            label="ფასი"
            value={
              sub.priceCents
                ? `${formatPrice(sub.priceCents)} / ${sub.interval === "year" ? "წელი" : "თვე"}`
                : "—"
            }
          />
          <Field
            label="პერიოდი სრულდება"
            value={formatDate(sub.currentPeriodEnd)}
          />
          <Field
            label="ავტომატური განახლება"
            value={sub.cancelAtPeriodEnd ? "გამორთულია" : "ჩართულია"}
          />
        </dl>

        {sub.cancelAtPeriodEnd && (
          <p className="mt-5 rounded-lg border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/10 px-3 py-2 text-xs text-[var(--vivida-pink)]">
            პაკეტი {formatDate(sub.currentPeriodEnd)}-ს დასრულდება და უფასო
            ვერსიას დაუბრუნდები.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
