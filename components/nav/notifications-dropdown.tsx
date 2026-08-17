"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Bell,
  MessageCircle,
  MessageSquare,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsRead } from "@/actions/notifications";
import type { Notification } from "@/db/schema";
import { CREDIT_REASON_LABEL_EN, CREDIT_REASON_LABEL_KA, type CreditReason } from "@/lib/credits-config";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { kaShortDate } from "@/lib/i18n/ka-date";

const KIND_ICON: Record<string, LucideIcon> = {
  friend_request: UserPlus,
  friend_accepted: Sparkles,
  post_comment: MessageSquare,
  post_reaction: Sparkles,
  mention: AtSign,
  new_match: Sparkles,
  credit: Sparkles,
};

const REACTION_LABEL_KA: Record<string, string> = {
  like: "მოეწონა შენი პოსტი",
  funny: "გაეცინა შენი პოსტი",
  sad: "დაამწუხრე",
  dislike: "არ მოეწონა შენი პოსტი",
};
const REACTION_LABEL_EN: Record<string, string> = {
  like: "liked your post",
  funny: "laughed at your post",
  sad: "reacted sadly to your post",
  dislike: "disliked your post",
};

function notificationLabel(kind: string, payload: Notification["payload"], locale: UserLocale): string {
  const en = locale !== "ka";
  if (kind === "post_reaction" && payload?.reaction) {
    return (en ? REACTION_LABEL_EN : REACTION_LABEL_KA)[payload.reaction] ?? (en ? "reacted to your post" : "გამოეხმაურა შენს პოსტს");
  }
  switch (kind) {
    case "friend_request":
      return en ? "sent you a friend request" : "გამოგიგზავნა მეგობრობის თხოვნა";
    case "friend_accepted":
      return en ? "accepted your request" : "მიიღო შენი მოთხოვნა";
    case "post_comment":
      return en ? "commented on your post" : "დააკომენტარა შენი პოსტი";
    case "post_reaction":
      return en ? "reacted to your post" : "გამოეხმაურა შენს პოსტს";
    case "mention":
      return payload?.mentionContext === "comment"
        ? en ? "mentioned you in a comment" : "მოგიხსენიეს კომენტარში"
        : en ? "mentioned you in a post" : "მოგიხსენიეს პოსტში";
    case "new_match":
      return en ? "matched with you" : "დაგემთხვათ";
    default:
      return "";
  }
}

type ChatNotifyDetail = {
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
type ChatClearedDetail = { partnerId: string };

type MessageNotif = {
  id: string;
  partnerId: string;
  body: string;
  createdAt: Date;
  sender: ChatNotifyDetail["sender"];
};

function timeAgo(date: Date, locale: UserLocale): string {
  const en = locale !== "ka";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return en ? "just now" : "ახლახან";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return en ? `${minutes}m ago` : `${minutes} წუთის წინ`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours}h ago` : `${hours} საათის წინ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return en ? `${days}d ago` : `${days} დღის წინ`;
  const d = new Date(date);
  return en
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(d)
    : kaShortDate(d);
}

