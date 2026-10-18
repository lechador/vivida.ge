/**
 * Editorial Celestial primitives for the English site (vividaastro.com).
 *
 * Serif display headlines, hairline brass kickers instead of pill badges,
 * italic accents instead of rainbow gradient-clipped words.
 */

/** Hairline kicker: short brass rule + uppercase label. Replaces pill badges. */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary ${className}`}
    >
      <span
        aria-hidden
        className="inline-block h-px w-8 bg-primary/70"
      />
      {children}
    </p>
  );
}

/**
 * Serif italic accent for one or two headline words.
 */
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <em className="font-display font-normal italic tracking-[-0.01em] text-primary">
      {children}
    </em>
  );
}
