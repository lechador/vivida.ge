"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { normalizeGeorgianMobile } from "@/lib/phone";

/** Consent applies to the exact verified phone displayed when it was given. */
export async function updateSmsMarketingConsent(input: {
  phone: string;
  enabled: boolean;
}): Promise<
  | { ok: true }
  | { ok: false; reason: "phone_changed" | "verification_required" }
> {
  const user = await requireUser();
  const phone = normalizeGeorgianMobile(
    typeof input?.phone === "string" ? input.phone : "",
  );
  if (!phone || typeof input?.enabled !== "boolean") {
    return { ok: false, reason: "phone_changed" };
  }

  const [account] = await db
    .select({
      phone: users.phone,
      phoneVerifiedAt: users.phoneVerifiedAt,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, user.id))
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

  const [updated] = await db
    .update(users)
    .set({
      smsMarketing: input.enabled,
      smsMarketingConsentedAt: input.enabled ? new Date() : null,
    })
    .where(
      and(
        eq(users.id, user.id),
        eq(users.phone, phone),
        isNotNull(users.phoneVerifiedAt),
      ),
    )
    .returning({ id: users.id });
  if (!updated) return { ok: false, reason: "phone_changed" };
  revalidatePath("/account");
  return { ok: true };
}
