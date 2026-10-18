import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { grantSmsConsentGift } from "@/lib/phone-gift";

/**
 * Shared core for promotional-SMS consent changes. Both the account card's
 * toggle and the phone-gift flow land here, so the guards and the one-time
 * consent grant can never drift between surfaces.
 *
 * Consent applies to the exact verified phone displayed when it was given:
 * the number must still match, and (for password accounts) the phone
 * verification must not predate the email verification, a signup claim must
 * not turn into an SMS-marketing opt-in before the inbox was proven.
 */

export type SmsConsentResult =
  | { ok: true; changed: boolean; consentGift: boolean }
  | { ok: false; reason: "phone_changed" | "verification_required" };

export async function setSmsMarketingConsent(
  userId: string,
  phone: string,
  enabled: boolean,
): Promise<SmsConsentResult> {
  const [account] = await db
    .select({
      phone: users.phone,
      phoneVerifiedAt: users.phoneVerifiedAt,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
      smsMarketing: users.smsMarketing,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!account || account.phone !== phone) {
    return { ok: false, reason: "phone_changed" };
  }
  if (
    !account.phoneVerifiedAt ||
    (account.passwordHash &&
      (!account.emailVerified ||
        account.phoneVerifiedAt.getTime() < account.emailVerified.getTime()))
  ) {
    return { ok: false, reason: "verification_required" };
  }

  const changed = account.smsMarketing !== enabled;
  const [updated] = await db
    .update(users)
    .set({
      smsMarketing: enabled,
      smsMarketingConsentedAt: enabled ? new Date() : null,
    })
    .where(
      and(
        eq(users.id, userId),
        eq(users.phone, phone),
        isNotNull(users.phoneVerifiedAt),
      ),
    )
    .returning({ id: users.id });
  if (!updated) return { ok: false, reason: "phone_changed" };

  // The first opt-in on a verified number pays the one-time consent gift
  // (exactly-once via its ledger ref; off/on toggles later pay nothing).
  let consentGift = false;
  if (enabled && changed) {
    consentGift = await grantSmsConsentGift(userId);
  }
  return { ok: true, changed, consentGift };
}