export function NotificationsDropdown({
  initial,
  initialUnread,
  locale = "ka",
}: {
  initial: Notification[];
  initialUnread: number;
  locale?: UserLocale;
}) {
  const router = useRouter();
  const en = locale !== "ka";
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);
  const [msgNotifs, setMsgNotifs] = useState<MessageNotif[]>([]);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Listen for incoming chat messages from the SSE stream (dispatched by
  // ChatLauncher) and clear-events when the user reads a conversation.
  useEffect(() => {
    const onMsg = (e: Event) => {
      const detail = (e as CustomEvent<ChatNotifyDetail>).detail;
      if (!detail?.id) return;
      setMsgNotifs((prev) => {
        if (prev.some((m) => m.id === detail.id)) return prev;
        const next: MessageNotif = {
          id: detail.id,
          partnerId: detail.partnerId,
          body: detail.body,
          createdAt: new Date(detail.createdAt),
          sender: detail.sender,
        };
        return [next, ...prev].slice(0, 20);
      });
    };
    const onCleared = (e: Event) => {
      const detail = (e as CustomEvent<ChatClearedDetail>).detail;
      if (!detail?.partnerId) return;
      setMsgNotifs((prev) =>
        prev.filter((m) => m.partnerId !== detail.partnerId)
      );
    };
    window.addEventListener("vivida:chat-message", onMsg);
    window.addEventListener("vivida:chat-cleared", onCleared);
    return () => {
      window.removeEventListener("vivida:chat-message", onMsg);
      window.removeEventListener("vivida:chat-cleared", onCleared);
    };
  }, []);

  const totalUnread = unread + msgNotifs.length;

  // When the bell is opened, mark only DB notifications read — message
  // notifications clear themselves when the user actually reads the chat.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date() }))
      );
      startTransition(() => {
        void markAllNotificationsRead();
      });
    }
  };

  const handleMessageClick = (partnerId: string) => {
    setOpen(false);
    setMsgNotifs((prev) => prev.filter((m) => m.partnerId !== partnerId));
    router.push(`/messages?with=${encodeURIComponent(partnerId)}`);
  };

  type DisplayItem =
    | { type: "db"; key: string; createdAt: Date; node: Notification }
    | { type: "msg"; key: string; createdAt: Date; node: MessageNotif };

  const sortedItems = useMemo<DisplayItem[]>(() => {
    const all: DisplayItem[] = [
      ...items.map((n) => ({
        type: "db" as const,
        key: `db-${n.id}`,
        createdAt: new Date(n.createdAt),
        node: n,
      })),
      ...msgNotifs.map((n) => ({
        type: "msg" as const,
        key: `msg-${n.id}`,
        createdAt: n.createdAt,
        node: n,
      })),
    ];
    return all.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [items, msgNotifs]);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={en ? "Notifications" : "შეტყობინებები"}
          className="relative grid size-12 place-items-center rounded-full border border-border bg-card/50 text-foreground/80 transition-all hover:border-foreground/20 hover:bg-card/80 hover:text-foreground"
        >
          <Bell className="size-5" />
          {totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 grid size-5 min-w-5 place-items-center rounded-full bg-[var(--vivida-pink)] px-1 text-[10px] font-semibold leading-none text-background ring-2 ring-background">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="text-sm font-semibold">{en ? "Notifications" : "შეტყობინებები"}</span>
          {sortedItems.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {sortedItems.length}
            </span>
          )}
        </header>
        {sortedItems.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Bell className="mx-auto mb-2 size-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {en ? "You have no notifications yet" : "ჯერ შეტყობინებები არ გაქვს"}
            </p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-auto">
            {sortedItems.map((item) =>
              item.type === "db" ? (
                <DbNotificationRow
                  key={item.key}
                  n={item.node}
                  onClose={() => setOpen(false)}
                  locale={locale}
                />
              ) : (
                <MessageNotificationRow
                  key={item.key}
                  n={item.node}
                  onSelect={() => handleMessageClick(item.node.partnerId)}
                  locale={locale}
                />
              )
            )}
          </ul>
        )}
        {sortedItems.length > 0 && (
          <footer className="border-t border-border/60 px-3 py-2 text-center">
            <Link
              href="/friends?tab=incoming"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {en ? "View all · Manage friends" : "ყველას ნახვა · მეგობრების მართვა"}
            </Link>
          </footer>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreditNotificationRow({
  n,
  onClose,
  locale,
}: {
  n: Notification;
  onClose: () => void;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const amount = n.payload?.creditAmount ?? 0;
  const earned = amount >= 0;
  const reason = n.payload?.creditReason as CreditReason | undefined;
  const reasonLabel = reason ? (en ? CREDIT_REASON_LABEL_EN : CREDIT_REASON_LABEL_KA)[reason] : "";
  const isUnread = !n.readAt;
  return (
    <li>
      <Link
        href="/credits"
        onClick={onClose}
        className={cn(
          "flex items-start gap-3 px-3 py-3 transition-colors hover:bg-accent/10",
          isUnread && "bg-[var(--vivida-violet)]/5"
        )}
      >
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full border",
            earned
              ? "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]"
              : "border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/12 text-[var(--vivida-pink)]"
          )}
        >
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-snug">
            <span
              className={cn(
                "font-semibold tabular-nums",
                earned
                  ? "text-[var(--vivida-cyan)]"
                  : "text-[var(--vivida-pink)]"
              )}
            >
              {earned ? "+" : "−"}
              {Math.abs(amount)} {en ? "credits" : "კრედიტი"}
            </span>{" "}
            {reasonLabel && (
              <span className="text-muted-foreground">· {reasonLabel}</span>
            )}
          </div>
          {typeof n.payload?.creditBalance === "number" && (
            <div className="mt-0.5 text-xs text-muted-foreground/80">
              {en ? "Balance" : "ბალანსი"}: {n.payload.creditBalance}
            </div>
          )}
          <div className="mt-0.5 text-xs text-muted-foreground/80">
            {timeAgo(new Date(n.createdAt), locale)}
          </div>
        </div>
        {isUnread && (
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--vivida-pink)]"
          />
        )}
      </Link>
    </li>
  );
}

