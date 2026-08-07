import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Credit-gated feature card.
 * Shows the *shape* of what's locked (blurred preview behind the overlay),
 * then a clear CTA to the credit hub.
 */
export function LockedCard({
  title,
  preview,
  description,
  ctaLabel = "კრედიტების ნახვა",
  variant = "default",
}: {
  title: string;
  /** Greyed/blurred sample text shown behind the overlay. */
  preview: string;
  description: string;
  ctaLabel?: string;
  variant?: "default" | "tall";
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/30 bg-card/40 backdrop-blur-xl">
      {/* Mystic glow */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-44 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />

      {/* Blurred preview */}
      <div
        className="relative px-6 pt-6 text-sm leading-relaxed text-foreground/30 select-none"
        aria-hidden
        style={{ filter: "blur(6px)" }}
      >
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em]">
          {title}
        </div>
        <p className={variant === "tall" ? "min-h-[120px]" : ""}>{preview}</p>
      </div>

      {/* Overlay with CTA */}
      <div className="relative -mt-12 px-6 pb-6">
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--vivida-pink)]">
            <Lock className="size-3" />
            კრედიტებით იხსნება
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          <Button asChild variant="mystic" size="sm" className="mt-4">
            <Link href="/credits">
              <Sparkles />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
