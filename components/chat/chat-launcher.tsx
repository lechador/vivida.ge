"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  markConversationRead,
  pingTyping,
  sendMessage,
} from "@/actions/messages";
import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { SafetyMenu } from "@/components/safety/safety-menu";
import type { Message } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { kaShortDate } from "@/lib/i18n/ka-date";

type TypingEventPayload = {
  senders: Array<{ senderId: string; expiresAt: string }>;
};
type ReadEventPayload = { partnerId: string; readAt: string };

type StreamPayload = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  sender?: {
    name: string | null;
    image: string | null;
    username: string | null;
    displayName: string | null;
  };
};

/**
 * Window CustomEvent contracts used to talk to the bell-icon dropdown
 * without coupling the components.
 */
export type ChatNotifyDetail = {
  id: string;
  partnerId: string;
  body: string;
  createdAt: string;
  sender: {
    name: string | null;
    image: string | null;
    username: string | null;
    displayName: string | null;
  };
};
export type ChatClearedDetail = {
  partnerId: string;
  /** How many unread messages were cleared, so badge listeners
   *  can subtract the right amount. */
  clearedCount: number;
};

export type ChatPartner = {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
  displayName: string | null;
};

export type ChatConversation = {
  partner: ChatPartner;
  lastMessage: { body: string; createdAt: Date; senderId: string } | null;
  unreadCount: number;
};

type Props = {
  viewerId: string;
  initialConversations: ChatConversation[];
  initialUnreadTotal: number;
  /**
   * "modal"      — legacy floating chat button + animated panel (desktop)
   * "page"       — render inline as a full-page chat experience (/messages)
   * "background" — no UI; only run the SSE pump and dispatch badge events
   *                so the bottom-bar messages tab + bell stay live.
   */
  mode?: "modal" | "page" | "background";
  /** When mounted in "page" mode, optionally auto-open this partner's chat. */
  initialPartnerId?: string | null;
  locale?: UserLocale;
};

type SendResult = { ok: true } | { ok: false; error: string };

type ThreadStatus = "loading" | "ready" | "error";

