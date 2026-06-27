import { cn } from "@/lib/utils";

/**
 * Small gold "Pro" pill shown next to the vivida wordmark for Pro members
 * (the gold hue mirrors the Crown nav icon / subscription accent). Render it
 * only when the viewer's plan is "pro" — which includes the free trial,
 * since getCurrentPlan returns "pro" while trialing.
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[oklch(0.85_0.16_85)]/45 bg-[oklch(0.85_0.16_85)]/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wider text-[oklch(0.85_0.16_85)]",
        className
      )}
    >
      Pro
    </span>
  );
}
