import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { askConversations, chartChatMessages } from "@/db/schema";
import type { AskConversation } from "@/db/schema";
import {
  conversationTitle,
  needsConversationTitle,
} from "@/lib/ask-conversations-pure";

/**
 * Conversations ("topics") for "chat with your chart".
 *
 * Every message belongs to one conversation; the rolling memory portrait stays
 * per user, so switching topics keeps the astrologer's background knowledge
 * while dropping the other thread's history from the prompt.
 */

export const CONVERSATION_LIST_LIMIT = 30;
/** A single thread renders at most this many turns in the UI. */
export const CONVERSATION_MESSAGE_LIMIT = 200;

export type ConversationSummary = {
  id: string;
  title: string;
  /** True when the memory portrait should not raise earlier topics. */
  isolatedMemory: boolean;
  updatedAt: Date;
};

export async function listAskConversations(
  userId: string,
  limit = CONVERSATION_LIST_LIMIT,
): Promise<ConversationSummary[]> {
  const rows = await db
    .select({
      id: askConversations.id,
      title: askConversations.title,
      isolatedMemory: askConversations.isolatedMemory,
      updatedAt: askConversations.updatedAt,
    })
    .from(askConversations)
    .where(eq(askConversations.userId, userId))
    .orderBy(desc(askConversations.updatedAt))
    .limit(limit);
  // A conversation with no first question yet still needs a readable label.
  return rows.map((row) => ({
    ...row,
    title: needsConversationTitle(row.title) ? "" : row.title,
  }));
}

export async function getAskConversation(
  userId: string,
  conversationId: string,
): Promise<AskConversation | null> {
  const [row] = await db
    .select()
    .from(askConversations)
    .where(
      and(
        eq(askConversations.id, conversationId),
        eq(askConversations.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** A brand-new topic: isolated memory, empty title until the first question. */
export async function createAskConversation(
  userId: string,
): Promise<AskConversation> {
  const [row] = await db
    .insert(askConversations)
    .values({ userId, title: "", isolatedMemory: true })
    .returning();
  if (!row) throw new Error("conversation was not created");
  return row;
}

export type ConversationTurn = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

/** Oldest→newest turns of one conversation, owned by the caller. */
export async function getConversationMessages(
  userId: string,
  conversationId: string,
  limit = CONVERSATION_MESSAGE_LIMIT,
): Promise<ConversationTurn[]> {
  const rows = await db
    .select({
      id: chartChatMessages.id,
      role: chartChatMessages.role,
      content: chartChatMessages.content,
      createdAt: chartChatMessages.createdAt,
    })
    .from(chartChatMessages)
    .where(
      and(
        eq(chartChatMessages.userId, userId),
        eq(chartChatMessages.conversationId, conversationId),
      ),
    )
    .orderBy(desc(chartChatMessages.createdAt))
    .limit(limit);
  return rows.reverse();
}

/** Title (first turn) + activity bump so the switcher stays ordered. */
export async function touchAskConversation(
  conversationId: string,
  firstQuestion?: string,
): Promise<void> {
  await db
    .update(askConversations)
    .set({
      updatedAt: new Date(),
      ...(firstQuestion
        ? {
            title: sql`CASE WHEN ${askConversations.title} = '' THEN ${conversationTitle(
              firstQuestion,
            )} ELSE ${askConversations.title} END`,
          }
        : {}),
    })
    .where(eq(askConversations.id, conversationId));
}

export type ResolvedConversation = {
  conversation: AskConversation;
  created: boolean;
};

/**
 * Resolve the conversation for an incoming turn: the caller's own id when it
 * is valid, otherwise a fresh topic (legacy clients that send no id).
 */
export async function resolveConversation(
  userId: string,
  conversationId?: string | null,
): Promise<ResolvedConversation | null> {
  if (conversationId) {
    const existing = await getAskConversation(userId, conversationId);
    return existing ? { conversation: existing, created: false } : null;
  }
  // No id from the client (older cached bundle): continue the most recent
  // topic, or open one so the turn has somewhere to live.
  const [latest] = await db
    .select()
    .from(askConversations)
    .where(eq(askConversations.userId, userId))
    .orderBy(desc(askConversations.updatedAt))
    .limit(1);
  if (latest) return { conversation: latest, created: false };
  return { conversation: await createAskConversation(userId), created: true };
}
