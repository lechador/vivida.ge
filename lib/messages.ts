import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNull,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  messages,
  profiles,
  typingIndicators,
  users,
  type Message,
} from "@/db/schema";
import { listFriends, type FriendshipUser } from "./friendship";

export type ConversationSummary = {
  partner: FriendshipUser;
  lastMessage: Message | null;
  unreadCount: number;
  /** When the last message was sent — fallback to friendship.since for sort. */
  lastActivityAt: Date;
};

/**
 * One row per friend, ordered with the most-recent activity first. Friends
 * the user has never messaged appear at the bottom, ordered by friendship
 * recency.
 */
export async function listConversations(
  userId: string
): Promise<ConversationSummary[]> {
  const friends = await listFriends(userId);
  if (friends.length === 0) return [];

  // Pull all messages between this user and any other party. Ordered
  // newest-first so the first row we hit per partner is "the last message".
  const rows = await db
    .select()
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(2000);

  const byPartner = new Map<
    string,
    { last: Message; unread: number }
  >();
  for (const m of rows) {
    const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
    if (!byPartner.has(partnerId)) {
      byPartner.set(partnerId, { last: m, unread: 0 });
    }
    if (m.recipientId === userId && !m.readAt) {
      byPartner.get(partnerId)!.unread += 1;
    }
  }

  const summaries: ConversationSummary[] = friends.map((f) => {
    const data = byPartner.get(f.id);
    return {
      partner: f,
      lastMessage: data?.last ?? null,
      unreadCount: data?.unread ?? 0,
      lastActivityAt: data?.last?.createdAt ?? f.since,
    };
  });

  // Friends with messages first (by recency), then friends with no chat yet
  return summaries.sort((a, b) => {
    const aHas = a.lastMessage ? 1 : 0;
    const bHas = b.lastMessage ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;
    return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
  });
}

/**
 * Messages between viewer and a specific partner, oldest-first (display order).
 * Only friends are addressable — we verify the relationship at the action layer.
 */
export async function listMessages(
  viewerId: string,
  partnerId: string,
  options: { limit?: number; since?: Date } = {}
): Promise<Message[]> {
  const limit = options.limit ?? 100;
  const baseWhere = or(
    and(
      eq(messages.senderId, viewerId),
      eq(messages.recipientId, partnerId)
    ),
    and(
      eq(messages.senderId, partnerId),
      eq(messages.recipientId, viewerId)
    )
  );
  const where = options.since
    ? and(baseWhere, gt(messages.createdAt, options.since))
    : baseWhere;

  return db
    .select()
    .from(messages)
    .where(where)
    .orderBy(asc(messages.createdAt))
    .limit(limit);
}

export type InboundStreamMessage = Message & {
  senderName: string | null;
  senderImage: string | null;
  senderUsername: string | null;
  senderDisplayName: string | null;
};

/**
 * Inbound messages for the viewer with createdAt > since, oldest-first.
 * Joined with sender profile info so the SSE stream can deliver everything
 * the bell + chat panel need without a follow-up fetch.
 */
export async function pollInboundMessages(
  viewerId: string,
  since: Date
): Promise<InboundStreamMessage[]> {
  const rows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      body: messages.body,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      senderName: users.name,
      senderImage: users.image,
      senderUsername: profiles.username,
      senderDisplayName: profiles.displayName,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .leftJoin(profiles, eq(profiles.userId, messages.senderId))
    .where(
      and(
        eq(messages.recipientId, viewerId),
        gt(messages.createdAt, since)
      )
    )
    .orderBy(asc(messages.createdAt))
    .limit(50);
  return rows;
}

/**
 * Active typing indicators targeting the viewer (recipientId = viewer,
 * expiresAt > now). Used by the SSE poll to push 'typing' events.
 */
export async function pollTypingIndicators(
  viewerId: string
): Promise<{ senderId: string; expiresAt: Date }[]> {
  return db
    .select({
      senderId: typingIndicators.senderId,
      expiresAt: typingIndicators.expiresAt,
    })
    .from(typingIndicators)
    .where(
      and(
        eq(typingIndicators.recipientId, viewerId),
        gt(typingIndicators.expiresAt, new Date())
      )
    );
}

/**
 * For each partner the viewer has sent messages to, the latest readAt
 * timestamp among the viewer's sent messages, restricted to read events
 * that happened after `since`. Used to push 'read' SSE events so the
 * sender's UI can mark their bubbles as read.
 */
export async function pollReadReceipts(
  viewerId: string,
  since: Date
): Promise<{ partnerId: string; readAt: Date }[]> {
  const rows = await db
    .select({
      partnerId: messages.recipientId,
      readAt: sql<Date>`MAX(${messages.readAt})`.as("read_at_max"),
    })
    .from(messages)
    .where(
      and(
        eq(messages.senderId, viewerId),
        gt(messages.readAt, since)
      )
    )
    .groupBy(messages.recipientId);
  return rows
    .filter((r) => r.readAt !== null)
    .map((r) => ({ partnerId: r.partnerId, readAt: new Date(r.readAt) }));
}

/**
 * Upsert a typing row with a fresh TTL. Friendship enforcement happens
 * in the calling action. `ne(...)` guard prevents self-typing rows.
 */
export async function recordTyping(
  senderId: string,
  recipientId: string,
  ttlMs = 5000
): Promise<void> {
  if (senderId === recipientId) return;
  const expiresAt = new Date(Date.now() + ttlMs);
  await db
    .insert(typingIndicators)
    .values({ senderId, recipientId, expiresAt })
    .onConflictDoUpdate({
      target: [typingIndicators.senderId, typingIndicators.recipientId],
      set: { expiresAt },
    });
}

/**
 * Best-effort cleanup of expired typing rows. Called occasionally from
 * the typing-ping endpoint so the table doesn't accumulate ghosts.
 */
export async function purgeExpiredTyping(): Promise<void> {
  await db
    .delete(typingIndicators)
    .where(sql`${typingIndicators.expiresAt} < now()`);
}

/** Count of all unread messages received by the user. Bell-badge worthy. */
export async function countUnreadMessages(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(messages)
    .where(
      and(
        eq(messages.recipientId, userId),
        isNull(messages.readAt)
      )
    );
  return Number(row?.value ?? 0);
}

/** Public profile snippet keyed by userId — used to render compose targets. */
export async function partnerSnippet(userId: string) {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}
