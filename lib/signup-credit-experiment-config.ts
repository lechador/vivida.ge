import { createHash } from "node:crypto";

import {
  SIGNUP_BONUS,
  STAGED_RETURN_BONUS,
  STAGED_SIGNUP_BONUS,
} from "@/lib/credits-config";

export const SIGNUP_CREDITS_EXPERIMENT = "signup_credits_v1";
export const SIGNUP_CREDITS_ELIGIBILITY = "new_user_after_launch";
export const SIGNUP_CREDITS_RETURN_DELAY_MS = 24 * 60 * 60 * 1000;

export const SIGNUP_CREDIT_VARIANTS = ["control_20", "staged_10_plus_5"] as const;
export type SignupCreditVariant = (typeof SIGNUP_CREDIT_VARIANTS)[number];

export type PendingSignupCreditAssignment = {
  variant: SignupCreditVariant;
  assignedAt: Date;
};

export function isSignupCreditVariant(value: string): value is SignupCreditVariant {
  return SIGNUP_CREDIT_VARIANTS.includes(value as SignupCreditVariant);
}

/** Stable 50/50 allocation with no browser identifier or mutable cookie. */
export function signupCreditVariantFor(userId: string): SignupCreditVariant {
  const byte = createHash("sha256")
    .update(`${SIGNUP_CREDITS_EXPERIMENT}:${userId}`)
    .digest()[0];
  return byte % 2 === 0 ? "control_20" : "staged_10_plus_5";
}

export function initialSignupCredits(variant: SignupCreditVariant): number {
  return variant === "control_20" ? SIGNUP_BONUS : STAGED_SIGNUP_BONUS;
}

export function qualifiesForStagedReturn(
  assignedAt: Date,
  now = new Date(),
): boolean {
  return now.getTime() - assignedAt.getTime() >= SIGNUP_CREDITS_RETURN_DELAY_MS;
}

export const SIGNUP_CREDITS_STAGED_RETURN_AMOUNT = STAGED_RETURN_BONUS;
