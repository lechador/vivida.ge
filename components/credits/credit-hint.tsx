import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

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
        "inline-flex items-center gap-1.5 font-mono text-[11px] leading-tight text-muted-foreground",
        className
      )}
    >
      <Sparkles
        className={cn(
          "size-3 shrink-0",
          tone === "earn" ? "text-accent" : "text-primary"
        )}
      />
      {children}
    </span>
  );
}
