import "server-only";

import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import {
  partners,
  relationshipNotificationDeliveries,
  relationshipSubscriptions,
  users,
  type Partner,
} from "@/db/schema";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import {
  emitRelationshipNotification,
  ensureRelationshipWeeklyUpdate,
  isRelationshipUnlocked,
} from "@/lib/relationship-core";
import { localDateString } from "@/lib/transits";

async function claimDelivery(partnerId: string, userId: string, deliveryKey: string): Promise<boolean> {
  const [claimed] = await db.insert(relationshipNotificationDeliveries).values({
    partnerId,
    userId,
    deliveryKey,
  }).onConflictDoNothing().returning({ id: relationshipNotificationDeliveries.id });
  return Boolean(claimed);
}

/** Daily, idempotent dispatcher for opt-in recurring relationship events. */
export async function deliverRelationshipUpdates(now = new Date()): Promise<{
  subscriptions: number;
  weeklySent: number;
  transitsSent: number;
  skipped: number;
}> {
  const rows = await db.select({
    subscription: relationshipSubscriptions,
    partner: partners,
    locale: users.interfaceLanguage,
  }).from(relationshipSubscriptions)
    .innerJoin(partners, eq(partners.id, relationshipSubscriptions.partnerId))
    .innerJoin(users, eq(users.id, relationshipSubscriptions.userId))
    .where(and(
      or(
        eq(relationshipSubscriptions.weeklyEnabled, true),
        eq(relationshipSubscriptions.transitEnabled, true),
      ),
      isNull(partners.deletedAt),
    ));

  let weeklySent = 0;
  let transitsSent = 0;
  let skipped = 0;
  for (const row of rows) {
    const { partner, subscription } = row;
    if (subscription.userId !== partner.userId && subscription.userId !== partner.linkedUserId) {
      skipped += 1;
      continue;
    }
    if (!(await isRelationshipUnlocked(partner as Partner))) {
      skipped += 1;
      continue;
    }
    const locale = normalizeUserLocale(row.locale);
    const weekly = await ensureRelationshipWeeklyUpdate(partner as Partner, locale, now);
    if (!weekly) {
      skipped += 1;
      continue;
    }
    const payloadBase = { partnerId: partner.id, partnerName: partner.name };

    if (subscription.weeklyEnabled) {
      const key = `weekly:${weekly.weekStart}:${locale}`;
      if (await claimDelivery(partner.id, subscription.userId, key)) {
        await emitRelationshipNotification(subscription.userId, "relationship_weekly", {
          ...payloadBase,
          relationshipHeadline: weekly.headline,
        });
        weeklySent += 1;
      }
    }

    if (subscription.transitEnabled) {
      const today = localDateString(now, partner.timezone);
      for (const notable of weekly.notable.filter((item) => item.dateIso === today)) {
        const key = `transit:${notable.key}:${locale}`;
        if (!(await claimDelivery(partner.id, subscription.userId, key))) continue;
        await emitRelationshipNotification(subscription.userId, "relationship_transit", {
          ...payloadBase,
          transitTitle: notable.title,
        });
        transitsSent += 1;
      }
    }
  }
  return { subscriptions: rows.length, weeklySent, transitsSent, skipped };
}
