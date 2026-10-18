export const SIGNUP_CREDITS_EXPERIMENT = "signup_credits_v1";

export type SignupCreditVariant = "control" | "bonus_10";

export type PendingSignupCreditAssignment = {
  experiment: string;
  variant: SignupCreditVariant;
  credits: number;
};

export function isSignupCreditVariant(val: unknown): val is SignupCreditVariant {
  return val === "control" || val === "bonus_10";
}
