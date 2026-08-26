import { createHash } from "node:crypto";

import { EXPERIMENT_CATALOG, type ExperimentName } from "@/lib/experiment-catalog";

/** Stable allocation: changing request order, browser or device cannot move a user. */
export function stableExperimentVariant(
  userId: string,
  experiment: ExperimentName,
): string {
  const variants = EXPERIMENT_CATALOG[experiment].variants;
  const byte = createHash("sha256").update(`${experiment}:${userId}`).digest()[0];
  return variants[byte % variants.length];
}

