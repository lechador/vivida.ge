"use client";

import { useEffect, useState } from "react";

import { ChatShellClient } from "./chat-shell-client";
import type { ChatConversation } from "./chat-launcher";

type Bootstrap = {
  viewerId: string;
  conversations: ChatConversation[];
  unreadTotal: number;
};

/**
 * Site-wide chat shell. Client-side on purpose: it fetches its bootstrap data
 * (viewer + conversations + unread) AFTER hydration instead of reading auth on
 * the server. Because it's mounted from the root layout, doing that server-side
 * would force EVERY page (including public/SEO pages) to render dynamically.
 * Resolving auth client-side lets those pages stay statically prerendered.
 * Anonymous visitors get a 204 → nothing renders (same as before).
 */
export function ChatShell() {
  const [data, setData] = useState<Bootstrap | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/chat/bootstrap", { headers: { accept: "application/json" } })
      .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
      .then((d: Bootstrap | null) => {
        if (alive && d?.viewerId) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;
  return (
    <ChatShellClient
      viewerId={data.viewerId}
      initialConversations={data.conversations}
      initialUnreadTotal={data.unreadTotal}
    />
  );
}
