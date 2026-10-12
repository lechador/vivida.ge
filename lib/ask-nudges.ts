import "server-only";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { notifications, reminderDeliveries } from "@/db/schema";
import type { AskUserMemoryTraits } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { sendPushToUser } from "@/lib/push";
import {
  claimReminderDelivery,
  finishReminderDelivery,
} from "@/lib/reminder-delivery";
import {
  ASK_NUDGE_DAY_CAP,
  ASK_NUDGE_MIN_TURNS,
  ASK_NUDGE_SCAN_LIMIT,
  capsOk,
  nudgeCopy,
  nudgeDeliveryKey,
  nudgeDue,
} from "@/lib/ask-nudges-pure";

/**
 * Proactive ask nudges, the AI astrologer follows up on remembered open
 * loops ("როგორ მიდის გასაუბრების ამბავი?").
 *
 * Cost discipline (hard requirements):
 * - Zero AI per send: copy is deterministic templates. AI is spent only
 *   when the user opens the app, through the normal credit-gated chat.
 * - Never to strangers: ≥3 own chat turns required (plus a memory row,
 *   which only exists after chatting).
 * - Neon-friendly: one daily cron, two indexed SELECTs total, then only
 *   writes for actual sends (global ≤200/day). An empty day costs ~2 queries.
 */

const TOPIC = "ask_nudge";
const DESTINATION = "/ask";

type CandidateRow = {
  user_id: string;
  traits: AskUserMemoryTraits;
  memory_updated_at: string | Date;
  first_name: string | null;
  interface_language: string | null;
  turns: string | number;
  last_turn_at: string | Date;
};

type Candidate = {
  userId: string;
  loop: string;
  locale: "ka" | "en";
  firstName: string | null;
  memoryUpdatedAt: Date;
  lastTurnAt: Date;
};

function toDate(v: string | Date): Date {
  return v instanceof Date ? v : new Date(v);
}

/** Single-scan candidate pull: quiet memories with real chat history. */
async function findCandidates(now: Date): Promise<Candidate[]> {
  const res = await db.execute(sql`
    SELECT m.user_id,
           m.traits,
           m.updated_at AS memory_updated_at,
           u.name AS first_name,
           u.interface_language,
           COUNT(*) FILTER (WHERE c.role = 'user') AS turns,
           MAX(c.created_at) AS last_turn_at
      FROM ask_user_memory m
      JOIN chart_chat_message c ON c.user_id = m.user_id
      LEFT JOIN "user" u ON u.id = m.user_id
     WHERE m.nudges_enabled
       AND m.updated_at BETWEEN ${now} - INTERVAL '10 days' AND ${now} - INTERVAL '3 days'
       AND jsonb_typeof(m.traits -> 'openLoops') = 'array'
       AND jsonb_array_length(m.traits -> 'openLoops') > 0
     GROUP BY m.user_id, m.traits, m.updated_at, u.name, u.interface_language
    HAVING COUNT(*) FILTER (WHERE c.role = 'user') >= ${ASK_NUDGE_MIN_TURNS}
       AND MAX(c.created_at) < m.updated_at
       AND MAX(c.created_at) > ${now} - INTERVAL '21 days'
     LIMIT ${ASK_NUDGE_SCAN_LIMIT}
  `);
  const rows = (res.rows ?? []) as CandidateRow[];
  const out: Candidate[] = [];
  for (const r of rows) {
    const traits = (r.traits ?? {}) as AskUserMemoryTraits;
    const loop = traits.openLoops?.[0]?.trim();
    if (!loop) continue;
    out.push({
      userId: r.user_id,
      loop,
      locale: normalizeUserLocale(r.interface_language) === "en" ? "en" : "ka",
      firstName: r.first_name?.split(" ")[0] ?? null,
      memoryUpdatedAt: toDate(r.memory_updated_at),
      lastTurnAt: toDate(r.last_turn_at),
    });
  }
  return out;
}

export type NudgeStats = {
  candidates: number;
  sent: number;
  skippedCaps: number;
  skippedPending: number;
  skippedSeen: number;
  pushSent: number;
};

