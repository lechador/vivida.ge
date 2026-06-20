import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { isAccountRestricted } from "@/lib/restriction";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DailyDashboard } from "@/components/dashboard/daily-dashboard";
import { RestrictedNotice } from "@/components/safety/restricted-notice";

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

  const restricted = await isAccountRestricted(user.id);
  const firstName = user.name?.split(" ")[0] ?? "ვარსკვლავო";

  return (
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_-5%,oklch(0.90_0.06_290/0.65),transparent_70%),radial-gradient(40%_32%_at_85%_60%,oklch(0.90_0.08_45/0.5),transparent_70%),radial-gradient(35%_28%_at_15%_75%,oklch(0.91_0.07_350/0.45),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(45%_35%_at_30%_50%,oklch(0.88_0.08_330/0.18),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} tone="dawn" />

      <AppHeader authed plan={plan} active="today" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {restricted && <RestrictedNotice />}
        <h1 className="mb-6 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          სალამი,{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

        {/* DailyDashboard is a client component — it fetches the heavy AI
            data via a server action after first paint, so the response
            stream closes immediately and the browser tab spinner stops.
            Our internal CosmicLoader covers the AI generation window. */}
        <DailyDashboard userId={user.id} plan={plan} />
      </section>
    </main>
  );
}
