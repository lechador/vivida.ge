import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DailyView } from "@/components/dashboard/daily-view";
import { CosmicLoader } from "@/components/dashboard/cosmic-loader";
import { TrialBanner } from "@/components/billing/trial-banner";

export const metadata = { title: "დღეს" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [[profile], plan] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    getCurrentPlan(user.id),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const firstName = user.name?.split(" ")[0] ?? "ვარსკვლავო";

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(45%_35%_at_30%_50%,oklch(0.40_0.18_305/0.15),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <AppHeader authed plan={plan} active="today" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <h1 className="mb-6 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          სალამი,{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

        {/* Suppress the trial banner on the dashboard until the final
            stretch — keeps the daily view distraction-free for the bulk
            of the trial. /account + /pricing still show it full-time so
            users who actively check status always see the countdown. */}
        <div className="mb-8 empty:hidden">
          <TrialBanner userId={user.id} showWithinDays={3} />
        </div>

        <Suspense fallback={<CosmicLoader embedded />}>
          <DailyView userId={user.id} plan={plan} />
        </Suspense>
      </section>
    </main>
  );
}
