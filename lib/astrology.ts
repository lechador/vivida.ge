import { createHash } from "node:crypto";

import type { NatalChartJson, NatalAspectJson } from "@/db/schema";
import { computeNatalLocally, type NatalInput } from "./astrology-local";
import { fetchNatalFromApi } from "./astrology-api";
import { detectAspects } from "./aspects";

export type ChartSource = "api" | "local";

export type ComputeChartResult = {
  data: NatalChartJson;
  source: ChartSource;
  inputHash: string;
  apiError?: string;
};

/** Stable hash so we can detect when birth data changes and bust the cache. */
export function hashInput(input: NatalInput): string {
  const norm = JSON.stringify({
    d: input.date,
    t: input.time,
    la: Math.round(input.latitude * 1e4) / 1e4,
    lo: Math.round(input.longitude * 1e4) / 1e4,
    tz: input.timezone,
  });
  return createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

/**
 * Compute the major chart-internal aspects (planets + Asc + MC) for a chart.
 * Exported so we can re-run it on every chart read, that way orb-tolerance
 * tweaks (in lib/aspects.ts) propagate without needing to bust the DB cache.
 */
export function computeAspectsFor(data: NatalChartJson): NatalAspectJson[] {
  // Inputs to detectAspects: a flat dict of body → { longitude }.
  const points: Record<string, { longitude: number }> = {};
  for (const [k, v] of Object.entries(data.bodies)) {
    points[k] = { longitude: v.longitude };
  }
  // Include the angles, Asc + MC aspects matter a lot for personality.
  if (data.ascendant) {
    points.ascendant = { longitude: data.ascendant.longitude };
  }
  if (data.midheaven) {
    points.midheaven = { longitude: data.midheaven.longitude };
  }
  return detectAspects(points);
}

/**
 * Local computation is the primary source, it's the same Swiss Ephemeris
 * data freeastrologyapi.com uses, just in-process, with no rate limits and
 * no network failure modes.
 *
 * Set `FREE_ASTROLOGY_API_AS_PRIMARY=true` to flip the orchestrator and
 * try the remote API first (e.g. for verification or to use endpoints we
 * don't compute locally yet, like their hosted SVG wheel).
 */
export async function computeChart(
  input: NatalInput
): Promise<ComputeChartResult> {
  const inputHash = hashInput(input);
  const apiKey = process.env.FREE_ASTROLOGY_API_KEY;
  const apiAsPrimary =
    process.env.FREE_ASTROLOGY_API_AS_PRIMARY === "true" && apiKey;

  if (apiAsPrimary) {
    try {
      const apiData = await fetchNatalFromApi(input, apiKey);
      const localData = computeNatalLocally(input);
      const merged: NatalChartJson = {
        ...apiData,
        houses: localData.houses,
      };
      merged.aspects = computeAspectsFor(merged);
      return { data: merged, source: "api", inputHash };
    } catch (err) {
      const apiError = (err as Error).message;
      console.warn(
        `[astrology] API failed (${apiError}), falling back to local computation`
      );
      const data = computeNatalLocally(input);
      data.aspects = computeAspectsFor(data);
      return { data, source: "local", inputHash, apiError };
    }
  }

  // Default path: local-only, deterministic, never fails.
  const data = computeNatalLocally(input);
  data.aspects = computeAspectsFor(data);
  return { data, source: "local", inputHash };
}

export type { NatalInput };
