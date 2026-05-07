import { auth } from "@/auth";
import {
  countUnreadMessages,
  listConversations,
} from "@/lib/messages";
import { ChatShellClient } from "./chat-shell-client";

/**
 * Server-side shell that decides whether to render the chat at all.
 * Mounted from the root layout — returns null for anonymous visitors so
 * the launcher button doesn't appear on the landing page.
 */
export async function ChatShell() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [conversations, unreadTotal] = await Promise.all([
    listConversations(userId),
    countUnreadMessages(userId),
  ]);

  // Strip down to the shape the client component needs (avoid sending the
  // entire user record across the boundary)
  const initial = conversations.map((c) => ({
    partner: {
      id: c.partner.id,
      name: c.partner.name,
      image: c.partner.image,
      username: c.partner.username,
      displayName: c.partner.displayName,
    },
    lastMessage: c.lastMessage
      ? {
          body: c.lastMessage.body,
          createdAt: c.lastMessage.createdAt,
          senderId: c.lastMessage.senderId,
        }
      : null,
    unreadCount: c.unreadCount,
  }));

  return (
    <ChatShellClient
      viewerId={userId}
      initialConversations={initial}
      initialUnreadTotal={unreadTotal}
    />
  );
}
