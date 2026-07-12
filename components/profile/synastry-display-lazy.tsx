"use client";

import dynamic from "next/dynamic";

import type { SynastryResult } from "@/lib/synastry";
import type { CompatibilityCardProps } from "./compatibility-card";

/**
 * Lazy wrapper for SynastryDisplay. The full component is ~600 lines of
 * client code (Framer Motion, dialog, breakdown logic) and only renders
 * on /u/[username] when the viewer is logged in *and* has a chart. By
 * dynamically importing here we keep it out of the initial bundle for
 * anonymous traffic — the common case for FB/IG ad arrivals.
 *
 * `ssr: false` because the synastry visuals don't aid SEO/LCP — we'd rather
 * stream the page hero immediately and load this in parallel.
 */
const SynastryDisplay = dynamic(
  () =>
    import("./synastry-display").then((m) => ({
      default: m.SynastryDisplay,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
    ),
  }
);

export function SynastryDisplayLazy(props: {
  result: SynastryResult;
  partnerName: string;
  shareCardProps?: CompatibilityCardProps;
  /** Pre-generated library texts (see lib/synastry-library.ts). */
  interpretations?: Record<string, string>;
}) {
  return <SynastryDisplay {...props} />;
}
