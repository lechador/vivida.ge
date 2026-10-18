import { cn } from "@/lib/utils";

/**
 * Vivida Cosmic Astrolabe Mark — combines Vivida's recognizable cosmic
 * violet-pink-cyan gradient star with precision astronomical meridian rings.
 */
export function VividaMark({
  className,
  size = 32,
  glow = true,
  id = "default",
}: {
  className?: string;
  size?: number;
  glow?: boolean;
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
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle cx="32" cy="32" r="30" fill={`url(#${glowId})`} />}

      {/* Outer calibrated meridian ring */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeOpacity="0.55"
        strokeWidth="1.25"
      />
      {/* Inner ecliptic ring */}
      <circle
        cx="32"
        cy="32"
        r="16"
        fill="none"
        stroke="#f8f7ff"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      {/* Cardinal axis ticks */}
      <line
        x1="32"
        y1="2"
        x2="32"
        y2="8"
        stroke="#a78bfa"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      <line
        x1="32"
        y1="56"
        x2="32"
        y2="62"
        stroke="#22d3ee"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      <line
        x1="2"
        y1="32"
        x2="8"
        y2="32"
        stroke="#a78bfa"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      <line
        x1="56"
        y1="32"
        x2="62"
        y2="32"
        stroke="#22d3ee"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      {/* Precision 4-point astrolabe star */}
      <path
        d="M 32 6 L 35.5 28.5 L 58 32 L 35.5 35.5 L 32 58 L 28.5 35.5 L 6 32 L 28.5 28.5 Z"
        fill={`url(#${gradId})`}
      />
      {/* Companion star, upper right */}
      <path
        d="M 50 12 L 51 15.5 L 54.5 16.5 L 51 17.5 L 50 21 L 49 17.5 L 45.5 16.5 L 49 15.5 Z"
        fill="#22d3ee"
        fillOpacity="0.9"
      />
      {/* Center solar point */}
      <circle cx="32" cy="32" r="2.6" fill="#0a0714" />
      <circle cx="32" cy="32" r="1.4" fill="#ffffff" />
    </svg>
  );
}

/**
 * Mark + cosmic wordmark lockup.
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <VividaMark size={size} id={id} />
      {!hideWord && (
        <span
          className="bg-clip-text font-display text-xl font-semibold tracking-tight text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #f8f7ff 0%, #c4b5fd 45%, #f472b6 80%, #22d3ee 100%)",
          }}
        >
          Vivida
        </span>
      )}
    </span>
  );
}
