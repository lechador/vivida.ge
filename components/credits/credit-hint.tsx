import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tiny inline note telling the user a credit cost or reward for an action, so
 * nothing surprises them. `tone` colours the ✨: cyan for spend, green for earn.
 */
export function CreditHint({
  children,
  tone = "spend",
  className,
}: {
  children: React.ReactNode;
  tone?: "spend" | "earn";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] leading-tight text-muted-foreground",
        className
      )}
    >
      <Sparkles
        className={cn(
          "size-3 shrink-0",
          tone === "earn" ? "text-[var(--vivida-cyan)]" : "text-[var(--vivida-violet)]"
        )}
      />
      {children}
    </span>
  );
}
