import { cn } from "@/lib/utils";

/** Same gradient as the vivida wordmark, so the badge reads as part of the
 *  lockup rather than a separate tag. */
const WORDMARK_GRADIENT =
  "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)";

/**
 * Small "pro" pill shown next to the vivida wordmark for Pro members.
 * Matches the wordmark's font (semibold, tight tracking) and gradient fill;
 * render it only when the viewer's plan is "pro" — which includes the free
 * trial, since getCurrentPlan returns "pro" while trialing.
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-2 py-0.5 text-sm font-semibold tracking-tight",
        className
      )}
    >
      <span
        className="bg-clip-text uppercase tracking-wide text-transparent"
        style={{ backgroundImage: WORDMARK_GRADIENT }}
      >
        pro
      </span>
    </span>
  );
}
