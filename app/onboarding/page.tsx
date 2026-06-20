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
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,oklch(0.90_0.06_290/0.65),transparent_70%),radial-gradient(40%_32%_at_85%_75%,oklch(0.90_0.08_45/0.55),transparent_70%)]"
      />
      <Starfield count={90} tone="dawn" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2">
          <VividaMark size={40} id="onboarding" />
          <span
            className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--vivida-violet) 0%, var(--vivida-pink) 55%, var(--vivida-cyan) 100%)",
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
