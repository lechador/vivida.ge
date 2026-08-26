import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";

import { ensureChartFor } from "@/actions/chart";
import { db } from "@/db";
import {
  notifications,
  partners,
  relationshipCheckinAnswers,
  relationshipSubscriptions,
  relationshipWeeklyUpdates,
  users,
  type NotificationPayload,
  type Partner,
  type RelationshipWeeklyJson,
} from "@/db/schema";
import { isUnlocked } from "@/lib/credits";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { queueNotificationPush } from "@/lib/notification-push";
import { isBlockedEitherWay } from "@/lib/block";
import type { PartnerListItem } from "@/lib/partners-core";
import {
  computeRelationshipWeekly,
  relationshipWeekStart,
} from "@/lib/relationship-weekly";

const INVITE_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;
const ANSWER_MAX = 500;

function inviteHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isRelationshipParticipant(partner: Partner, userId: string): boolean {
  return partner.userId === userId || partner.linkedUserId === userId;
}

export async function getRelationshipPartnerForViewer(
  partnerId: string,
  userId: string,
): Promise<Partner | null> {
  const [row] = await db
    .select()
    .from(partners)
    .where(and(
      eq(partners.id, partnerId),
      or(eq(partners.userId, userId), eq(partners.linkedUserId, userId)),
      isNull(partners.deletedAt),
    ))
    .limit(1);
  if (!row) return null;
  if (
    row.linkedUserId &&
    await isBlockedEitherWay(row.userId, row.linkedUserId)
  ) {
    return null;
  }
  return row;
}

export type RelationshipListItem = PartnerListItem & Pick<Partner, "linkedUserId" | "inviteAcceptedAt"> & {
  displayName: string;
  viewerRole: "owner" | "linked";
  connected: boolean;
};

/** Website list: owned relationships plus invitations accepted by this user. */
export async function listRelationshipsForViewer(userId: string): Promise<RelationshipListItem[]> {
  const rows = await db
    .select({
      id: partners.id,
      userId: partners.userId,
      name: partners.name,
      dateOfBirth: partners.dateOfBirth,
      timeOfBirth: partners.timeOfBirth,
      latitude: partners.latitude,
      longitude: partners.longitude,
      cityName: partners.cityName,
      timezone: partners.timezone,
      chart: partners.chart,
      inputHash: partners.inputHash,
      aiViewerHash: partners.aiViewerHash,
      aiModel: partners.aiModel,
      aiGeneratedAt: partners.aiGeneratedAt,
      deepViewerHash: partners.deepViewerHash,
      deepModel: partners.deepModel,
      deepGeneratedAt: partners.deepGeneratedAt,
      linkedUserId: partners.linkedUserId,
      inviteAcceptedAt: partners.inviteAcceptedAt,
      deletedAt: partners.deletedAt,
      createdAt: partners.createdAt,
    })
    .from(partners)
    .where(and(
      or(eq(partners.userId, userId), eq(partners.linkedUserId, userId)),
      isNull(partners.deletedAt),
    ))
    .orderBy(desc(partners.createdAt));

  const ownerIds = [...new Set(rows.filter((row) => row.userId !== userId).map((row) => row.userId))];
  const ownerRows = ownerIds.length
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, ownerIds))
    : [];
  const ownerNames = new Map(ownerRows.map((owner) => [owner.id, owner.name]));

  return rows.map((row) => ({
    ...row,
    displayName: row.userId === userId
      ? row.name
      : ownerNames.get(row.userId)?.split(" ")[0] || row.name,
    viewerRole: row.userId === userId ? "owner" : "linked",
    connected: Boolean(row.linkedUserId),
  }));
}

export async function getRelationshipParticipantNames(partner: Partner): Promise<{
  ownerName: string;
  linkedName: string | null;
}> {
  const ids = partner.linkedUserId ? [partner.userId, partner.linkedUserId] : [partner.userId];
  const rows = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, ids));
  const names = new Map(rows.map((row) => [row.id, row.name?.split(" ")[0] || "Vivida"]));
  return {
    ownerName: names.get(partner.userId) ?? "Vivida",
    linkedName: partner.linkedUserId ? names.get(partner.linkedUserId) ?? "Vivida" : null,
  };
}

export async function isRelationshipUnlocked(partner: Partner): Promise<boolean> {
  return isUnlocked(partner.userId, partner.id, "spend_synastry");
}

