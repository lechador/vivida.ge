import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, chartChatMessages } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { ChartChat } from "@/components/ask/chart-chat";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? "Ask your chart" : "ჰკითხე ვარსკვლავებს" };
}
export const dynamic = "force-dynamic";

export default async function AskPage() {
  const user = await requireUser();
  const locale = await getUserLocale(user.id);
  const en = locale === "en";

  const [[chart], history] = await Promise.all([
    db
      .select({ userId: charts.userId })
      .from(charts)
      .where(eq(charts.userId, user.id))
      .limit(1),
    db
      .select({ role: chartChatMessages.role, content: chartChatMessages.content })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, user.id))
      .orderBy(asc(chartChatMessages.createdAt))
      .limit(50),
  ]);

  if (!chart)
    return (
      <AstroLockedMain
        active="ask"
        title={en ? "Your AI astrologer needs a natal chart" : "AI ასტროლოგი ნატალურ რუკას საჭიროებს"}
        description={en ? "Add your birth details to talk to an AI astrologer who knows your chart." : "შეავსე დაბადების მონაცემები, რომ ესაუბრო AI ასტროლოგს, რომელიც შენს რუკას იცნობს."}
        next="/ask"
      />
    );

  const firstName = user.name?.split(" ")[0] ?? null;
  const initialMessages = history.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  return (
    <main lang={locale} className="relative isolate flex h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <Starfield count={110} shooting={3} />

      <AppHeader authed active="ask" />

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 pb-[calc(4.75rem_+_env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 lg:pb-6">
        <header className="mb-5 shrink-0">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {en ? "Ask your" : "ჰკითხე"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "chart" : "ვარსკვლავებს"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "A personal AI astrologer grounded in your real planets, houses and aspects."
              : "შენი ნატალური რუკის პერსონალური AI ასტროლოგი — ეფუძნება შენს რეალურ პლანეტებსა და სახლებს."}
          </p>
        </header>

        <ChartChat initialMessages={initialMessages} firstName={firstName} locale={locale} />
      </section>
    </main>
  );
}
