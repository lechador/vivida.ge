import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { VividaMark } from "@/components/brand/vivida-mark";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FastOnboarding } from "@/components/onboarding/fast-onboarding";
import { ExperimentAssignmentTracker } from "@/components/analytics/experiment-assignment-tracker";
import {
  getSignupCreditAssignment,
  markSignupCreditExperimentExposed,
  SIGNUP_CREDITS_EXPERIMENT,
} from "@/lib/signup-credit-experiment";
import { after } from "next/server";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Set up your chart" : "გაცნობა" };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; fast?: string }>;
}) {
  const user = await requireUser();
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const { next, fast } = await searchParams;

  const [[existing], assignment] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    getSignupCreditAssignment(user.id),
  ]);
  if (assignment && !assignment.exposedAt) {
    after(() => markSignupCreditExperimentExposed(user.id));
  }

  const destination = next
    ? normalizeReturnPath(next, "") || undefined
    : undefined;
  if (fast === "1" && existing?.dateOfBirth) redirect(destination ?? "/report");

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden bg-background"
    >
      {assignment && (
        <ExperimentAssignmentTracker
          experiment={SIGNUP_CREDITS_EXPERIMENT}
          variant={assignment.variant}
          eligibility={assignment.eligibility}
        />
      )}
      <Starfield count={48} />

      <header className="relative z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <VividaMark size={30} id="onboarding" />
            <span className="font-display text-2xl font-medium tracking-tight text-foreground">
              Vivida
            </span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">
            {en ? "Observatory Setup" : "პირადი რუკის შექმნა"} ·{" "}
            <span className="text-foreground">
              {user.name?.split(" ")[0] ?? (en ? "Stargazer" : "სტუმარი")}
            </span>
          </div>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        {fast === "1" ? (
          <FastOnboarding next={destination} locale={locale} />
        ) : (
          <OnboardingWizard
            initialProfile={existing ?? null}
            defaultName={user.name ?? null}
            next={destination}
            locale={locale}
          />
        )}
      </section>
    </main>
  );
}
