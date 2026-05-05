import { Suspense } from "react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { ChartSection } from "@/components/dashboard/chart-section";
import { CosmicLoader } from "@/components/dashboard/cosmic-loader";
import { TrialBanner } from "@/components/billing/trial-banner";

export const metadata = { title: "ჩემი რუკა" };

export default async function ReportPage() {
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
      {/* Layered nebula glows — three radial gradients at different points,
          one slowly drifting for life. Together they lift the page out of
          a flat dark, evoking deep cosmos rather than a black screen. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%),radial-gradient(35%_25%_at_70%_85%,oklch(0.30_0.18_280/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%),radial-gradient(40%_35%_at_75%_60%,oklch(0.42_0.16_200/0.18),transparent_70%)]"
      />
      <Starfield count={160} shooting={3} />

      <AppHeader authed plan={plan} active="report" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <h1 className="mb-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {firstName}-ის{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            კოსმიური რუკა
          </span>
        </h1>
        <p className="mb-6 max-w-xl text-sm text-foreground/75 sm:text-base">
          ცა შენი დაბადების წამში — ნელ-ნელა, ერთი ნაბიჯი მერე მეორე.
        </p>

        <div className="mb-8">
          <TrialBanner userId={user.id} />
        </div>

        <Suspense fallback={<CosmicLoader embedded />}>
          <ChartSection userId={user.id} plan={plan} />
        </Suspense>

        <div className="mt-14 rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">შენი დაბადების მონაცემები</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/onboarding">
                <Pencil className="size-3.5" />
                რედაქტირება
              </Link>
            </Button>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="დაბადების თარიღი" value={profile.dateOfBirth} />
            <Field
              label="დაბადების დრო"
              value={
                profile.timeOfBirth
                  ? profile.timeOfBirth.slice(0, 5)
                  : "უცნობია (გამოყენებულია 12:00)"
              }
            />
            <Field label="დაბადების ადგილი" value={profile.cityName} />
            <Field label="დროის სარტყელი" value={profile.timezone} />
          </dl>
          {(profile.latitude != null || profile.longitude != null) && (
            <details className="group mt-4 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none transition-colors hover:text-foreground">
                ტექნიკური დეტალები
              </summary>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
                {profile.latitude != null && (
                  <span>განედი: {profile.latitude.toFixed(4)}</span>
                )}
                {profile.longitude != null && (
                  <span>გრძედი: {profile.longitude.toFixed(4)}</span>
                )}
              </div>
            </details>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
