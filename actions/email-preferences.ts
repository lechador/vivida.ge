"use server";

import { requireUser } from "@/lib/auth-helpers";
import { updateEmailPreferencesCore } from "@/lib/account-core";

export type EmailPreferencesInput = {
  daily: boolean;
  marketing: boolean;
  nudges: boolean;
};

export type EmailPreferencesResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateEmailPreferences(
  input: EmailPreferencesInput
): Promise<EmailPreferencesResult> {
  const user = await requireUser();
  return updateEmailPreferencesCore(user.id, input);
}
