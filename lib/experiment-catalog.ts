export const EXPERIMENTS = {
  pricingPresentation: "pricing_presentation_v1",
  contextualPaywall: "contextual_paywall_v1",
  reminderPrompt: "reminder_prompt_v1",
} as const;

export type ExperimentName = (typeof EXPERIMENTS)[keyof typeof EXPERIMENTS];

export const EXPERIMENT_CATALOG = {
  [EXPERIMENTS.pricingPresentation]: {
    eligibility: "authenticated_billing_surface",
    variants: ["credits_first", "pro_first"],
    outcomes: ["choice_credits", "choice_pro", "checkout_started", "purchase_completed"],
  },
  [EXPERIMENTS.contextualPaywall]: {
    eligibility: "authenticated_credit_shortfall",
    variants: ["deficit_message", "value_message"],
    outcomes: ["choice_credits", "choice_pro", "checkout_started", "purchase_completed"],
  },
  [EXPERIMENTS.reminderPrompt]: {
    eligibility: "authenticated_account_reminders",
    variants: ["settings_first", "benefit_first"],
    outcomes: ["preferences_saved", "opt_in"],
  },
} as const satisfies Record<
  ExperimentName,
  { eligibility: string; variants: readonly [string, string]; outcomes: readonly string[] }
>;

export function isExperimentName(value: string): value is ExperimentName {
  return Object.hasOwn(EXPERIMENT_CATALOG, value);
}

export function isExperimentOutcome(experiment: ExperimentName, value: string): boolean {
  return (EXPERIMENT_CATALOG[experiment].outcomes as readonly string[]).includes(value);
}

