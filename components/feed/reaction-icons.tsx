import type { PostReactionKind } from "@/db/schema";

/**
 * Custom reaction icons — designed to feel cosmic + on-brand rather than
 * pulling in stock emoji. Each one is a 24×24 inline SVG that scales with
 * font-size and inherits its own brand hue.
 *
 *  ❤  like     — sparkle heart   (vivida pink / violet)
 *  ☾  dislike  — waning crescent (cool slate)
 *  ★  funny    — wonky star with squint eyes + crooked smile (warm gold)
 *  💧 sad     — crescent + falling cosmic tear (cool cyan)
 *
 * The icons are stateless presentation only. `<ReactionBar>` handles the
 * active/idle styling around them.
 */

export type ReactionMeta = {
  kind: PostReactionKind;
  labelKa: string;
  /** Hue applied as the icon fill/stroke when the user has picked it. */
  hue: string;
};

export const REACTIONS: ReactionMeta[] = [
  { kind: "like", labelKa: "მომწონს", hue: "oklch(0.78 0.18 350)" },
  { kind: "funny", labelKa: "სასაცილო", hue: "oklch(0.85 0.16 85)" },
  { kind: "sad", labelKa: "მწუხარე", hue: "oklch(0.78 0.15 220)" },
  { kind: "dislike", labelKa: "არ მომწონს", hue: "oklch(0.7 0.06 280)" },
];

export const REACTION_BY_KIND: Record<PostReactionKind, ReactionMeta> =
  REACTIONS.reduce(
    (acc, r) => {
      acc[r.kind] = r;
      return acc;
    },
    {} as Record<PostReactionKind, ReactionMeta>
  );

type IconProps = {
  active?: boolean;
  size?: number;
  className?: string;
};

/** Sparkle heart — heart with a 4-point star embedded near the centre.
 *  Pulses faintly when active. */
export function LikeIcon({ active = false, size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="vivida-like-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.18 350)" />
          <stop offset="60%" stopColor="oklch(0.72 0.22 0)" />
          <stop offset="100%" stopColor="oklch(0.68 0.22 305)" />
        </linearGradient>
      </defs>
      <path
        d="M12 21.2c-.4 0-.8-.13-1.13-.4l-7.1-5.8C1.43 13.1 1 11.07 2 9.3c.96-1.7 3.05-2.4 4.78-1.6.94.43 1.7 1.2 2.13 2.1.43-.9 1.2-1.67 2.13-2.1 1.73-.8 3.82-.1 4.78 1.6.45.8.6 1.72.45 2.6"
        fill={active ? "url(#vivida-like-grad)" : "transparent"}
        stroke={active ? "transparent" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 14.2l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z"
        fill={active ? "white" : "currentColor"}
        opacity={active ? 0.95 : 0.55}
      />
    </svg>
  );
}

/** Waning crescent — a dim "fading" moon. Reads as "dislike" without the
 *  heavy thumbs-down baggage; matches the cosmic theme. */
export function DislikeIcon({
  active = false,
  size = 22,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="vivida-dislike-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.04 280)" />
          <stop offset="100%" stopColor="oklch(0.50 0.06 270)" />
        </linearGradient>
        <mask id="vivida-dislike-mask">
          <rect width="24" height="24" fill="white" />
          <circle cx="15" cy="11" r="7.5" fill="black" />
        </mask>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill={active ? "url(#vivida-dislike-grad)" : "transparent"}
        stroke={active ? "transparent" : "currentColor"}
        strokeWidth="1.6"
        mask="url(#vivida-dislike-mask)"
      />
      {/* tiny minus stripe — only visible on the active fill so the idle
          state stays a clean crescent outline */}
      {active && (
        <rect
          x="6"
          y="11.2"
          width="6"
          height="1.6"
          rx="0.8"
          fill="white"
          opacity={0.85}
        />
      )}
    </svg>
  );
}

/** Wonky 5-point star with squint eyes and a crooked smile — captures
 *  "haha" without resorting to a 😂 emoji. */
export function FunnyIcon({ active = false, size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="vivida-funny-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.90 0.18 85)" />
          <stop offset="100%" stopColor="oklch(0.78 0.20 60)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.5 5.6 6.1.6-4.6 4 1.4 6-5.4-3-5.4 3 1.4-6-4.6-4 6.1-.6z"
        fill={active ? "url(#vivida-funny-grad)" : "transparent"}
        stroke={active ? "transparent" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Squint-eye arcs + smile, drawn only on the active fill so the
          idle outline reads as a clean star. */}
      {active && (
        <>
          <path
            d="M9 11.2c.6-.6 1.6-.6 2.2 0"
            fill="none"
            stroke="oklch(0.30 0.04 90)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M12.8 11.2c.6-.6 1.6-.6 2.2 0"
            fill="none"
            stroke="oklch(0.30 0.04 90)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M10 14.2c.8.9 2.4 1.2 3.6.2"
            fill="none"
            stroke="oklch(0.30 0.04 90)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/** Crescent moon shedding a single bright tear. Used for "sad". */
export function SadIcon({ active = false, size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="vivida-sad-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.14 220)" />
          <stop offset="100%" stopColor="oklch(0.65 0.18 250)" />
        </linearGradient>
        <linearGradient id="vivida-sad-tear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.92 0.10 220)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 240)" />
        </linearGradient>
      </defs>
      <path
        d="M14.8 3.4a7.5 7.5 0 1 0 5.3 11.4 6 6 0 0 1-5.3-11.4z"
        fill={active ? "url(#vivida-sad-grad)" : "transparent"}
        stroke={active ? "transparent" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Falling tear — pinched ellipse */}
      <path
        d="M9.2 16.5c-1 1.4-1.5 2.4-1.5 3 0 .9.7 1.6 1.5 1.6.9 0 1.5-.7 1.5-1.6 0-.6-.5-1.6-1.5-3z"
        fill={active ? "url(#vivida-sad-tear)" : "transparent"}
        stroke={active ? "transparent" : "currentColor"}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReactionIcon({
  kind,
  active = false,
  size,
  className,
}: {
  kind: PostReactionKind;
  active?: boolean;
  size?: number;
  className?: string;
}) {
  switch (kind) {
    case "like":
      return <LikeIcon active={active} size={size} className={className} />;
    case "dislike":
      return <DislikeIcon active={active} size={size} className={className} />;
    case "funny":
      return <FunnyIcon active={active} size={size} className={className} />;
    case "sad":
      return <SadIcon active={active} size={size} className={className} />;
  }
}
