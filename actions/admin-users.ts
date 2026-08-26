"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { sendVerifiedBadgeGiftEmail } from "@/lib/email";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";

function validUserId(value: string): boolean {
  return value.length >= 8 && value.length <= 128;
}

function refreshBadgeSurfaces(username: string | null): void {
  revalidatePath("/admin/users");
  revalidatePath("/feed");
  revalidatePath("/people");
  revalidatePath("/discover");
  if (username) revalidatePath(`/u/${username}`);
}

export async function grantVerifiedBadge(userId: string) {
  const admin = await requireAdmin();
  if (!validUserId(userId)) {
    return { ok: false as const, error: "არასწორი მომხმარებელი." };
  }

  const grantedAt = new Date();
  const [newGrant] = await db
    .update(users)
    .set({
      verifiedBadgeGrantedAt: grantedAt,
      verifiedBadgeGrantedBy: admin.email?.toLowerCase() ?? "admin",
      verifiedBadgeEmailSentAt: null,
    })
    .where(and(eq(users.id, userId), isNull(users.verifiedBadgeGrantedAt)))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      grantedAt: users.verifiedBadgeGrantedAt,
      emailSentAt: users.verifiedBadgeEmailSentAt,
    });

  const target = newGrant ?? (await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
      grantedAt: users.verifiedBadgeGrantedAt,
      emailSentAt: users.verifiedBadgeEmailSentAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1))[0];

  if (!target) {
    return { ok: false as const, error: "მომხმარებელი ვერ მოიძებნა." };
  }

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const username = profile?.username ?? null;

  if (target.emailSentAt) {
    refreshBadgeSurfaces(username);
    return {
      ok: true as const,
      email: "already_sent" as const,
      message: "Verified Badge უკვე მინიჭებულია და მეილიც გაგზავნილია.",
    };
  }

  if (!target.email || !target.grantedAt) {
    refreshBadgeSurfaces(username);
    return {
      ok: true as const,
      email: "missing_address" as const,
      message: "Verified Badge მინიჭებულია, თუმცა მომხმარებელს ელფოსტა არ აქვს.",
    };
  }

  const sent = await sendVerifiedBadgeGiftEmail({
    userId,
    to: target.email,
    name: target.name,
    username,
    locale: normalizeUserLocale(target.locale),
    idempotencyKey: `verified-badge-gift:${userId}:${target.grantedAt.toISOString()}`,
  });

  if (sent.ok) {
    await db
      .update(users)
      .set({ verifiedBadgeEmailSentAt: new Date() })
      .where(
        and(
          eq(users.id, userId),
          eq(users.verifiedBadgeGrantedAt, target.grantedAt),
          isNull(users.verifiedBadgeEmailSentAt),
        ),
      );
  }

  refreshBadgeSurfaces(username);
  return sent.ok
    ? {
        ok: true as const,
        email: "sent" as const,
        message: "Verified Badge მინიჭებულია და სასაჩუქრე მეილი გაიგზავნა.",
      }
    : {
        ok: true as const,
        email: "failed" as const,
        message: "Badge მინიჭებულია, მაგრამ მეილი ვერ გაიგზავნა — სცადე ხელახლა.",
      };
}

export async function revokeVerifiedBadge(userId: string) {
  await requireAdmin();
  if (!validUserId(userId)) {
    return { ok: false as const, error: "არასწორი მომხმარებელი." };
  }

  const [target] = await db
    .update(users)
    .set({
      verifiedBadgeGrantedAt: null,
      verifiedBadgeGrantedBy: null,
      verifiedBadgeEmailSentAt: null,
    })
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  if (!target) {
    return { ok: false as const, error: "მომხმარებელი ვერ მოიძებნა." };
  }

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  refreshBadgeSurfaces(profile?.username ?? null);
  return { ok: true as const, message: "ხელით მინიჭებული Verified Badge მოიხსნა." };
}
