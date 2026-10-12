import { cn } from "@/lib/utils";
import { signColor, type ZodiacSign } from "@/lib/zodiac";

/**
 * Display badge for a zodiac sign, the glyph (♈, ♉, …) inside a tile
 * tinted with the sign's element color, with a soft halo. The sign is the
 * single most important piece of astrological identity on a card, so this
 * treatment is intentionally large and luminous.
 */
export function SignBadge({
  sign,
  size = "md",
  className,
}: {
  sign: ZodiacSign;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const color = signColor(sign);
  const sizeClass = {
    sm: "size-10 text-[22px]",
    md: "size-14 text-[34px]",
    lg: "size-20 text-[52px]",
    xl: "size-24 text-[64px]",
  }[size];

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-2xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105",
        sizeClass,
        className
      )}
      style={{
        background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklch, ${color} 30%, transparent) 0%, color-mix(in oklch, ${color} 6%, oklch(0.16 0.03 285)) 70%)`,
        boxShadow: `0 8px 28px -10px ${color}, inset 0 0 0 1px color-mix(in oklch, ${color} 35%, transparent)`,
      }}
      title={`${sign.labelKa} ${sign.symbol}`}
    >
      <span
        className="leading-none font-light"
        style={{
          color,
          filter: `drop-shadow(0 0 14px color-mix(in oklch, ${color} 80%, transparent))`,
        }}
      >
        {sign.symbol}
      </span>
    </div>
  );
}
