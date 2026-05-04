import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSubscription, isOnTrial, trialDaysLeft } from "@/lib/plan";

/**
 * Slim banner shown above main content for users on an active trial.
 * Renders nothing if the user is on a paid plan, the trial is over, or
 * they don't have a subscription at all.
 *
 * Server component — fetches its own subscription state so caller pages
 * don't have to thread the data through. Intentionally non-dismissible:
 * the days-remaining count is the whole point and disappearing it would
 * lead to surprise expirations.
 */
export async function TrialBanner({ userId }: { userId: string }) {
  const subscription = await getSubscription(userId);
  if (!isOnTrial(subscription)) return null;
  const days = trialDaysLeft(subscription);
  if (days <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-r from-[var(--vivida-violet)]/15 via-[var(--vivida-pink)]/8 to-[var(--vivida-cyan)]/15 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5">
      <div
        aria-hidden
        className="absolute -right-8 -top-8 size-32 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--vivida-violet)]/20 ring-1 ring-[var(--vivida-violet)]/40">
            <Sparkles className="size-4 text-[var(--vivida-violet)]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              უფასო Pro საცდელი ·{" "}
              <span className="text-[var(--vivida-violet)]">
                {days === 1 ? "1 დღე" : `${days} დღე`}
              </span>{" "}
              დარჩა
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              საცდელის ბოლოს დაგვჭირდება გადახდა, რომ შეინარჩუნო Pro
              ფუნქციები.
            </p>
          </div>
        </div>
        <Button asChild variant="mystic" size="sm" className="shrink-0">
          <Link href="/pricing">გადადი Pro-ზე</Link>
        </Button>
      </div>
    </div>
  );
}
