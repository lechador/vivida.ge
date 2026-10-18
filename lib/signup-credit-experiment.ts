import {
  SIGNUP_CREDITS_EXPERIMENT,
  type PendingSignupCreditAssignment,
} from "@/lib/signup-credit-experiment-config";

export { SIGNUP_CREDITS_EXPERIMENT };

export async function getSignupCreditAssignment(
  _userId: string,
): Promise<PendingSignupCreditAssignment | null> {
  return null;
}

export async function markSignupCreditExperimentExposed(
  _userId: string,
  _surface?: string,
): Promise<void> {}

export async function provisionSignupCredits(
  _userId: string,
): Promise<number> {
  return 0;
}

export async function processPendingSignupCredits(
  _userId: string,
): Promise<void> {}
