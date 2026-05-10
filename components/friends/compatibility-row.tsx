import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
} from "@/lib/synastry";
import type { FriendWithSynastry } from "@/lib/friend-synastry";

import { synastryAccent } from "./synastry-visuals";

/**
 * Ranked-list row for the compatibility tab. Bigger ring than the chip,
 * shows verdict + top category, deep-links to the friend's profile (which
 * already renders the full synastry breakdown).
 */
export function CompatibilityRow({
  u,
  rank,
}: {
  u: FriendWithSynastry;
  /** 1-based rank in the sorted list. Rank 1 with a real score gets a
   *  hero treatment to celebrate the "best match" feeling. */
  rank: number;
}) {
  const displayName =
    u.displayName ?? u.name?.split(" ")[0] ?? u.username ?? "user";
  const profileHref = u.username ? `/u/${u.username}` : null;
  const score = u.synastry?.overall ?? null;
  const accent = score == null ? "oklch(0.55 0.05 280)" : synastryAccent(score);
  const isTop = rank === 1 && score != null && score >= 60;

  const avatar = u.image ? (
    <Image
      src={u.image}
      alt=""
      width={56}
      height={56}
      className="size-14 shrink-0 rounded-full border border-border/80 object-cover"
    />
  ) : (
    <div className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-lg text-muted-foreground">
      {displayName[0]?.toUpperCase()}
    </div>
  );

  const cardClass = isTop
    ? "border-[var(--vivida-violet)]/45 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-pink)]/12 shadow-[0_0_32px_-12px_oklch(0.78_0.18_305/0.5)]"
    : "border-border bg-card/65";

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:ring-foreground/15 sm:p-5 ${cardClass}`}
    >
      {isTop && (
        <span className="absolute right-4 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
          <Sparkles className="size-3" /> #1
        </span>
      )}
      <div className="flex items-center gap-4">
        {profileHref ? (
          <Link
            href={profileHref}
            aria-label={`${displayName}-ის პროფილი`}
            className="shrink-0 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {profileHref ? (
              <Link
                href={profileHref}
                className="truncate text-base font-medium text-foreground transition-colors hover:text-[var(--vivida-violet)] sm:text-lg"
              >
                {displayName}
              </Link>
            ) : (
              <span className="truncate text-base font-medium text-foreground sm:text-lg">
                {displayName}
              </span>
            )}
            {u.username && (
              <Link
                href={`/u/${u.username}`}
                className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                @{u.username}
              </Link>
            )}
          </div>
          {score != null && u.synastry ? (
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">
                {u.synastry.verdict}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-muted-foreground">
                {CATEGORY_EMOJI[u.synastry.topCategory]}{" "}
                {CATEGORY_LABEL_KA[u.synastry.topCategory]}{" "}
                <span className="tabular-nums text-foreground/85">
                  {u.synastry.topScore}%
                </span>
              </span>
            </div>
          ) : (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              ცის რუკა ჯერ არ აქვს — დაიცადე, სანამ შეავსებს
            </p>
          )}
        </div>
        <BigRing percent={score} accent={accent} />
        {profileHref && (
          <Link
            href={profileHref}
            aria-label="დეტალური თავსებადობა"
            className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </li>
  );
}

function BigRing({
  percent,
  accent,
}: {
  percent: number | null;
  accent: string;
}) {
  const size = 56;
  const strokeWidth = 5;
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const offset =
    percent == null ? C : C * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.27 0.04 280 / 0.6)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {percent == null ? (
          <span className="text-xs text-muted-foreground/70">—</span>
        ) : (
          <span className="text-base font-semibold tabular-nums">
            {percent}
          </span>
        )}
      </div>
    </div>
  );
}