function DbNotificationRow({
  n,
  onClose,
  locale,
}: {
  n: Notification;
  onClose: () => void;
  locale: UserLocale;
}) {
  if (n.kind === "credit") {
    return <CreditNotificationRow n={n} onClose={onClose} locale={locale} />;
  }
  const Icon = KIND_ICON[n.kind] ?? Bell;
  const username = n.payload?.fromUsername;
  const href =
    (n.kind === "post_comment" || n.kind === "post_reaction") &&
    n.payload?.postId
      ? // Single-post route, not /feed#post-<id>: the anchor only exists
        // while the post is inside the feed's first page.
        `/feed/${n.payload.postId}`
      : n.kind === "new_match"
        ? "/messages"
        : username
          ? `/u/${username}`
          : "/friends";
  const isUnread = !n.readAt;
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "flex items-start gap-3 px-3 py-3 transition-colors hover:bg-accent/10",
          isUnread && "bg-[var(--vivida-violet)]/5"
        )}
      >
        {n.payload?.fromImage ? (
          <div className="relative shrink-0">
            <Image
              src={n.payload.fromImage}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full border border-border/60 object-cover"
            />
            <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border border-background bg-[var(--vivida-violet)] text-background">
              <Icon className="size-2.5" />
            </span>
          </div>
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/60">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-snug">
            <span className="font-medium text-foreground">
              {n.payload?.fromName ?? username ?? "vivida user"}
            </span>{" "}
            <span className="text-muted-foreground">
              {notificationLabel(n.kind, n.payload, locale)}
            </span>
          </div>
          {n.kind === "post_comment" && n.payload?.preview && (
            <div className="mt-0.5 line-clamp-2 text-xs text-foreground/80">
              {n.payload.preview}
            </div>
          )}
          <div className="mt-0.5 text-xs text-muted-foreground/80">
            {timeAgo(new Date(n.createdAt), locale)}
          </div>
        </div>
        {isUnread && (
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--vivida-pink)]"
          />
        )}
      </Link>
    </li>
  );
}

function MessageNotificationRow({
  n,
  onSelect,
  locale,
}: {
  n: MessageNotif;
  onSelect: () => void;
  locale: UserLocale;
}) {
  const display =
    n.sender.displayName ??
    n.sender.name?.split(" ")[0] ??
    n.sender.username ??
    "vivida user";
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 bg-[var(--vivida-violet)]/5 px-3 py-3 text-left transition-colors hover:bg-accent/10"
      >
        {n.sender.image ? (
          <div className="relative shrink-0">
            <Image
              src={n.sender.image}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full border border-border/60 object-cover"
            />
            <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border border-background bg-[var(--vivida-pink)] text-white">
              <MessageCircle className="size-2.5" />
            </span>
          </div>
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/60">
            <MessageCircle className="size-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-snug">
            <span className="font-medium text-foreground">{display}</span>{" "}
            <span className="text-muted-foreground">{locale !== "ka" ? "messaged you" : "მოგწერა"}</span>
          </div>
          <div className="mt-0.5 line-clamp-2 text-xs text-foreground/80">
            {n.body}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground/80">
            {timeAgo(n.createdAt, locale)}
          </div>
        </div>
        <span
          aria-hidden
          className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--vivida-pink)]"
        />
      </button>
    </li>
  );
}
