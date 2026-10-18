import { cn } from "@/lib/utils";

/**
 * Vivida Editorial Astrolabe Mark — a precision astronomical compass rose
 * and meridian ring rendered in calibrated warm brass (#D4AF37) and warm
 * ivory (#F4F0EA). Replaces the generic AI neon purple/pink/cyan sparkle.
 */
export function VividaMark({
  className,
  size = 32,
  glow = false,
  id = "default",
}: {
  className?: string;
  size?: number;
  glow?: boolean;
  id?: string;
}) {
  void glow;
  void id;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Outer calibrated meridian ring */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#D4AF37"
        strokeOpacity="0.45"
        strokeWidth="1.25"
      />
      {/* Inner ecliptic ring */}
      <circle
        cx="32"
        cy="32"
        r="16"
        fill="none"
        stroke="#F4F0EA"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      {/* Cardinal axis ticks */}
      <line x1="32" y1="2" x2="32" y2="8" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.2" />
      <line x1="32" y1="56" x2="32" y2="62" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.2" />
      <line x1="2" y1="32" x2="8" y2="32" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.2" />
      <line x1="56" y1="32" x2="62" y2="32" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.2" />
      {/* Precision 4-point astrolabe star */}
      <path
        d="M 32 8 L 35.2 28.8 L 56 32 L 35.2 35.2 L 32 56 L 28.8 35.2 L 8 32 L 28.8 28.8 Z"
        fill="#D4AF37"
      />
      {/* Center solar point */}
      <circle cx="32" cy="32" r="2.5" fill="#0B0C10" />
      <circle cx="32" cy="32" r="1.25" fill="#F4F0EA" />
    </svg>
  );
}

/**
 * Mark + editorial wordmark lockup in warm ivory.
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
        <span className="font-display text-xl font-medium tracking-tight text-foreground">
          Vivida
        </span>
      )}
    </span>
  );
}