export function ChatLauncher({
  viewerId,
  initialConversations,
  initialUnreadTotal,
  mode = "modal",
  initialPartnerId = null,
  locale = "ka",
}: Props) {
  const en = locale !== "ka";
  // In "page" mode the panel is always considered open — the route is
  // the panel. In other modes it's a togglable surface.
  const [open, setOpen] = useState(mode === "page");
  const [activePartnerId, setActivePartnerId] = useState<string | null>(
    initialPartnerId
  );
  const [conversations, setConversations] = useState(initialConversations);
  const [unreadTotal, setUnreadTotal] = useState(initialUnreadTotal);
  const [messagesByPartner, setMessagesByPartner] = useState<
    Record<string, Message[]>
  >({});
  // Map of partnerId → expiry epoch ms; non-empty means "is typing".
  const [typingByPartner, setTypingByPartner] = useState<
    Record<string, number>
  >({});
  // Per-thread load outcome — a failed /api/messages fetch must render a
  // retry row, not the indefinite spinner that `messages === null` gives.
  const [threadStatus, setThreadStatus] = useState<
    Record<string, ThreadStatus>
  >({});

  // Refs read by the SSE callback so they always see fresh values.
  const openRef = useRef(open);
  const activePartnerRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const loadedRef = useRef<Set<string>>(new Set());
  const conversationsRef = useRef(conversations);
  const typingTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    activePartnerRef.current = activePartnerId;
  }, [activePartnerId]);

  const applyIncoming = useCallback(
    (raw: StreamPayload) => {
      if (seenIdsRef.current.has(raw.id)) return;
      seenIdsRef.current.add(raw.id);

      const msg: Message = {
        id: raw.id,
        senderId: raw.senderId,
        recipientId: raw.recipientId,
        body: raw.body,
        createdAt: new Date(raw.createdAt),
        readAt: raw.readAt ? new Date(raw.readAt) : null,
      };
      const partnerId =
        msg.senderId === viewerId ? msg.recipientId : msg.senderId;
      const isInbound = msg.recipientId === viewerId;
      const isActivelyViewing =
        isInbound &&
        openRef.current &&
        activePartnerRef.current === msg.senderId;

      setMessagesByPartner((prev) => {
        // Seed the array when the thread hasn't loaded yet: the id is already
        // in seenIdsRef, so dropping it here would lose the message for good
        // (the stream's 30s lookback can never redeliver it). handleSelect's
        // merge dedupes by id and re-sorts, so a seeded array is safe.
        const list = prev[partnerId] ?? [];
        if (list.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [partnerId]: [...list, msg] };
      });

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.partner.id === partnerId);
        if (idx === -1) return prev;
        const target = prev[idx];
        const unreadDelta = isInbound && !isActivelyViewing ? 1 : 0;
        const updated: ChatConversation = {
          ...target,
          lastMessage: {
            body: msg.body,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
          unreadCount: target.unreadCount + unreadDelta,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });

      if (isInbound && !isActivelyViewing) {
        setUnreadTotal((t) => t + 1);
        const detail: ChatNotifyDetail = {
          id: msg.id,
          partnerId: msg.senderId,
          body: msg.body,
          createdAt: raw.createdAt,
          sender: raw.sender ?? {
            name: null,
            image: null,
            username: null,
            displayName: null,
          },
        };
        window.dispatchEvent(
          new CustomEvent<ChatNotifyDetail>("vivida:chat-message", {
            detail,
          })
        );
      }

      if (isActivelyViewing) {
        markConversationRead(msg.senderId).catch(() => {});
      }
    },
    [viewerId]
  );

  const applyTyping = useCallback((payload: TypingEventPayload) => {
    if (!payload?.senders) return;
    for (const s of payload.senders) {
      const expiresMs = new Date(s.expiresAt).getTime();
      if (!Number.isFinite(expiresMs)) continue;
      setTypingByPartner((prev) => {
        if (prev[s.senderId] && prev[s.senderId] >= expiresMs) return prev;
        return { ...prev, [s.senderId]: expiresMs };
      });
      const existing = typingTimersRef.current[s.senderId];
      if (existing) clearTimeout(existing);
      typingTimersRef.current[s.senderId] = setTimeout(() => {
        setTypingByPartner((prev) => {
          if (!prev[s.senderId]) return prev;
          if (prev[s.senderId] > Date.now()) return prev;
          const next = { ...prev };
          delete next[s.senderId];
          return next;
        });
        delete typingTimersRef.current[s.senderId];
      }, Math.max(0, expiresMs - Date.now()) + 50);
    }
  }, []);

  const applyRead = useCallback((payload: ReadEventPayload) => {
    if (!payload?.partnerId || !payload?.readAt) return;
    const readAtDate = new Date(payload.readAt);
    if (Number.isNaN(readAtDate.getTime())) return;
    setMessagesByPartner((prev) => {
      const list = prev[payload.partnerId];
      if (!list) return prev;
      let changed = false;
      const updated = list.map((m) => {
        if (m.senderId !== viewerId) return m;
        if (m.createdAt.getTime() > readAtDate.getTime()) return m;
        if (m.readAt && m.readAt.getTime() >= readAtDate.getTime()) return m;
        changed = true;
        return { ...m, readAt: readAtDate };
      });
      return changed ? { ...prev, [payload.partnerId]: updated } : prev;
    });
  }, [viewerId]);

  // Long-lived SSE — server auto-recycles every ~23s, EventSource auto-reconnects.
  // Visibility gating: when the tab is hidden we close the connection and the
  // server-side polling stops. New messages still arrive as soon as the user
  // returns (we reconnect with a 30s lookback). For users with many tabs this
  // collapses constant Neon traffic to "only when actively looking."
  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    const onMessage = (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data) as StreamPayload;
        if (payload && typeof payload.id === "string") applyIncoming(payload);
      } catch {}
    };
    const onTyping = (ev: MessageEvent) => {
      try {
        applyTyping(JSON.parse(ev.data) as TypingEventPayload);
      } catch {}
    };
    const onRead = (ev: MessageEvent) => {
      try {
        applyRead(JSON.parse(ev.data) as ReadEventPayload);
      } catch {}
    };

    const connect = () => {
      if (cancelled || es) return;
      es = new EventSource("/api/messages/stream");
      es.addEventListener("message", onMessage);
      es.addEventListener("typing", onTyping);
      es.addEventListener("read", onRead);
      // Native EventSource handles the 23s server-recycle reconnect for us.
      // We only intervene on tab visibility changes below.
    };

    const disconnect = () => {
      es?.close();
      es = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        disconnect();
      } else {
        connect();
      }
    };

    if (document.visibilityState !== "hidden") connect();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      disconnect();
      // Clear pending typing timers so they don't fire after unmount
      for (const t of Object.values(typingTimersRef.current)) clearTimeout(t);
      typingTimersRef.current = {};
    };
  }, [applyIncoming, applyTyping, applyRead]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePartnerId) setActivePartnerId(null);
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activePartnerId]);

  const activePartner = useMemo(
    () =>
      conversations.find((c) => c.partner.id === activePartnerId)?.partner ??
      null,
    [conversations, activePartnerId]
  );

  const handleSelect = useCallback(
    async (partnerId: string) => {
      setActivePartnerId(partnerId);
      activePartnerRef.current = partnerId;

      // Read-then-write so we can fire side effects (state on other islands,
      // window events) outside the updater. The updater itself must be pure —
      // dispatching a CustomEvent inside it triggers cross-component setState
      // during render, which React errors on. Using the ref keeps handleSelect
      // stable (empty deps) without going stale.
      const target = conversationsRef.current.find(
        (c) => c.partner.id === partnerId
      );
      const wasUnread = target?.unreadCount ?? 0;
      setConversations((cs) =>
        cs.map((c) =>
          c.partner.id === partnerId ? { ...c, unreadCount: 0 } : c
        )
      );
      if (wasUnread > 0) {
        setUnreadTotal((t) => Math.max(0, t - wasUnread));
        window.dispatchEvent(
          new CustomEvent<ChatClearedDetail>("vivida:chat-cleared", {
            detail: { partnerId, clearedCount: wasUnread },
          })
        );
      }

      try {
        await markConversationRead(partnerId);
      } catch {}

      if (loadedRef.current.has(partnerId)) return;
      loadedRef.current.add(partnerId);
      setThreadStatus((prev) => ({ ...prev, [partnerId]: "loading" }));
      try {
        const res = await fetch(
          `/api/messages?with=${encodeURIComponent(partnerId)}`
        );
        if (!res.ok) {
          loadedRef.current.delete(partnerId);
          setThreadStatus((prev) => ({ ...prev, [partnerId]: "error" }));
          return;
        }
        const data = (await res.json()) as { messages: Message[] };
        const msgs = data.messages.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          readAt: m.readAt ? new Date(m.readAt) : null,
        }));
        for (const m of msgs) seenIdsRef.current.add(m.id);
        setMessagesByPartner((prev) => {
          const existing = prev[partnerId] ?? [];
          // Merge in any optimistic / streamed messages added during fetch
          const byId = new Map<string, Message>();
          for (const m of msgs) byId.set(m.id, m);
          for (const m of existing) if (!byId.has(m.id)) byId.set(m.id, m);
          const merged = Array.from(byId.values()).sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
          return { ...prev, [partnerId]: merged };
        });
        setThreadStatus((prev) => ({ ...prev, [partnerId]: "ready" }));
      } catch {
        loadedRef.current.delete(partnerId);
        setThreadStatus((prev) => ({ ...prev, [partnerId]: "error" }));
      }
    },
    []
  );

  // External "open this chat" trigger (fired from the bell dropdown when a
  // message notification is clicked).
  useEffect(() => {
    const onOpenChat = (e: Event) => {
      const detail = (e as CustomEvent<{ partnerId: string }>).detail;
      if (!detail?.partnerId) return;
      setOpen(true);
      void handleSelect(detail.partnerId);
    };
    window.addEventListener("vivida:open-chat", onOpenChat);
    return () => window.removeEventListener("vivida:open-chat", onOpenChat);
  }, [handleSelect]);

  // Page-mode auto-open when a `?with=<partnerId>` query is supplied.
  // Mount-once effect — handleSelect is stable (empty deps).
  useEffect(() => {
    if (!initialPartnerId) return;
    const timeout = window.setTimeout(() => {
      void handleSelect(initialPartnerId);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [handleSelect, initialPartnerId]);

  const handleSend = useCallback(
    async (partnerId: string, text: string): Promise<SendResult> => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Message = {
        id: tempId,
        senderId: viewerId,
        recipientId: partnerId,
        body: text,
        readAt: null,
        createdAt: new Date(),
      };

      setMessagesByPartner((prev) => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] ?? []), optimistic],
      }));
      setConversations((cs) => {
        const idx = cs.findIndex((c) => c.partner.id === partnerId);
        if (idx === -1) return cs;
        const target = cs[idx];
        const updated: ChatConversation = {
          ...target,
          lastMessage: {
            body: text,
            createdAt: optimistic.createdAt,
            senderId: viewerId,
          },
        };
        return [updated, ...cs.filter((_, i) => i !== idx)];
      });

      const result = await sendMessage(partnerId, text);
      if (!result.ok) {
        setMessagesByPartner((prev) => ({
          ...prev,
          [partnerId]: (prev[partnerId] ?? []).filter((m) => m.id !== tempId),
        }));
        return { ok: false, error: result.error };
      }
      const real: Message = {
        ...result.message,
        createdAt: new Date(result.message.createdAt),
        readAt: result.message.readAt
          ? new Date(result.message.readAt)
          : null,
      };
      seenIdsRef.current.add(real.id);
      setMessagesByPartner((prev) => ({
        ...prev,
        [partnerId]: (prev[partnerId] ?? []).map((m) =>
          m.id === tempId ? real : m
        ),
      }));
      setConversations((cs) =>
        cs.map((c) =>
          c.partner.id === partnerId
            ? {
                ...c,
                lastMessage: {
                  body: real.body,
                  createdAt: real.createdAt,
                  senderId: real.senderId,
                },
              }
            : c
        )
      );
      return { ok: true };
    },
    [viewerId]
  );

  // Background mode: SSE pump + event dispatch only, no UI. Used on every
  // authed page so the bottom-bar messages badge stays live without
  // mounting the full chat surface twice.
  if (mode === "background") return null;

  // Page mode: full-bleed on mobile (no card frame, no rounded edges,
  // chat fills the whole viewport between the header and the bottom
  // tab bar), card-styled on desktop. The parent <section> on /messages
  // already constrains height + width — we just go flex-1 here.
  if (mode === "page") {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          "sm:rounded-2xl sm:border sm:border-border sm:bg-card/65 sm:ring-1 sm:ring-foreground/5 sm:backdrop-blur-xl"
        )}
      >
        {activePartner ? (
          <ChatView
            viewerId={viewerId}
            partner={activePartner}
            messages={messagesByPartner[activePartner.id] ?? null}
            status={threadStatus[activePartner.id]}
            isTyping={!!typingByPartner[activePartner.id]}
            onBack={() => setActivePartnerId(null)}
            onRetry={() => void handleSelect(activePartner.id)}
            onSend={(text) => handleSend(activePartner.id, text)}
            onTyping={() => {
              void pingTyping(activePartner.id).catch(() => {});
            }}
            locale={locale}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            viewerId={viewerId}
            onSelect={handleSelect}
            onClose={null}
            locale={locale}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Floating launcher button */}
      <motion.button
        type="button"
        aria-label={en ? "Chat" : "ჩატი"}
        data-chat-launcher
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-4 right-4 z-40 grid size-14 place-items-center rounded-full text-white shadow-[0_12px_40px_-8px_oklch(0.65_0.24_305/0.65)] ring-1 ring-foreground/20 sm:bottom-5 sm:right-5",
          "bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]",
          "transition-shadow hover:shadow-[0_18px_50px_-8px_oklch(0.65_0.24_305/0.85)]"
        )}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <MessageCircle className="size-5" />
        )}
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 min-w-5 place-items-center rounded-full bg-[var(--vivida-pink)] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 bottom-2 top-20 z-40 flex flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_30px_80px_-20px_oklch(0.13_0.03_280/0.7)] ring-1 ring-foreground/10 backdrop-blur-xl sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[calc(100dvh-7rem)] sm:max-h-[640px] sm:w-[min(380px,calc(100vw-2.5rem))]"
          >
            {activePartner ? (
              <ChatView
                viewerId={viewerId}
                partner={activePartner}
                messages={messagesByPartner[activePartner.id] ?? null}
                status={threadStatus[activePartner.id]}
                isTyping={!!typingByPartner[activePartner.id]}
                onBack={() => setActivePartnerId(null)}
                onRetry={() => void handleSelect(activePartner.id)}
                onSend={(text) => handleSend(activePartner.id, text)}
                onTyping={() => {
                  void pingTyping(activePartner.id).catch(() => {});
                }}
                locale={locale}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                viewerId={viewerId}
                onSelect={handleSelect}
                onClose={() => setOpen(false)}
                locale={locale}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ConversationList({
  conversations,
  viewerId,
  onSelect,
  onClose,
  locale,
}: {
  conversations: ChatConversation[];
  viewerId: string;
  onSelect: (partnerId: string) => void;
  /** null when rendered as a full page — the close affordance is hidden. */
  onClose: (() => void) | null;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <>
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight">{en ? "Chat" : "ჩატი"}</h2>
        {onClose && (
          <button
            type="button"
            aria-label={en ? "Close" : "დახურვა"}
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </header>
      {conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageCircle className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {en ? "You have no friends yet. Add someone to start chatting." : "ჯერ მეგობრები არ გყავს — დაამატე და დაიწყე ჩატი"}
          </p>
          {/* Point at the deck when it's enabled; otherwise send users to
              their friends page (always available) so the CTA never dead-ends. */}
          <Link
            href={SOCIAL_FEATURES.swipeDeck ? "/discover" : "/friends"}
            onClick={onClose ?? undefined}
            className="text-xs text-[var(--vivida-cyan)] hover:underline"
          >
            {SOCIAL_FEATURES.swipeDeck
              ? en ? "See who resonates with you →" : "ნახე ვინ რეზონირებს შენთან →"
              : en ? "View friend requests →" : "ნახე მეგობრების მოთხოვნები →"}
          </Link>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto p-1">
          {conversations.map((c) => (
            <ConversationRow
              key={c.partner.id}
              conv={c}
              viewerId={viewerId}
              onSelect={() => onSelect(c.partner.id)}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function ConversationRow({
  conv,
  viewerId,
  onSelect,
  locale,
}: {
  conv: ChatConversation;
  viewerId: string;
  onSelect: () => void;
  locale: UserLocale;
}) {
  const display =
    conv.partner.displayName ??
    conv.partner.name?.split(" ")[0] ??
    conv.partner.username ??
    "user";
  const preview = conv.lastMessage
    ? `${conv.lastMessage.senderId === viewerId ? (locale !== "ka" ? "You: " : "შენ: ") : ""}${conv.lastMessage.body}`
    : locale !== "ka" ? "No messages yet" : "ჩატი ჯერ არ დაგიწყიათ";
  const isUnread = conv.unreadCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
          isUnread ? "bg-[var(--vivida-violet)]/8" : "hover:bg-accent/10"
        )}
      >
        <Image
          src={conv.partner.image || DEFAULT_AVATAR}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full border border-border/60 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                isUnread
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground"
              )}
            >
              {display}
            </span>
            {conv.lastMessage && (
              <span className="shrink-0 text-[10px] text-muted-foreground/80">
                {timeAgo(conv.lastMessage.createdAt, locale)}
              </span>
            )}
          </div>
          <div
            className={cn(
              "mt-0.5 truncate text-xs",
              isUnread ? "text-foreground/85" : "text-muted-foreground"
            )}
          >
            {preview}
          </div>
        </div>
        {isUnread && (
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--vivida-pink)]"
          />
        )}
      </button>
    </li>
  );
}

function ChatView({
  viewerId,
  partner,
  messages,
  status,
  isTyping,
  onBack,
  onRetry,
  onSend,
  onTyping,
  locale,
}: {
  viewerId: string;
  partner: ChatPartner;
  /** null while initial load is in flight, [] when loaded but empty. */
  messages: Message[] | null;
  /** undefined until the first load starts. */
  status: ThreadStatus | undefined;
  isTyping: boolean;
  onBack: () => void;
  onRetry: () => void;
  onSend: (text: string) => Promise<SendResult>;
  onTyping: () => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLenRef = useRef(0);
  const lastTypingPingRef = useRef(0);

  const display =
    partner.displayName ??
    partner.name?.split(" ")[0] ??
    partner.username ??
    "user";

  // Auto-scroll on new messages or typing-bubble appearance.
  useEffect(() => {
    const len = messages?.length ?? 0;
    if (len === 0 && !isTyping) return;
    const el = scrollRef.current;
    if (!el) return;
    const isFirst = lastLenRef.current === 0 && len > 0;
    lastLenRef.current = len;
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: isFirst ? "auto" : "smooth",
      });
    });
  }, [messages?.length, isTyping]);

  const handleDraftChange = (val: string) => {
    setDraft(val);
    // Debounce typing pings — at most once every 3s to keep the TTL fresh
    // without hammering the DB on every keystroke.
    const now = Date.now();
    if (val.trim().length > 0 && now - lastTypingPingRef.current > 3000) {
      lastTypingPingRef.current = now;
      onTyping();
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || isSending) return;
    setError(null);
    setDraft("");
    lastTypingPingRef.current = 0; // allow next typing to ping immediately
    setIsSending(true);
    const result = await onSend(text);
    setIsSending(false);
    if (!result.ok) {
      setError(result.error);
      setDraft(text);
    }
  };

  const items = useMemo(() => messages ?? [], [messages]);

  // Index of the latest message viewer sent that the partner has read —
  // used to render a single read pip under it.
  const lastReadIndex = useMemo(() => {
    for (let i = items.length - 1; i >= 0; i--) {
      const m = items[i];
      if (m.senderId === viewerId && m.readAt) return i;
    }
    return -1;
  }, [items, viewerId]);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border/60 px-3 py-3">
        <button
          type="button"
          aria-label={en ? "Back" : "უკან"}
          onClick={onBack}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <Image
          src={partner.image || DEFAULT_AVATAR}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full border border-border/60 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{display}</div>
          {partner.username && (
            <Link
              href={`/u/${partner.username}`}
              className="truncate text-[10px] text-muted-foreground hover:text-foreground"
            >
              @{partner.username}
            </Link>
          )}
        </div>
        <SafetyMenu targetUserId={partner.id} targetType="message_thread" locale={locale} />
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
      >
        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-xs text-muted-foreground">
              {en
                ? "Could not load this conversation."
                : "საუბარი ვერ ჩაიტვირთა."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-card"
            >
              {en ? "Try again" : "სცადე ხელახლა"}
            </button>
          </div>
        ) : messages === null || status === "loading" ? (
          <div className="flex h-full items-center justify-center">
            <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[var(--vivida-cyan)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessageCircle className="size-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              {en ? "Start the conversation by sending the first message." : "დაიწყე საუბარი — გამოგზავნე პირველი წერილი"}
            </p>
          </div>
        ) : (
          <>
            {items.map((m, i) => {
              const mine = m.senderId === viewerId;
              const prev = items[i - 1];
              const showAvatar =
                !mine && (!prev || prev.senderId !== m.senderId);
              const showReadPip = mine && i === lastReadIndex;
              return (
                <div key={m.id}>
                  <div
                    className={cn(
                      "flex items-end gap-2",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    {!mine &&
                      (showAvatar ? (
                        <Image
                          src={partner.image || DEFAULT_AVATAR}
                          alt=""
                          width={24}
                          height={24}
                          className="mb-0.5 size-6 shrink-0 rounded-full border border-border/60 object-cover"
                        />
                      ) : (
                        <span aria-hidden className="size-6 shrink-0" />
                      ))}
                    <div
                      className={cn(
                        "max-w-[78%] whitespace-pre-wrap rounded-2xl px-3 py-1.5 text-sm leading-snug",
                        mine
                          ? "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] text-white"
                          : "bg-card text-foreground/90 ring-1 ring-foreground/5"
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                  {showReadPip && (
                    <div className="mt-0.5 flex justify-end">
                      <span
                        title={en ? "Read" : "წაიკითხა"}
                        className="inline-flex items-center"
                      >
                        <Image
                          src={partner.image || DEFAULT_AVATAR}
                          alt=""
                          width={14}
                          height={14}
                          className="size-3.5 rounded-full ring-1 ring-background"
                        />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {isTyping && <TypingBubble partner={partner} />}
          </>
        )}
      </div>

      <footer className="border-t border-border/60 p-2.5">
        {error && (
          <p className="mb-2 px-1 text-xs text-destructive">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={en ? "Write a message…" : "დაწერე…"}
            rows={1}
            disabled={isSending}
            className="max-h-32 min-h-9 flex-1 resize-none rounded-xl border border-border bg-input/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-transparent focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={send}
            disabled={isSending || draft.trim().length === 0}
            aria-label={en ? "Send" : "გაგზავნა"}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-[0_8px_24px_-8px_oklch(0.65_0.24_305/0.6)] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="size-4" />
          </button>
        </div>
      </footer>
    </>
  );
}

function TypingBubble({ partner }: { partner: ChatPartner }) {
  return (
    <div className="flex items-end gap-2 justify-start">
      <Image
        src={partner.image || DEFAULT_AVATAR}
        alt=""
        width={24}
        height={24}
        className="mb-0.5 size-6 shrink-0 rounded-full border border-border/60 object-cover"
      />
      <div className="rounded-2xl bg-card px-3 py-2 ring-1 ring-foreground/5">
        <div className="flex items-end gap-1">
          <span
            className="inline-block size-1.5 rounded-full bg-muted-foreground/70"
            style={{
              animation: "vivida-typing-bounce 1.2s infinite",
              animationDelay: "0ms",
            }}
          />
          <span
            className="inline-block size-1.5 rounded-full bg-muted-foreground/70"
            style={{
              animation: "vivida-typing-bounce 1.2s infinite",
              animationDelay: "180ms",
            }}
          />
          <span
            className="inline-block size-1.5 rounded-full bg-muted-foreground/70"
            style={{
              animation: "vivida-typing-bounce 1.2s infinite",
              animationDelay: "360ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function timeAgo(date: Date | string, locale: UserLocale): string {
  const en = locale !== "ka";
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return en ? "now" : "ახლა";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return en ? `${minutes}m` : `${minutes}წთ`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours}h` : `${hours}სთ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return en ? `${days}d` : `${days}დ`;
  return en
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(d)
    : kaShortDate(d);
}
