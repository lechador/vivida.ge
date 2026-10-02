"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { normalizeGeorgianMobile } from "@/lib/phone";
import { setSmsMarketingConsent } from "@/lib/sms-consent";

/**
 * Account-page promotional-SMS toggle. The DB core (guards + the one-time
 * consent grant) lives in lib/sms-consent.ts, shared with the phone-gift
 * flow. Consent applies to the exact verified phone displayed when it was
 * given.
 */
export async function updateSmsMarketingConsent(input: {
  phone: string;
  enabled: boolean;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      reason: "phone_changed" | "verification_required" | "unavailable";
    }
> {
  // Promotional SMS is a Georgian-numbers channel; no opt-ins from the
  // English host (its UI never renders the toggle). Checked before auth so
  // the gate holds logged-out too.
  if ((await getRequestLocale()) === "en") {
    return { ok: false, reason: "unavailable" };
  }
  const user = await requireUser();
  const phone = normalizeGeorgianMobile(
    typeof input?.phone === "string" ? input.phone : "",
  );
  if (!phone || typeof input?.enabled !== "boolean") {
    return { ok: false, reason: "phone_changed" };
  }

  const result = await setSmsMarketingConsent(user.id, phone, input.enabled);
  if (!result.ok) return result;
  revalidatePath("/account");
  return { ok: true };
}
