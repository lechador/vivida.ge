import { eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { InlineBirthDatePrompt } from "@/components/astro/inline-birth-date-prompt";
import { ChartChat } from "@/components/ask/chart-chat";
import type { AskMemoryView } from "@/components/ask/chart-chat";
import { getAskMemory } from "@/lib/ask-memory";
import {
  getAskConversation,
  getConversationMessages,
  listAskConversations,
} from "@/lib/ask-conversations";
import { conversationWhen } from "@/lib/ask-conversations-pure";
import { markAskNudgesOpened } from "@/lib/ask-nudges";
import {
  buildFollowUpQuestion,
  buildTopicStarter,
} from "@/lib/ask-memory-pure";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { normalizeChartStarter } from "@/lib/chart-chat-starters";
import { isPremiumUser } from "@/lib/premium";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      locale === "pl"
        ? "Zapytaj swój kosmogram"
        : locale !== "ka"
          ? "Ask your chart"
          : "ჰკითხე ვარსკვლავებს",
  };
}
export const dynamic = "force-dynamic";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ starter?: string; c?: string }>;
}) {
  const user = await requireUser("/ask");
  const { starter, c: conversationParam } = await searchParams;
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";

  const [[chart], [profile], conversations] = await Promise.all([
    db
      .select({ userId: charts.userId })
      .from(charts)
      .where(eq(charts.userId, user.id))
      .limit(1),
    db
      .select({ dateOfBirth: profiles.dateOfBirth })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1),
    listAskConversations(user.id),
  ]);

  if (!chart)
    return (
      <AstroLockedMain
        active="ask"
        title={
          locale === "pl"
            ? "Twój astrolog potrzebuje kosmogramu urodzeniowego"
            : en
              ? "Your astrologer needs a natal chart"
              : "ასტროლოგი ნატალურ რუკას საჭიროებს"
        }
        description={
          locale === "pl"
            ? "Uzupełnij dane urodzenia, aby skonsultować się z astrologiem na podstawie Twojego kosmogramu."
            : en
              ? "Add your birth details to consult an astrologer grounded in your natal chart."
              : "შეავსე დაბადების მონაცემები, რომ ესაუბრო ასტროლოგს, რომელიც შენს რუკას იცნობს."
        }
        next="/ask"
        locale={locale}
        topBanner={
          !profile?.dateOfBirth ? (
            <InlineBirthDatePrompt locale={locale} />
          ) : null
        }
      />
    );

  const firstName = user.name?.split(" ")[0] ?? null;
  // Conversations are switchable topics; `?c=<id>` keeps the selected one
  // across reloads. An id that is not the caller's falls back to the newest.
  const requested = conversationParam
    ? await getAskConversation(user.id, conversationParam).catch(() => null)
    : null;
  const active =
    requested ??
    (conversations[0]
      ? await getAskConversation(user.id, conversations[0].id).catch(() => null)
      : null);
  const turns = active
    ? await getConversationMessages(user.id, active.id).catch(() => [])
    : [];
  const initialMessages = turns.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
  const now = new Date();
  const conversationList = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    when: conversationWhen(conversation.updatedAt, now, locale),
  }));
  const premium = await isPremiumUser(user.id);

  const storedMemory = await getAskMemory(user.id).catch(() => null);
  await markAskNudgesOpened(user.id).catch(() => {});
  const followUp = storedMemory?.traits?.openLoops?.[0]?.trim()
    ? buildFollowUpQuestion(storedMemory.traits.openLoops[0], locale)
    : null;
  const topicStarters = (storedMemory?.traits?.topics ?? [])
    .slice(0, 3)
    .map((t) => buildTopicStarter(t, locale));
  const initialMemory: AskMemoryView | null =
    storedMemory &&
    (storedMemory.summary.trim() ||
      Object.keys(storedMemory.traits ?? {}).length > 0)
      ? {
          summary: storedMemory.summary,
          traits: {
            tone: storedMemory.traits?.tone,
            topics: storedMemory.traits?.topics,
          },
          nudgesEnabled: storedMemory.nudgesEnabled ?? true,
        }
      : null;

  return (
    /*
     * The section below reserves the mobile tab-bar height itself, the same
     * contract as /messages. Without the data-no-body-bottom-pad opt-out the
     * global body padding adds 4.5rem *below* a 100dvh page, which produced a
     * page-level scrollbar and pushed the composer around on phones.
     */
    <main
      data-no-body-bottom-pad
      data-chat-viewport
      lang={locale}
      className="relative isolate flex h-[100dvh] flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="ask" />

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3 pb-[calc(4.5rem_+_max(env(safe-area-inset-bottom),0.25rem))] pt-2 sm:px-6 sm:pt-8 lg:pb-6">
        <header className="mb-3 hidden shrink-0 border-b border-border pb-3 sm:mb-4 sm:block sm:pb-4">
          {/* Bilingual eyebrow wraps to two lines on phones and just eats
              thread height; the app header breadcrumb already names the
              section, so it stays a desktop flourish. */}
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-primary sm:block">
            {locale === "pl"
              ? "KONSULTACJA W OBSERWATORIUM · PRZESTRZEŃ OSOBISTA"
              : "OBSERVATORY CONSULTATION · პირადი კონსულტაცია"}
          </div>
          <h1
            className={
              en
                ? "mt-1 text-balance font-display text-xl font-medium tracking-tight text-foreground sm:text-3xl"
                : "mt-1 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-3xl"
            }
          >
            {locale === "pl" ? (
              <>
                Zapytaj swój <span className="text-primary">kosmogram</span>
              </>
            ) : en ? (
              <>
                Ask your <span className="text-primary">natal chart</span>
              </>
            ) : (
              <>
                ჰკითხე <span className="text-primary">ვარსკვლავებს</span>
              </>
            )}
          </h1>
          {/* The transcript's own intro explains the tool on phones; the
              long subtitle is only worth its vertical space on desktop. */}
          <p className="mt-1 hidden text-xs text-muted-foreground sm:block sm:text-sm">
            {locale === "pl"
              ? "Osobista konsultacja astrologiczna oparta na Twoich dokładnych planetach, domach i aspektach."
              : en
                ? "Personal astrological consultation grounded in your exact planets, houses, and aspects."
                : "შენი ნატალური რუკის პერსონალური ასტროლოგი, ეფუძნება შენს რეალურ პლანეტებსა და სახლებს."}
          </p>
        </header>

        <ChartChat
          key={active?.id ?? "new"}
          initialMessages={initialMessages}
          initialStarter={normalizeChartStarter(starter)}
          firstName={firstName}
          locale={locale}
          premium={premium}
          conversations={conversationList}
          activeConversationId={active?.id ?? null}
          isNewTopic={Boolean(
            active?.isolatedMemory && initialMessages.length === 0,
          )}
          followUp={followUp}
          topicStarters={topicStarters}
          initialMemory={initialMemory}
        />
      </section>
    </main>
  );
}
