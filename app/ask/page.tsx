import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { charts, chartChatMessages } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { canUseFeature } from "@/lib/features";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { ChartChat } from "@/components/ask/chart-chat";
import { ProUpsell } from "@/components/paywall/pro-upsell";

export const metadata = { title: "ჰკითხე ვარსკვლავებს" };
export const dynamic = "force-dynamic";

export default async function AskPage() {
  const user = await requireUser();

  const [[chart], plan, history] = await Promise.all([
    db
      .select({ userId: charts.userId })
      .from(charts)
      .where(eq(charts.userId, user.id))
      .limit(1),
    getCurrentPlan(user.id),
    db
      .select({ role: chartChatMessages.role, content: chartChatMessages.content })
      .from(chartChatMessages)
      .where(eq(chartChatMessages.userId, user.id))
      .orderBy(asc(chartChatMessages.createdAt))
      .limit(50),
  ]);

  if (!chart) redirect("/onboarding");

  const firstName = user.name?.split(" ")[0] ?? null;
  const initialMessages = history.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <Starfield count={110} shooting={3} />

      <AppHeader authed plan={plan} active="ask" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-5">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ჰკითხე{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ვარსკვლავებს
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            შენი ნატალური რუკის პერსონალური AI ასტროლოგი — ეფუძნება შენს რეალურ
            პლანეტებსა და სახლებს.
          </p>
        </header>

        {canUseFeature("chartChat", plan) ? (
          <ChartChat initialMessages={initialMessages} firstName={firstName} />
        ) : (
          <ProUpsell
            title="ჰკითხე ვარსკვლავებს"
            description="პერსონალური AI ასტროლოგი, რომელიც შენს ნატალურ რუკას იცნობს და ნებისმიერ შეკითხვას უპასუხებს — ხასიათზე, ურთიერთობებზე, კარიერასა და დროზე."
          />
        )}
      </section>
    </main>
  );
}
