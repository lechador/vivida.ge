import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { experimentAssignments } from "@/db/schema";
import {
  grantCreditsOnce,
  SIGNUP_BONUS,
} from "@/lib/credits";
import {
  initialSignupCredits,
  isSignupCreditVariant,
  qualifiesForStagedReturn,
  SIGNUP_CREDITS_ELIGIBILITY,
  SIGNUP_CREDITS_EXPERIMENT,
  SIGNUP_CREDITS_STAGED_RETURN_AMOUNT,
  signupCreditVariantFor,
  type PendingSignupCreditAssignment,
  type SignupCreditVariant,
} from "@/lib/signup-credit-experiment-config";

export {
  SIGNUP_CREDITS_EXPERIMENT,
  type PendingSignupCreditAssignment,
  type SignupCreditVariant,
} from "@/lib/signup-credit-experiment-config";

function experimentEnabled(): boolean {
  return process.env.SIGNUP_CREDITS_EXPERIMENT_ENABLED !== "0";
}

async function getOrCreateAssignment(userId: string) {
  const candidate = signupCreditVariantFor(userId);
  await db
    .insert(experimentAssignments)
    .values({
      userId,
      experiment: SIGNUP_CREDITS_EXPERIMENT,
      variant: candidate,
      eligibility: SIGNUP_CREDITS_ELIGIBILITY,
    })
    .onConflictDoNothing({
      target: [experimentAssignments.userId, experimentAssignments.experiment],
    });

  const [assignment] = await db
    .select()
    .from(experimentAssignments)
    .where(
      and(
        eq(experimentAssignments.userId, userId),
        eq(experimentAssignments.experiment, SIGNUP_CREDITS_EXPERIMENT),
      ),
    )
    .limit(1);
  if (!assignment || !isSignupCreditVariant(assignment.variant)) {
    throw new Error("signup credit experiment assignment is missing or invalid");
  }
  return { ...assignment, variant: assignment.variant as SignupCreditVariant };
}

async function markCompleted(userId: string): Promise<void> {
  await db
    .update(experimentAssignments)
    .set({ completedAt: new Date() })
    .where(
      and(
        eq(experimentAssignments.userId, userId),
        eq(experimentAssignments.experiment, SIGNUP_CREDITS_EXPERIMENT),
        isNull(experimentAssignments.completedAt),
      ),
    );
}

/**
 * Enrol a brand-new user and land the immediate portion of their bonus.
 * Existing accounts never call this path and therefore keep every credit.
 */
export async function provisionSignupCredits(userId: string): Promise<void> {
  if (!experimentEnabled()) {
    await grantCreditsOnce(
      userId,
      SIGNUP_BONUS,
      "signup_bonus",
      "signup_bonus_legacy_v1",
    );
    return;
  }

  const assignment = await getOrCreateAssignment(userId);
  await grantCreditsOnce(
    userId,
    initialSignupCredits(assignment.variant),
    "signup_bonus",
    `${SIGNUP_CREDITS_EXPERIMENT}:initial`,
  );
  if (assignment.variant === "control_20") await markCompleted(userId);
}

/**
 * Recover a missed initial grant, then award the staged 5-credit return bonus
 * once at least 24 hours have elapsed. Both grants are database-idempotent.
 */
export async function processPendingSignupCredits(
  userId: string,
  assignment: PendingSignupCreditAssignment,
  now = new Date(),
): Promise<void> {
  await grantCreditsOnce(
    userId,
    initialSignupCredits(assignment.variant),
    "signup_bonus",
    `${SIGNUP_CREDITS_EXPERIMENT}:initial`,
  );

  if (assignment.variant === "control_20") {
    await markCompleted(userId);
    return;
  }
  if (!qualifiesForStagedReturn(assignment.assignedAt, now)) return;

  await grantCreditsOnce(
    userId,
    SIGNUP_CREDITS_STAGED_RETURN_AMOUNT,
    "first_return_bonus",
    `${SIGNUP_CREDITS_EXPERIMENT}:return`,
  );
  await markCompleted(userId);
}

export async function getSignupCreditAssignment(userId: string) {
  const [row] = await db
    .select()
    .from(experimentAssignments)
    .where(
      and(
        eq(experimentAssignments.userId, userId),
        eq(experimentAssignments.experiment, SIGNUP_CREDITS_EXPERIMENT),
      ),
    )
    .limit(1);
  return row && isSignupCreditVariant(row.variant)
    ? { ...row, variant: row.variant as SignupCreditVariant }
    : null;
}

export async function markSignupCreditExperimentExposed(userId: string): Promise<void> {
  await db
    .update(experimentAssignments)
    .set({ exposedAt: new Date() })
    .where(
      and(
        eq(experimentAssignments.userId, userId),
        eq(experimentAssignments.experiment, SIGNUP_CREDITS_EXPERIMENT),
        isNull(experimentAssignments.exposedAt),
      ),
    );
}
