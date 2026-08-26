import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { experimentAssignments, experimentEvents } from "@/db/schema";
import {
  EXPERIMENT_CATALOG,
  type ExperimentName,
} from "@/lib/experiment-catalog";
import { stableExperimentVariant } from "@/lib/experiment-assignment";

export type ExperimentEventType = "exposure" | "outcome";

export async function getOrCreateExperimentAssignment(
  userId: string,
  experiment: ExperimentName,
) {
  const config = EXPERIMENT_CATALOG[experiment];
  await db
    .insert(experimentAssignments)
    .values({
      userId,
      experiment,
      variant: stableExperimentVariant(userId, experiment),
      eligibility: config.eligibility,
    })
    .onConflictDoNothing({
      target: [experimentAssignments.userId, experimentAssignments.experiment],
    });

  const [assignment] = await db
    .select()
    .from(experimentAssignments)
    .where(and(
      eq(experimentAssignments.userId, userId),
      eq(experimentAssignments.experiment, experiment),
    ))
    .limit(1);
  if (!assignment || !(config.variants as readonly string[]).includes(assignment.variant)) {
    throw new Error(`experiment assignment is missing or invalid: ${experiment}`);
  }
  return assignment;
}

export async function getExistingExperimentAssignment(
  userId: string,
  experiment: ExperimentName,
) {
  const [assignment] = await db
    .select()
    .from(experimentAssignments)
    .where(and(
      eq(experimentAssignments.userId, userId),
      eq(experimentAssignments.experiment, experiment),
    ))
    .limit(1);
  return assignment ?? null;
}

export async function recordExperimentEvent(input: {
  userId: string;
  experiment: ExperimentName;
  eventType: ExperimentEventType;
  eventName: string;
  surface: string;
  eventKey: string;
  createAssignment?: boolean;
}): Promise<{ variant: string } | null> {
  const assignment = input.createAssignment === false
    ? await getExistingExperimentAssignment(input.userId, input.experiment)
    : await getOrCreateExperimentAssignment(input.userId, input.experiment);
  if (!assignment) return null;

  await db.insert(experimentEvents).values({
    userId: input.userId,
    experiment: input.experiment,
    variant: assignment.variant,
    eventType: input.eventType,
    eventName: input.eventName,
    surface: input.surface.slice(0, 120),
    eventKey: input.eventKey.slice(0, 180),
  }).onConflictDoNothing({
    target: [
      experimentEvents.userId,
      experimentEvents.experiment,
      experimentEvents.eventType,
      experimentEvents.eventName,
      experimentEvents.eventKey,
    ],
  });

  if (input.eventType === "exposure") {
    await db.update(experimentAssignments).set({ exposedAt: new Date() }).where(and(
      eq(experimentAssignments.userId, input.userId),
      eq(experimentAssignments.experiment, input.experiment),
      isNull(experimentAssignments.exposedAt),
    ));
  }
  return { variant: assignment.variant };
}

export async function recordExistingExperimentOutcomes(
  userId: string,
  experiments: readonly ExperimentName[],
  eventName: string,
  surface: string,
  eventKey: string,
): Promise<void> {
  await Promise.all(experiments.map(async (experiment) => {
    if (!(EXPERIMENT_CATALOG[experiment].outcomes as readonly string[]).includes(eventName)) return;
    await recordExperimentEvent({
      userId,
      experiment,
      eventType: "outcome",
      eventName,
      surface,
      eventKey,
      createAssignment: false,
    });
  }));
}
