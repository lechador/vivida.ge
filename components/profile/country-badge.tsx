import { cn } from "@/lib/utils";
import { countryFlagEmoji } from "@/lib/countries";

/** Compact residence-country marker for user profile identity surfaces. */
export function CountryBadge({
  countryCode,
  countryName,
  className,
}: {
  countryCode: string | null | undefined;
  countryName: string;
  className?: string;
}) {
  if (!countryCode) return null;

  return (
    <span
      aria-label={countryName}
      title={countryName}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-background/45 px-2 py-0.5 text-xs font-medium text-foreground/80",
        className,
      )}
    >
      <span aria-hidden className="text-sm leading-none">
        {countryFlagEmoji(countryCode)}
      </span>
      <span className="hidden sm:inline">{countryName}</span>
    </span>
  );
}
