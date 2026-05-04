import Image from "next/image";
import Link from "next/link";

import type { DiscoverCard as Card } from "@/lib/discover";

const ELEMENT_HEX: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

const ELEMENT_GRADIENT: Record<string, string> = {
  ცეცხლი: "from-[oklch(0.55_0.2_25)] to-[oklch(0.45_0.18_350)]",
  მიწა: "from-[oklch(0.5_0.12_130)] to-[oklch(0.4_0.1_110)]",
  ჰაერი: "from-[oklch(0.55_0.16_220)] to-[oklch(0.4_0.18_250)]",
  წყალი: "from-[oklch(0.45_0.2_280)] to-[oklch(0.35_0.18_295)]",
};

export function DiscoverCard({ card }: { card: Card }) {
  const accent = ELEMENT_HEX[card.sunElement];
  const gradient = ELEMENT_GRADIENT[card.sunElement];
  const heroSrc = card.photoUrl ?? card.image;

  return (
    <Link
      href={`/u/${card.username}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card/40 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:ring-foreground/20"
    >
      {/* Background — photo, or element-tinted gradient with initial */}
      {heroSrc ? (
        <Image
          src={heroSrc}
          alt=""
          fill
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} grid place-items-center`}
        >
          <span className="text-6xl font-semibold text-white/85">
            {card.displayName[0]?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Element accent corner glow */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-32 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />

      {/* Synastry % badge — top-right */}
      {card.compatibility !== null && (
        <CompatibilityBadge percent={card.compatibility} />
      )}

      {/* Bottom-overlay info */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold tracking-tight drop-shadow">
              {card.displayName}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
              <span
                className="text-base leading-none"
                style={{ color: accent }}
              >
                {card.sunSign.symbol}
              </span>
              <span className="truncate">{card.sunSign.labelKa}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Tier-styled compatibility badge in the top-right corner of the card.
 * Higher percentages get a stronger gradient + glow so the eye lands on
 * the strongest matches first.
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
      shadow: "shadow-[0_0_24px_-4px_oklch(0.78_0.18_305/0.7)]",
      text: "text-white",
    },
    good: {
      bg: "bg-[oklch(0.78_0.18_200)]/90",
      shadow: "shadow-[0_0_18px_-6px_oklch(0.78_0.18_200/0.6)]",
      text: "text-background",
    },
    mid: {
      bg: "bg-black/65",
      shadow: "",
      text: "text-white",
    },
    low: {
      bg: "bg-black/55",
      shadow: "",
      text: "text-white/80",
    },
  }[tier];

  return (
    <div
      className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 backdrop-blur-md ring-1 ring-white/15 ${styles.bg} ${styles.shadow} ${styles.text}`}
    >
      <span className="text-xs font-semibold tabular-nums leading-none">
        {percent}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
        %
      </span>
    </div>
  );
}
