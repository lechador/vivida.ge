import "server-only";

import { eq, lt, or } from "drizzle-orm";

import { db } from "@/db";
import {
  charts,
  notifications,
  profiles,
  reminderDeliveries,
  reminderSettings,
  users,
} from "@/db/schema";
import { sendPersonalReminderEmail } from "@/lib/email";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { sendPushToUser } from "@/lib/push";
import { deliverRelationshipUpdates } from "@/lib/relationship-notifications";
import { localScheduleParts } from "@/lib/reminder-config";
import {
  claimReminderDelivery,
  finishReminderDelivery,
  trackedReminderPath,
} from "@/lib/reminder-delivery";
import { computeTiming } from "@/lib/timing";

type ReminderCopy = { title: string; body: string; path: string };

async function insertBell(userId: string, kind: "timing_reminder" | "forecast_reminder", copy: ReminderCopy): Promise<void> {
  await db.insert(notifications).values({
    userId,
    kind,
    payload: { reminderTitle: copy.title, reminderBody: copy.body, reminderUrl: copy.path },
  });
  invalidateHeaderForUser(userId);
}

async function deliverChannels(input: {
  userId: string;
  email: string | null;
  emailAllowed: boolean;
  name: string | null;
  locale: UserLocale;
  topic: "timing" | "forecast";
  deliveryKey: string;
  push: boolean;
  emailEnabled: boolean;
  copy: ReminderCopy;
}): Promise<{ push: number; email: number }> {
  const kind = input.topic === "timing" ? "timing_reminder" : "forecast_reminder";
  const inAppId = await claimReminderDelivery({ userId: input.userId, topic: input.topic, channel: "in_app", deliveryKey: input.deliveryKey, destination: input.copy.path });
  if (inAppId) {
    try {
      await insertBell(input.userId, kind, { ...input.copy, path: trackedReminderPath(inAppId) });
      await finishReminderDelivery(inAppId, true);
    } catch (error) {
      await finishReminderDelivery(inAppId, false);
      console.warn("[reminders] in-app delivery failed:", error);
    }
  }
  let push = 0;
  let email = 0;
  const pushId = input.push
    ? await claimReminderDelivery({ userId: input.userId, topic: input.topic, channel: "push", deliveryKey: input.deliveryKey, destination: input.copy.path })
    : null;
  if (pushId) {
    push = await sendPushToUser(input.userId, {
      title: input.copy.title,
      body: input.copy.body,
      url: trackedReminderPath(pushId),
      tag: `personal-${input.topic}`,
    });
    await finishReminderDelivery(pushId, push > 0);
  }
  const emailId = input.emailEnabled && input.emailAllowed && input.email
    ? await claimReminderDelivery({ userId: input.userId, topic: input.topic, channel: "email", deliveryKey: input.deliveryKey, destination: input.copy.path })
    : null;
  if (emailId && input.email) {
    email = await sendPersonalReminderEmail({
      userId: input.userId,
      to: input.email,
      name: input.name,
      title: input.copy.title,
      body: input.copy.body,
      path: trackedReminderPath(emailId),
      locale: input.locale,
      idempotencyKey: `personal:${input.topic}:${input.userId}:${input.deliveryKey}`,
    }) ? 1 : 0;
    await finishReminderDelivery(emailId, email > 0);
  }
  return { push, email };
}

function timingCopy(locale: UserLocale, notable: ReturnType<typeof computeTiming>["notable"][number] | null): ReminderCopy {
  const en = locale !== "ka";
  if (notable) return {
    title: en ? "An important personal transit is approaching" : "მნიშვნელოვანი პირადი ტრანზიტი ახლოვდება",
    body: `${notable.dateLabelKa} · ${notable.title}. ${notable.meaning}`,
    path: "/timing",
  };
  return {
    title: en ? "Your timing map for the week" : "შენი კვირის დროის რუკა",
    body: en ? "See the most supportive days and the windows that call for extra care." : "ნახე ყველაზე მხარდამჭერი დღეები და ფანჯრები, რომლებიც მეტ სიფრთხილეს ითხოვს.",
    path: "/timing",
  };
}

