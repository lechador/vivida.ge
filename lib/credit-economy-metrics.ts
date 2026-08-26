export type CreditEconomyClass = "free_issued" | "purchased" | "spent" | "ignored";
export type CreditGuardrail = "healthy" | "watch" | "stop";

export function classifyCreditMovement(amount: number, reason: string): CreditEconomyClass {
  if (amount < 0) return "spent";
  if (amount === 0) return "ignored";
  return reason === "purchase" ? "purchased" : "free_issued";
}

export function freeCreditRatio(freeIssued: number, spent: number): number | null {
  return spent > 0 ? freeIssued / spent : null;
}

export function creditGuardrail(ratio: number | null): CreditGuardrail {
  if (ratio === null || ratio > 2.5) return "stop";
  if (ratio > 2) return "watch";
  return "healthy";
}

