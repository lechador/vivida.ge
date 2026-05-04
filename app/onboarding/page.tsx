import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { VividaMark } from "@/components/brand/vivida-mark";

export const metadata = { title: "გაცნობა" };

export default async function OnboardingPage() {
  const user = await requireUser();

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.45),transparent_70%),radial-gradient(35%_30%_at_85%_75%,oklch(0.32_0.13_200/0.35),transparent_70%)]"
      />
      <Starfield count={90} />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
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
          სალამი, {user.name?.split(" ")[0] ?? "ვარსკვლავო"} ✨
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <OnboardingWizard
          initialProfile={existing ?? null}
          defaultName={user.name ?? null}
        />
      </section>
    </main>
  );
}
