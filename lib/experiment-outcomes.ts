import type { ExperimentName } from "@/lib/experiment-catalog";

/**
 * Measurement must never block checkout or entitlement delivery. The dynamic
 * import also keeps database-only experiment code out of route unit-test setup.
 */
export async function recordExperimentOutcomesBestEffort(
  userId: string,
  experiments: readonly ExperimentName[],
  eventName: string,
  surface: string,
  eventKey: string,
): Promise<void> {
  try {
    const { recordExistingExperimentOutcomes } = await import("@/lib/experiments");
    await recordExistingExperimentOutcomes(userId, experiments, eventName, surface, eventKey);
  } catch (error) {
    console.warn("[experiments] outcome recording failed:", error);
  }
}

