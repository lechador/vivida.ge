import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { Starfield } from "@/components/landing/starfield";
import {
  countUnreadMessages,
  listConversations,
} from "@/lib/messages";
import { getCurrentPlan } from "@/lib/plan";

export const metadata = { title: "ჩატი" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const [{ with: partnerId }, conversations, unread, plan] = await Promise.all([
    searchParams,
    listConversations(userId),
    countUnreadMessages(userId),
    getCurrentPlan(userId),
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
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={70} />

      <AppHeader authed plan={plan} active="messages" />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
        <ChatLauncher
          viewerId={userId}
          initialConversations={initial}
          initialUnreadTotal={unread}
          mode="page"
          initialPartnerId={partnerId ?? null}
        />
      </section>
    </main>
  );
}
