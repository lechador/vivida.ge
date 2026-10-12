/**
 * Editorial primitives for the English site (vividaastro.com).
 *
 * The de-slop system: serif display headlines, hairline kickers instead of
 * pill badges, italic accents instead of gradient-clipped words. EN-only,
 * nothing here is imported by Georgian-host markup.
 */

/** Hairline kicker: short rule + uppercase label. Replaces pill badges. */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--vivida-cyan)] ${className}`}
    >
      <span
        aria-hidden
        className="inline-block h-px w-8 bg-[var(--vivida-cyan)]/60"
      />
      {children}
    </p>
  );
}

/**
 * Serif italic accent for one or two headline words. Replaces the
 * gradient-clipped span, same emphasis job, none of the AI-template look.
 */
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <em className="font-display font-medium italic tracking-[-0.01em]">
      {children}
    </em>
  );
}