export async function ensureRelationshipWeeklyUpdate(
  partner: Partner,
  locale: UserLocale,
  now = new Date(),
): Promise<RelationshipWeeklyJson | null> {
  const ownerChart = await ensureChartFor(partner.userId, { aiUpgrade: "skip" });
  if (!ownerChart) return null;
  const weekStart = relationshipWeekStart(now, partner.timezone);
  const [cached] = await db
    .select({
      content: relationshipWeeklyUpdates.content,
      ownerChartHash: relationshipWeeklyUpdates.ownerChartHash,
      partnerChartHash: relationshipWeeklyUpdates.partnerChartHash,
    })
    .from(relationshipWeeklyUpdates)
    .where(and(
      eq(relationshipWeeklyUpdates.partnerId, partner.id),
      eq(relationshipWeeklyUpdates.weekStart, weekStart),
      eq(relationshipWeeklyUpdates.language, locale),
    ))
    .limit(1);
  if (cached?.ownerChartHash === ownerChart.inputHash && cached.partnerChartHash === partner.inputHash) {
    return cached.content;
  }

  const content = computeRelationshipWeekly(ownerChart.data, partner.chart, now, partner.timezone, locale);
  await db
    .insert(relationshipWeeklyUpdates)
    .values({
      partnerId: partner.id,
      weekStart,
      language: locale,
      ownerChartHash: ownerChart.inputHash,
      partnerChartHash: partner.inputHash,
      content,
    })
    .onConflictDoUpdate({
      target: [
        relationshipWeeklyUpdates.partnerId,
        relationshipWeeklyUpdates.weekStart,
        relationshipWeeklyUpdates.language,
      ],
      set: {
        ownerChartHash: ownerChart.inputHash,
        partnerChartHash: partner.inputHash,
        content,
        updatedAt: new Date(),
      },
    });
  return content;
}

export type RelationshipInvitePreview = {
  partnerId: string;
  partnerName: string;
  ownerName: string;
  expiresAt: string;
};

