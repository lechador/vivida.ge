import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { countUnreadMessages, listConversations } from "@/lib/messages";

/**
 * GET /api/chat/bootstrap, the data the background chat shell needs:
 * viewer id, conversation list, and total unread. Moved off the root layout
 * (where it was fetched server-side and forced EVERY page to render
 * dynamically) so the chat can hydrate client-side and the public/SEO pages
 * can stay statically prerendered. Returns 204 for anonymous visitors.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse(null, { status: 204 });

  const [conversations, unreadTotal] = await Promise.all([
    listConversations(userId),
    countUnreadMessages(userId),
  ]);

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

  return NextResponse.json({ viewerId: userId, conversations: initial, unreadTotal });
}
