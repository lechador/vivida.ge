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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Set up your chart" : "გაცნობა" };
}

/** Same-origin relative path only (no open redirect). */
function safeNext(v: string | undefined): string | undefined {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : undefined;
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

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const destination = safeNext(next);
  if (fast === "1" && existing) redirect(destination ?? "/report");

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.45),transparent_70%),radial-gradient(35%_30%_at_85%_75%,oklch(0.32_0.13_200/0.35),transparent_70%)]"
      />
      <Starfield count={90} />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2">
          <VividaMark size={40} id="onboarding" />
          <span
            className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </Link>
        <div className="text-right text-xs text-muted-foreground">
          {en ? "Hi" : "სალამი"}, {user.name?.split(" ")[0] ?? (en ? "stargazer" : "ვარსკვლავო")} ✨
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
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
