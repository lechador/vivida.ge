import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { Starfield } from "@/components/landing/starfield";
import {
  countUnreadMessages,
  listConversations,
} from "@/lib/messages";
import { cn } from "@/lib/utils";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getRequestLocale()) === "en" ? "Messages" : "ჩატი",
  };
}
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const [{ with: partnerId }, conversations, unread, locale] = await Promise.all([
    searchParams,
    listConversations(userId),
    countUnreadMessages(userId),
    getUserLocale(userId),
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

  return (
    <main
      data-no-body-bottom-pad
      lang={locale}
      className="relative isolate flex h-[100dvh] flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={70} />

      <AppHeader authed active="messages" />

      <section
        className={cn(
          // Mobile: full bleed under the header, with bottom padding equal
          // to the tab bar so the input never sits behind it.
          "relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col overflow-hidden",
          "pb-[calc(4.5rem+max(env(safe-area-inset-bottom),0.25rem))]",
          // Desktop: max-width card with breathing room.
          "sm:max-w-3xl sm:px-6 sm:pb-8 sm:pt-4 lg:pb-8"
        )}
      >
        <ChatLauncher
          viewerId={userId}
          initialConversations={initial}
          initialUnreadTotal={unread}
          mode="page"
          initialPartnerId={partnerId ?? null}
          locale={locale}
        />
      </section>
    </main>
  );
}
