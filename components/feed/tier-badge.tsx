import { Sparkles } from "lucide-react";

import { tierFor, pointsToNextTier, type Tier } from "@/lib/tiers";

/**
 * Tier chip — one of three sizes:
 *   "byline"  — tiny pill next to a post-byline (just star + label)
 *   "profile" — fuller card with tier name, total, and next-tier hint
 *   "compact" — total + label inline (used in /leaderboard rows)
 */
export function TierBadge({
  total,
  variant = "byline",
}: {
  total: number;
  variant?: "byline" | "profile" | "compact";
}) {
  const tier = tierFor(total);

  if (variant === "byline") return <BylinePill tier={tier} />;
  if (variant === "compact")
    return <CompactRow tier={tier} total={total} />;
  return <ProfileCard tier={tier} total={total} />;
}

function BylinePill({ tier }: { tier: Tier }) {
  // Everyone starts at "nova" (0 pts), so showing it on every post/profile
  // byline is noise, not signal — it conveys nothing since it's universal.
  // Once a user earns a real tier (Bright+), the badge becomes meaningful
  // and appears.
  if (tier.key === "nova") return null;

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={{
        borderColor: `color-mix(in oklch, ${tier.hue} 35%, transparent)`,
        backgroundColor: `color-mix(in oklch, ${tier.hue} 12%, transparent)`,
        color: tier.hue,
      }}
      title={tier.labelKa}
    >
      <Sparkles className="size-2.5" aria-hidden />
      {tier.labelKa}
    </span>
  );
}

function CompactRow({ tier, total }: { tier: Tier; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{ backgroundColor: tier.hue }}
      />
      <span className="text-foreground/85" style={{ color: tier.hue }}>
        {tier.labelKa}
      </span>
      <span className="tabular-nums text-muted-foreground">{total}</span>
    </div>
  );
}

function ProfileCard({ tier, total }: { tier: Tier; total: number }) {
  const remaining = pointsToNextTier(total);
  return (
    <div
      className="rounded-2xl border bg-card/40 p-4 ring-1 ring-foreground/5 backdrop-blur-xl"
      style={{
        borderColor: `color-mix(in oklch, ${tier.hue} 30%, transparent)`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" style={{ color: tier.hue }} />
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: tier.hue }}
          >
            {tier.labelKa}
          </span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {total}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tier.taglineKa}</p>
      {remaining !== null && (
        <p className="mt-2 text-[11px] text-muted-foreground/80">
          შემდეგ საფეხურამდე: {remaining} ქულა
        </p>
      )}
    </div>
  );
}