export async function deliverAskNudges(
  now: Date = new Date(),
): Promise<NudgeStats> {
  const stats: NudgeStats = {
    candidates: 0,
    sent: 0,
    skippedCaps: 0,
    skippedPending: 0,
    skippedSeen: 0,
    pushSent: 0,
  };
  const candidates = await findCandidates(now);
  stats.candidates = candidates.length;
  if (candidates.length === 0) return stats;

  const ids = [...new Set(candidates.map((c) => c.userId))];
  const past = await db
    .select({
      userId: reminderDeliveries.userId,
      deliveryKey: reminderDeliveries.deliveryKey,
      status: reminderDeliveries.status,
      createdAt: reminderDeliveries.createdAt,
      openedAt: reminderDeliveries.valueCompletedAt,
    })
    .from(reminderDeliveries)
    .where(
      and(
        eq(reminderDeliveries.topic, TOPIC),
        inArray(reminderDeliveries.userId, ids),
      ),
    );
  const byUser = new Map<string, typeof past>();
  for (const d of past) {
    const arr = byUser.get(d.userId) ?? [];
    arr.push(d);
    byUser.set(d.userId, arr);
  }

  for (const c of candidates) {
    if (stats.sent >= ASK_NUDGE_DAY_CAP) break;
    try {
      const key = nudgeDeliveryKey(c.userId, c.loop);
      const history = byUser.get(c.userId) ?? [];
      // Same thread is never nudged twice.
      if (history.some((d) => d.deliveryKey === key)) {
        stats.skippedSeen += 1;
        continue;
      }
      // Max one unopened nudge, never stack.
      if (history.some((d) => d.status === "sent" && !d.openedAt)) {
        stats.skippedPending += 1;
        continue;
      }
      const sentAts = history
        .filter((d) => d.status === "sent" && d.createdAt)
        .map((d) => d.createdAt as Date);
      if (
        !nudgeDue(c.memoryUpdatedAt, c.lastTurnAt, now) ||
        !capsOk(sentAts, now)
      ) {
        stats.skippedCaps += 1;
        continue;
      }

      const copy = nudgeCopy(c.loop, c.locale, c.firstName);
      const inAppId = await claimReminderDelivery({
        userId: c.userId,
        topic: TOPIC,
        channel: "in_app",
        deliveryKey: key,
        destination: DESTINATION,
      });
      if (inAppId) {
        try {
          await db.insert(notifications).values({
            userId: c.userId,
            kind: "ask_nudge",
            payload: {
              reminderTitle: copy.title,
              reminderBody: copy.body,
              reminderUrl: DESTINATION,
            },
          });
          invalidateHeaderForUser(c.userId);
          await finishReminderDelivery(inAppId, true);
        } catch (error) {
          await finishReminderDelivery(inAppId, false);
          console.warn("[ask-nudges] bell failed:", (error as Error).message);
          continue;
        }
      }
      const pushId = await claimReminderDelivery({
        userId: c.userId,
        topic: TOPIC,
        channel: "push",
        deliveryKey: key,
        destination: DESTINATION,
      });
      if (pushId) {
        const n = await sendPushToUser(c.userId, {
          title: copy.title,
          body: copy.body,
          url: DESTINATION,
          tag: "ask-nudge",
        });
        await finishReminderDelivery(pushId, n > 0);
        stats.pushSent += n > 0 ? 1 : 0;
      }
      stats.sent += 1;
    } catch (error) {
      console.warn("[ask-nudges] candidate failed:", (error as Error).message);
    }
  }
  return stats;
}

/** Unopened nudges, drives the ask tab badge. */
export async function countPendingAskNudges(userId: string): Promise<number> {
  const rows = await db
    .select({ id: reminderDeliveries.id })
    .from(reminderDeliveries)
    .where(
      and(
        eq(reminderDeliveries.topic, TOPIC),
        eq(reminderDeliveries.userId, userId),
        eq(reminderDeliveries.status, "sent"),
        isNull(reminderDeliveries.valueCompletedAt),
      ),
    )
    .limit(10);
  return rows.length;
}

/** Visiting /ask clears the badge. Single UPDATE, no-op when nothing pending. */
export async function markAskNudgesOpened(userId: string): Promise<void> {
  await db
    .update(reminderDeliveries)
    .set({ valueCompletedAt: new Date() })
    .where(
      and(
        eq(reminderDeliveries.topic, TOPIC),
        eq(reminderDeliveries.userId, userId),
        eq(reminderDeliveries.status, "sent"),
        isNull(reminderDeliveries.valueCompletedAt),
      ),
    );
}
