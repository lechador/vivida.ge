"use client";

import { usePathname } from "next/navigation";

import { ChatLauncher, type ChatConversation } from "./chat-launcher";

/**
 * Decides which "shape" of the chat client to render. On `/messages` the
 * page itself renders the full inline experience, so we mount nothing
 * here (avoids two SSE connections + duplicate event dispatches).
 * Everywhere else we mount the chat in "background" mode — no UI, just
 * the SSE pump so the bottom-bar messages badge + bell stay live.
 *
 * The legacy floating launcher button has been retired; the new bottom
 * tab bar is the canonical entry point on mobile, and desktop reaches
 * /messages via the same nav.
 */
export function ChatShellClient({
  viewerId,
  initialConversations,
  initialUnreadTotal,
}: {
  viewerId: string;
  initialConversations: ChatConversation[];
  initialUnreadTotal: number;
}) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/messages")) return null;
  return (
    <ChatLauncher
      viewerId={viewerId}
      initialConversations={initialConversations}
      initialUnreadTotal={initialUnreadTotal}
      mode="background"
    />
  );
}
