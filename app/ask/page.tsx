import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, chartChatMessages, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { InlineBirthDatePrompt } from "@/components/astro/inline-birth-date-prompt";
import { ChartChat } from "@/components/ask/chart-chat";
import type { AskMemoryView } from "@/components/ask/chart-chat";
import { getAskMemory } from "@/lib/ask-memory";
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
  return { title: locale !== "ka" ? "Ask your chart" : "ჰკითხე ვარსკვლავებს" };
}
export const dynamic = "force-dynamic";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ starter?: string }>;
}) {
  const user = await requireUser("/ask");
  const { starter } = await searchParams;
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";

  const [[chart], [profile], history] = await Promise.all([
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
    db
      .select({
        role: chartChatMessages.role,
        content: chartChatMessages.content,
      })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, user.id))
      .orderBy(asc(chartChatMessages.createdAt))
      .limit(50),
  ]);

  if (!chart)
    return (
      <AstroLockedMain
        active="ask"
        title={
          en
            ? "Your astrologer needs a natal chart"
            : "ასტროლოგი ნატალურ რუკას საჭიროებს"
        }
        description={
          en
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
  const initialMessages = history.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
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
      lang={locale}
      className="relative isolate flex h-[100dvh] flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="ask" />

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-3 pb-[calc(4.5rem_+_max(env(safe-area-inset-bottom),0.25rem))] pt-3 sm:px-6 sm:pt-8 lg:pb-6">
        <header className="mb-3 shrink-0 border-b border-border pb-3 sm:mb-4 sm:pb-4">
          {/* Bilingual eyebrow wraps to two lines on phones and just eats
              thread height; the app header breadcrumb already names the
              section, so it stays a desktop flourish. */}
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-primary sm:block">
            OBSERVATORY CONSULTATION · პირადი კონსულტაცია
          </div>
          <h1
            className={
              en
                ? "mt-1 text-balance font-display text-xl font-medium tracking-tight text-foreground sm:text-3xl"
                : "mt-1 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-3xl"
            }
          >
            {en ? "Ask your " : "ჰკითხე "}
            <span className="text-primary">
              {en ? "natal chart" : "ვარსკვლავებს"}
            </span>
          </h1>
          {/* The transcript's own intro explains the tool on phones; the
              long subtitle is only worth its vertical space on desktop. */}
          <p className="mt-1 hidden text-xs text-muted-foreground sm:block sm:text-sm">
            {en
              ? "Personal astrological consultation grounded in your exact planets, houses, and aspects."
              : "შენი ნატალური რუკის პერსონალური ასტროლოგი, ეფუძნება შენს რეალურ პლანეტებსა და სახლებს."}
          </p>
        </header>

        <ChartChat
          initialMessages={initialMessages}
          initialStarter={normalizeChartStarter(starter)}
          firstName={firstName}
          locale={locale}
          premium={premium}
          followUp={followUp}
          topicStarters={topicStarters}
          initialMemory={initialMemory}
        />
      </section>
    </main>
  );
}
