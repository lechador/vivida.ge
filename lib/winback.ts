import type { SendBudget } from "@/lib/email-send-budget";

export type WinbackResult = {
  dormant: number;
  emailed: number;
  pushed: number;
  skipped: number;
  failed: number;
};

export async function sendWinbackNudges(
  _budget?: SendBudget,
): Promise<WinbackResult> {
  return {
    dormant: 0,
    emailed: 0,
    pushed: 0,
    skipped: 0,
    failed: 0,
  };
}
