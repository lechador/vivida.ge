import "server-only";

import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import {
  partners,
  profiles,
  reminderSettings,
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
import { localScheduleParts } from "@/lib/reminder-config";
import { sendPersonalReminderEmail } from "@/lib/email";

async function claimDelivery(partnerId: string, userId: string, deliveryKey: string): Promise<boolean> {
  const [claimed] = await db.insert(relationshipNotificationDeliveries).values({
    partnerId,
    userId,
    deliveryKey,
  }).onConflictDoNothing().returning({ id: relationshipNotificationDeliveries.id });
  return Boolean(claimed);
}

/** Daily, idempotent dispatcher for opt-in recurring relationship events. */
export async function deliverRelationshipUpdates(
  now = new Date(),
  options: { respectLocalHour?: boolean } = {},
): Promise<{
  subscriptions: number;
  weeklySent: number;
  transitsSent: number;
  skipped: number;
}> {
  const rows = await db.select({
    subscription: relationshipSubscriptions,
    partner: partners,
    locale: users.interfaceLanguage,
    email: users.email,
    name: users.name,
    emailAllowed: users.emailNudges,
    reminder: reminderSettings,
    profileTimezone: profiles.timezone,
  }).from(relationshipSubscriptions)
    .innerJoin(partners, eq(partners.id, relationshipSubscriptions.partnerId))
    .innerJoin(users, eq(users.id, relationshipSubscriptions.userId))
    .leftJoin(reminderSettings, eq(reminderSettings.userId, relationshipSubscriptions.userId))
    .leftJoin(profiles, eq(profiles.userId, relationshipSubscriptions.userId))
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
    const pushEnabled = row.reminder?.relationshipPush ?? true;
    const emailEnabled = Boolean(row.reminder?.relationshipEmail && row.emailAllowed && row.email);
    if (!pushEnabled && !emailEnabled) {
      skipped += 1;
      continue;
    }
    if (options.respectLocalHour) {
      const timezone = row.profileTimezone ?? partner.timezone;
      const local = localScheduleParts(now, timezone);
      if (local.hour !== (row.reminder?.localHour ?? 9)) continue;
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
        const payload = {
          ...payloadBase,
          relationshipHeadline: weekly.headline,
        };
        await emitRelationshipNotification(subscription.userId, "relationship_weekly", payload, { push: pushEnabled });
        if (emailEnabled && row.email) {
          await sendPersonalReminderEmail({
            userId: subscription.userId,
            to: row.email,
            name: row.name,
            title: locale === "ka" ? "ურთიერთობის ახალი კვირა" : "Your weekly relationship update",
            body: weekly.headline,
            path: `/synastry/${partner.id}`,
            locale,
            idempotencyKey: `relationship:weekly:${subscription.userId}:${partner.id}:${weekly.weekStart}:${locale}`,
          });
        }
        weeklySent += 1;
      }
    }

    if (subscription.transitEnabled) {
      const today = localDateString(now, partner.timezone);
      for (const notable of weekly.notable.filter((item) => item.dateIso === today)) {
        const key = `transit:${notable.key}:${locale}`;
        if (!(await claimDelivery(partner.id, subscription.userId, key))) continue;
        const payload = {
          ...payloadBase,
          transitTitle: notable.title,
        };
        await emitRelationshipNotification(subscription.userId, "relationship_transit", payload, { push: pushEnabled });
        if (emailEnabled && row.email) {
          await sendPersonalReminderEmail({
            userId: subscription.userId,
            to: row.email,
            name: row.name,
            title: locale === "ka" ? "ურთიერთობის მნიშვნელოვანი ტრანზიტი" : "Important relationship transit",
            body: `${notable.title}. ${notable.meaning}`,
            path: `/synastry/${partner.id}`,
            locale,
            idempotencyKey: `relationship:transit:${subscription.userId}:${partner.id}:${notable.key}:${locale}`,
          });
        }
        transitsSent += 1;
      }
    }
  }
  return { subscriptions: rows.length, weeklySent, transitsSent, skipped };
}
