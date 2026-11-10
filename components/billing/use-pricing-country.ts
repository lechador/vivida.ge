"use client";

import { useEffect, useState } from "react";

let inflight: Promise<string | null> | null = null;

function fetchPricingCountry(): Promise<string | null> {
  inflight ??= fetch("/api/billing/pricing-country", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { country?: string } | null) => d?.country ?? null)
    .catch(() => {
      inflight = null;
      return null;
    });
  return inflight;
}

/**
 * The pricing country for client-rendered price labels. Callers that already
 * know it (server-rendered parents) pass it in and nothing is fetched; the
 * rest resolve it from the same server helper checkout uses. `null` while
 * unresolved, so a label is never drawn from a guessed catalogue.
 */
export function usePricingCountry(provided?: string | null): string | null {
  const [fetched, setFetched] = useState<string | null>(null);
  useEffect(() => {
    if (provided) return;
    let live = true;
    void fetchPricingCountry().then((c) => live && setFetched(c));
    return () => {
      live = false;
    };
  }, [provided]);
  return provided || fetched;
}
