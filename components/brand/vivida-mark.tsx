import { cn } from "@/lib/utils";

/**
 * Vivida brand mark, a 4-pointed cosmic sparkle in the brand gradient,
 * with a small companion star. Reads as "your personal star in the cosmos".
 *
 * The gradient + glow IDs are uniquified so multiple marks can coexist on
 * the page without colliding (Safari is strict about duplicate SVG IDs
 * across instances).
 */
export function VividaMark({
  className,
  size = 32,
  glow = true,
  id = "default",
}: {
  className?: string;
  size?: number;
  /** Soft radial halo behind the sparkle. Disable for tight layouts. */
  glow?: boolean;
  /** Suffix for SVG <defs> ids, pass a unique value if rendering >1 on the page. */
  id?: string;
}) {
  const gradId = `vivida-cosmic-${id}`;
  const glowId = `vivida-glow-${id}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle cx="32" cy="32" r="30" fill={`url(#${glowId})`} />}

      {/* Main sparkle, slightly elongated points read better at small sizes */}
      <path
        d="M 32 4 L 36 28 L 60 32 L 36 36 L 32 60 L 28 36 L 4 32 L 28 28 Z"
        fill={`url(#${gradId})`}
      />

      {/* Bright center highlight */}
      <circle cx="32" cy="32" r="3" fill="white" fillOpacity="0.85" />

      {/* Companion star, upper right, adds asymmetry + cosmic feel */}
      <path
        d="M 50 12 L 51 16 L 55 17 L 51 18 L 50 22 L 49 18 L 45 17 L 49 16 Z"
        fill="#22d3ee"
        fillOpacity="0.9"
      />
    </svg>
  );
}

/**
 * Mark + wordmark lockup. Wordmark uses the same cosmic gradient as a
 * background-clip text fill so the brand reads as a single unit.
 */
export function VividaLockup({
  className,
  size = 32,
  hideWord = false,
  id = "lockup",
}: {
  className?: string;
  size?: number;
  hideWord?: boolean;
  id?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <VividaMark size={size} id={id} />
      {!hideWord && (
        <span
          className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
          }}
        >
          vivida
        </span>
      )}
    </span>
  );
}
