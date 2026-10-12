"use client";

import { useEffect, useState } from "react";

import type {
  ChatClearedDetail,
  ChatNotifyDetail,
} from "@/components/chat/chat-launcher";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Tiny live counter for the bottom-bar messages tab. Seeded from the
 * server-side unread total, then kept in sync via the same custom events
 * the bell dropdown listens for:
 *
 *   - vivida:chat-message → +1 (only fires when not actively viewing)
 *   - vivida:chat-cleared → -clearedCount when a conversation is opened
 *
 * The badge component never queries the DB itself, the SSE pump (modal
 * launcher in background mode, or the /messages page) is the source of
 * truth for "what's new".
 */
export function MessagesTabBadge({
  initial,
  locale = "ka",
}: {
  initial: number;
  locale?: UserLocale;
}) {
  const [badge, setBadge] = useState({ initial, count: initial });

  if (badge.initial !== initial) {
    setBadge({ initial, count: initial });
  }

  const count = badge.count;

  useEffect(() => {
    const onMsg = (e: Event) => {
      const detail = (e as CustomEvent<ChatNotifyDetail>).detail;
      if (!detail?.id) return;
      setBadge((current) => ({
        ...current,
        count: current.count + 1,
      }));
    };
    const onCleared = (e: Event) => {
      const detail = (e as CustomEvent<ChatClearedDetail>).detail;
      if (!detail) return;
      const drop = Math.max(0, detail.clearedCount ?? 0);
      if (drop === 0) return;
      setBadge((current) => ({
        ...current,
        count: Math.max(0, current.count - drop),
      }));
    };
    window.addEventListener("vivida:chat-message", onMsg);
    window.addEventListener("vivida:chat-cleared", onCleared);
    return () => {
      window.removeEventListener("vivida:chat-message", onMsg);
      window.removeEventListener("vivida:chat-cleared", onCleared);
    };
  }, []);

  if (count <= 0) return null;
  return (
    <span
      aria-label={
        locale !== "ka"
          ? `${count} new ${count === 1 ? "message" : "messages"}`
          : `${count} ახალი წერილი`
      }
      className="absolute -right-0.5 -top-0.5 grid size-4 min-w-4 place-items-center rounded-full bg-[var(--vivida-pink)] px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-background"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
