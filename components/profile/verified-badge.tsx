import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** Premium identity marker shown next to a user's name across social surfaces. */
export function VerifiedBadge({
  className,
  label = "Vivida PRO verified",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 text-[var(--vivida-cyan)] drop-shadow-[0_0_6px_oklch(0.78_0.18_210/0.45)]",
        className,
      )}
    >
      <BadgeCheck className="size-4 fill-[var(--vivida-cyan)]/18" />
    </span>
  );
}