export async function createRelationshipInviteCore(
  ownerUserId: string,
  partnerId: string,
): Promise<{ ok: true; path: string; expiresAt: string } | { ok: false; error: string }> {
  const [partner] = await db
    .select()
    .from(partners)
    .where(and(eq(partners.id, partnerId), eq(partners.userId, ownerUserId), isNull(partners.deletedAt)))
    .limit(1);
  if (!partner) return { ok: false, error: "ურთიერთობა ვერ მოიძებნა" };
  if (partner.linkedUserId) return { ok: false, error: "პარტნიორი უკვე დაკავშირებულია" };
  if (!(await isRelationshipUnlocked(partner))) {
    return { ok: false, error: "მოწვევამდე გახსენი თავსებადობის შედეგი" };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_LIFETIME_MS);
  await db.update(partners).set({
    inviteTokenHash: inviteHash(token),
    inviteExpiresAt: expiresAt,
  }).where(eq(partners.id, partner.id));
  return {
    ok: true,
    path: `/relationship/invite/${token}`,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function getRelationshipInvitePreview(token: string): Promise<RelationshipInvitePreview | null> {
  if (token.length < 32 || token.length > 128) return null;
  const [row] = await db
    .select({
      partnerId: partners.id,
      partnerName: partners.name,
      expiresAt: partners.inviteExpiresAt,
      ownerName: users.name,
    })
    .from(partners)
    .innerJoin(users, eq(users.id, partners.userId))
    .where(and(
      eq(partners.inviteTokenHash, inviteHash(token)),
      gte(partners.inviteExpiresAt, new Date()),
      isNull(partners.linkedUserId),
      isNull(partners.deletedAt),
    ))
    .limit(1);
  if (!row?.expiresAt) return null;
  return {
    partnerId: row.partnerId,
    partnerName: row.partnerName,
    ownerName: row.ownerName?.split(" ")[0] || "Vivida",
    expiresAt: row.expiresAt.toISOString(),
  };
}

async function emitRelationshipNotification(
  userId: string,
  kind: "relationship_connected" | "relationship_weekly" | "relationship_transit",
  payload: NotificationPayload,
  options: { push?: boolean } = {},
): Promise<void> {
  await db.insert(notifications).values({ userId, kind, payload });
  invalidateHeaderForUser(userId);
  if (options.push !== false) queueNotificationPush(userId, kind, payload);
}

export async function acceptRelationshipInviteCore(
  userId: string,
  token: string,
): Promise<{ ok: true; partnerId: string } | { ok: false; error: string }> {
  if (token.length < 32 || token.length > 128) return { ok: false, error: "მოწვევა არასწორია" };
  const hash = inviteHash(token);
  const [candidate] = await db.select().from(partners).where(and(
    eq(partners.inviteTokenHash, hash),
    gte(partners.inviteExpiresAt, new Date()),
    isNull(partners.linkedUserId),
    isNull(partners.deletedAt),
  )).limit(1);
  if (!candidate) return { ok: false, error: "მოწვევა ვადაგასულია ან უკვე გამოყენებულია" };
  if (candidate.userId === userId) return { ok: false, error: "საკუთარ მოწვევას ვერ მიიღებ" };
  if (await isBlockedEitherWay(candidate.userId, userId)) {
    return { ok: false, error: "მოწვევის მიღება შეუძლებელია" };
  }
  if (!(await isRelationshipUnlocked(candidate))) {
    return { ok: false, error: "ურთიერთობის შედეგი ჯერ არ არის გახსნილი" };
  }

  const [accepted] = await db.update(partners).set({
    linkedUserId: userId,
    inviteAcceptedAt: new Date(),
    inviteTokenHash: null,
    inviteExpiresAt: null,
  }).where(and(
    eq(partners.id, candidate.id),
    eq(partners.inviteTokenHash, hash),
    isNull(partners.linkedUserId),
  )).returning();
  if (!accepted) return { ok: false, error: "მოწვევა უკვე გამოყენებულია" };

  const [member] = await db.select({ name: users.name, image: users.image }).from(users).where(eq(users.id, userId)).limit(1);
  const payload: NotificationPayload = {
    fromUserId: userId,
    fromName: member?.name ?? null,
    fromImage: member?.image ?? null,
    partnerId: accepted.id,
    partnerName: accepted.name,
  };
  await emitRelationshipNotification(accepted.userId, "relationship_connected", payload);
  return { ok: true, partnerId: accepted.id };
}

export type RelationshipSubscription = { weeklyEnabled: boolean; transitEnabled: boolean };

export async function getRelationshipSubscription(
  partnerId: string,
  userId: string,
): Promise<RelationshipSubscription> {
  const [row] = await db.select({
    weeklyEnabled: relationshipSubscriptions.weeklyEnabled,
    transitEnabled: relationshipSubscriptions.transitEnabled,
  }).from(relationshipSubscriptions).where(and(
    eq(relationshipSubscriptions.partnerId, partnerId),
    eq(relationshipSubscriptions.userId, userId),
  )).limit(1);
  return row ?? { weeklyEnabled: false, transitEnabled: false };
}

export async function setRelationshipSubscriptionCore(
  partnerId: string,
  userId: string,
  values: RelationshipSubscription,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const partner = await getRelationshipPartnerForViewer(partnerId, userId);
  if (!partner) return { ok: false, error: "ურთიერთობა ვერ მოიძებნა" };
  if (!(await isRelationshipUnlocked(partner))) return { ok: false, error: "თავსებადობა ჯერ არ არის გახსნილი" };
  await db.insert(relationshipSubscriptions).values({
    partnerId,
    userId,
    weeklyEnabled: values.weeklyEnabled,
    transitEnabled: values.transitEnabled,
  }).onConflictDoUpdate({
    target: [relationshipSubscriptions.partnerId, relationshipSubscriptions.userId],
    set: { ...values, updatedAt: new Date() },
  });
  return { ok: true };
}

export type RelationshipAnswerView = {
  questionKey: string;
  userId: string;
  answer: string;
  name: string;
};

export async function listRelationshipAnswers(
  partnerId: string,
  userId: string,
  weekStart: string,
): Promise<RelationshipAnswerView[]> {
  const partner = await getRelationshipPartnerForViewer(partnerId, userId);
  if (!partner) return [];
  const rows = await db.select({
    questionKey: relationshipCheckinAnswers.questionKey,
    userId: relationshipCheckinAnswers.userId,
    answer: relationshipCheckinAnswers.answer,
    name: users.name,
  }).from(relationshipCheckinAnswers)
    .innerJoin(users, eq(users.id, relationshipCheckinAnswers.userId))
    .where(and(
      eq(relationshipCheckinAnswers.partnerId, partnerId),
      eq(relationshipCheckinAnswers.weekStart, weekStart),
    ));
  return rows.map((row) => ({ ...row, name: row.name?.split(" ")[0] || "Vivida" }));
}

export async function saveRelationshipAnswerCore(
  partnerId: string,
  userId: string,
  weekStart: string,
  questionKey: string,
  rawAnswer: string,
  locale: UserLocale,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const answer = rawAnswer.trim();
  if (!answer || answer.length > ANSWER_MAX) {
    return { ok: false, error: `პასუხი უნდა შეიცავდეს 1-${ANSWER_MAX} სიმბოლოს` };
  }
  const partner = await getRelationshipPartnerForViewer(partnerId, userId);
  if (!partner) return { ok: false, error: "ურთიერთობა ვერ მოიძებნა" };
  if (!(await isRelationshipUnlocked(partner))) return { ok: false, error: "თავსებადობა ჯერ არ არის გახსნილი" };
  const weekly = await ensureRelationshipWeeklyUpdate(partner, locale);
  if (!weekly || weekly.weekStart !== weekStart || !weekly.questions.some((question) => question.key === questionKey)) {
    return { ok: false, error: "ეს კითხვა აღარ არის აქტიური" };
  }
  await db.insert(relationshipCheckinAnswers).values({
    partnerId,
    weekStart,
    questionKey,
    userId,
    answer,
  }).onConflictDoUpdate({
    target: [
      relationshipCheckinAnswers.partnerId,
      relationshipCheckinAnswers.weekStart,
      relationshipCheckinAnswers.questionKey,
      relationshipCheckinAnswers.userId,
    ],
    set: { answer, updatedAt: new Date() },
  });
  return { ok: true };
}

export { emitRelationshipNotification };
