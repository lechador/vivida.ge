import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { isAccountRestricted } from "@/lib/restriction";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DailyDashboard } from "@/components/dashboard/daily-dashboard";
import { PushOptIn } from "@/components/push/push-opt-in";
import { RestrictedNotice } from "@/components/safety/restricted-notice";
import { ProUpsell } from "@/components/paywall/pro-upsell";

export const metadata = { title: "დღეს" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [[profile], plan, [userRow]] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    getCurrentPlan(user.id),
    db
      .select({ horoscopeVoice: users.horoscopeVoice })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
  ]);

  if (!profile) {
    redirect("/onboarding");
  }

  const restricted = await isAccountRestricted(user.id);
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
        {restricted && <RestrictedNotice />}
        <h1 className="mb-6 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          სალამი,{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>

        {/* Soft prompt to enable daily push — hides itself once enabled,
            unsupported, or dismissed. */}
        <PushOptIn variant="banner" />

        {/* DailyDashboard is a client component — it fetches the heavy AI
            data via a server action after first paint, so the response
            stream closes immediately and the browser tab spinner stops.
            Our internal CosmicLoader covers the AI generation window. */}
        <DailyDashboard
          userId={user.id}
          plan={plan}
          savedVoice={userRow?.horoscopeVoice ?? null}
        />

        {plan !== "pro" && (
          <ProUpsell
            className="mt-8"
            title="გახსენი Vivida Pro"
            description="მოისმინე ჰოროსკოპი ხმით, ესაუბრე AI ასტროლოგს შენი რუკის შესახებ, ნახე საუკეთესო დღეები და მიიღე ღრმა თავსებადობის ანგარიში."
          />
        )}
      </section>
    </main>
  );
}