function forecastCopy(locale: UserLocale, bestDate: string | null): ReminderCopy {
  const en = locale !== "ka";
  return {
    title: en ? "Plan your week with your chart" : "დაგეგმე კვირა შენი რუკით",
    body: bestDate
      ? (en ? `${bestDate} is the strongest planning window in your next seven days.` : `${bestDate} მომდევნო შვიდ დღეში ყველაზე ძლიერი დაგეგმვის ფანჯარაა.`)
      : (en ? "Your personal seven-day rhythm is ready to review." : "შენი პერსონალური შვიდდღიანი რიტმი მზადაა გადასახედად."),
    path: "/dashboard",
  };
}

/** Hourly dispatcher; each delivery is claimed once in the user's local schedule. */
export async function deliverPersonalReminders(now = new Date()): Promise<{
  users: number;
  timing: number;
  forecasts: number;
  push: number;
  email: number;
  relationships: Awaited<ReturnType<typeof deliverRelationshipUpdates>>;
}> {
  const rows = await db.select({
    settings: reminderSettings,
    userId: users.id,
    email: users.email,
    name: users.name,
    locale: users.interfaceLanguage,
    emailAllowed: users.emailNudges,
    timezone: profiles.timezone,
    chart: charts.data,
  }).from(reminderSettings)
    .innerJoin(users, eq(users.id, reminderSettings.userId))
    .innerJoin(profiles, eq(profiles.userId, reminderSettings.userId))
    .innerJoin(charts, eq(charts.userId, reminderSettings.userId))
    .where(or(
      eq(reminderSettings.transitPush, true),
      eq(reminderSettings.transitEmail, true),
      eq(reminderSettings.forecastPush, true),
      eq(reminderSettings.forecastEmail, true),
    ));

  let timing = 0;
  let forecasts = 0;
  let push = 0;
  let email = 0;
  for (const row of rows) {
    const timezone = row.timezone ?? "Asia/Tbilisi";
    const schedule = localScheduleParts(now, timezone);
    if (schedule.hour !== row.settings.localHour) continue;
    const locale = normalizeUserLocale(row.locale);
    const weeklyDue = schedule.weekday === row.settings.weeklyDay;

    const timingDue = (row.settings.transitCadence === "daily" || weeklyDue)
      && (row.settings.transitPush || row.settings.transitEmail);
    if (timingDue) {
      const daily = row.settings.transitCadence === "daily";
      const result = computeTiming(row.chart, now, timezone, daily ? 2 : 8, locale);
      const notable = result.notable[0] ?? null;
      // Daily cadence is event-sensitive; no generic daily spam.
      if (notable || !daily) {
        const key = daily ? schedule.date : `${schedule.date}:weekly`;
        const sent = await deliverChannels({
          userId: row.userId, email: row.email, emailAllowed: row.emailAllowed,
          name: row.name, locale, topic: "timing", deliveryKey: key,
          push: row.settings.transitPush, emailEnabled: row.settings.transitEmail,
          copy: timingCopy(locale, notable),
        });
        timing += 1;
        push += sent.push;
        email += sent.email;
      }
    }

    if (weeklyDue && (row.settings.forecastPush || row.settings.forecastEmail)) {
      const result = computeTiming(row.chart, now, timezone, 7, locale);
      const best = [...result.days].sort((a, b) => b.score - a.score)[0]?.dateIso ?? null;
      const sent = await deliverChannels({
        userId: row.userId, email: row.email, emailAllowed: row.emailAllowed,
        name: row.name, locale, topic: "forecast", deliveryKey: `${schedule.date}:weekly`,
        push: row.settings.forecastPush, emailEnabled: row.settings.forecastEmail,
        copy: forecastCopy(locale, best),
      });
      forecasts += 1;
      push += sent.push;
      email += sent.email;
    }
  }

  const relationships = await deliverRelationshipUpdates(now, { respectLocalHour: true });
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 180);
  await db.delete(reminderDeliveries).where(lt(reminderDeliveries.createdAt, cutoff));
  return { users: rows.length, timing, forecasts, push, email, relationships };
}
