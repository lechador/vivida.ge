"use client";

import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Dot badge for the ask tab — an unopened proactive nudge is waiting.
 * Seeded from the server-side pending count (header data, 30s cache);
 * no live updates needed since visiting /ask clears it server-side.
 */
export function AskTabBadge({
  pending,
  locale = "ka",
}: {
  pending: number;
  locale?: UserLocale;
}) {
  if (pending <= 0) return null;
  return (
    <span
      aria-label={
        locale !== "ka"
          ? "New message from your astrologer"
          : "ახალი მესიჯი შენი ასტროლოგისგან"
      }
      className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--vivida-pink)] ring-2 ring-background"
    />
  );
}
