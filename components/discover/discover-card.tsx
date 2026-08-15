import Image from "next/image";
import Link from "next/link";

import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { DiscoverCard as Card } from "@/lib/discover";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { VerifiedBadge } from "@/components/profile/verified-badge";

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

const ELEMENT_HEX: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

export function DiscoverCard({
  card,
  locale = "ka",
}: {
  card: Card;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const accent = ELEMENT_HEX[card.sunElement];
  const heroSrc = card.photoUrl ?? card.image;

  return (
    <Link
      href={`/u/${card.username}`}
      className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border bg-card/55 p-3 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15 sm:p-3.5"
    >
      {/* Subtle element-tinted glow on hover */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />

      {/* Avatar + element ring + sign chip */}
      <div className="relative shrink-0">
        <div
          className="relative size-14 overflow-hidden rounded-full"
          style={{
            boxShadow: `0 0 0 2px color-mix(in oklch, ${accent} 55%, transparent), inset 0 0 0 1px oklch(1 0 0 / 0.06)`,
          }}
        >
          <Image
            src={heroSrc || DEFAULT_AVATAR}
            alt=""
            fill
            sizes="56px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {/* Sign symbol micro-badge */}
        <span
          className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border border-background bg-card text-[10px] leading-none shadow-sm"
          style={{ color: accent }}
          aria-hidden
        >
          {card.sunSign.symbol}
        </span>
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm font-semibold tracking-tight sm:text-base">
          <span className="truncate">{card.displayName}</span>
          {card.verified && <VerifiedBadge className="scale-90" />}
        </div>
        <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <span className="text-foreground/85">
            {en ? card.sunSign.labelEn : card.sunSign.labelKa}
          </span>
          <span className="text-muted-foreground/60">·</span>
          <span>
            {en ? ELEMENT_EN[card.sunElement] ?? card.sunElement : card.sunElement}
          </span>
        </div>
        {card.bio && (
          <div className="mt-0.5 truncate text-xs text-foreground/65">
            {card.bio}
          </div>
        )}
      </div>

      {card.compatibility !== null && (
        <CompatibilityBadge percent={card.compatibility} />
      )}
    </Link>
  );
}

/**
 * Inline compatibility pill — sized for the compact horizontal card.
 * Higher tiers get the brand gradient; lower tiers fall back to a quiet
 * neutral so the eye lands on the strongest matches first.
 */
function CompatibilityBadge({ percent }: { percent: number }) {
  const tier =
    percent >= 80
      ? "high"
      : percent >= 65
        ? "good"
        : percent >= 50
          ? "mid"
          : "low";

  const styles = {
    high: {
      bg: "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]",
      shadow: "shadow-[0_0_18px_-4px_oklch(0.78_0.18_305/0.6)]",
      text: "text-white",
    },
    good: {
      bg: "bg-[oklch(0.78_0.18_200)]/85",
      shadow: "",
      text: "text-background",
    },
    mid: {
      bg: "bg-foreground/8",
      shadow: "",
      text: "text-foreground/85",
    },
    low: {
      bg: "bg-foreground/5",
      shadow: "",
      text: "text-foreground/65",
    },
  }[tier];

  return (
    <div
      className={`relative shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1 ring-foreground/10 backdrop-blur-md ${styles.bg} ${styles.shadow} ${styles.text}`}
    >
      {percent}
      <span className="ml-0.5 text-[9px] opacity-80">%</span>
    </div>
  );
}
