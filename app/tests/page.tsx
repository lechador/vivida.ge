import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Clock, ArrowRight } from "lucide-react";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { TESTS } from "@/lib/tests-catalog";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://www.vivida.ge";

export const metadata: Metadata = {
  title: "ტესტები — ფსიქოლოგიური ტესტები",
  description:
    "Vivida-ს ფსიქოლოგიური ტესტები — აღმოაჩინე შენი პიროვნების ტიპი და მეტი, უფასოდ.",
  alternates: { canonical: `${SITE_URL}/tests` },
};

/**
 * The tests hub — one card per test from the catalog. A dedicated page (rather
 * than one nav slot per test) so new tests are added without crowding the nav.
 * Public: works signed-out (SmartHeader) and signed-in (AppHeader).
 */
export default async function TestsPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-8 text-center sm:mb-10">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ტესტები
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            ფსიქოლოგიური{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ტესტები
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-foreground/80 sm:text-base">
            აღმოაჩინე მეტი საკუთარ თავზე — გაიარე ტესტი და მიიღე ღრმა, პერსონალური
            ანალიზი.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {TESTS.map((test) => (
            <article
              key={test.slug}
              className="flex flex-col rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
                  <Brain className="size-5 text-[var(--vivida-violet)]" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{test.titleKa}</h2>
                  <p className="text-sm text-muted-foreground">{test.taglineKa}</p>
                </div>
              </div>

              <p className="text-[15px] leading-relaxed text-foreground/85">
                {test.descKa}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{test.metaKa}</span>
              </div>

              <div className="mt-5">
                {test.available ? (
                  <Button asChild variant="mystic" className="w-full sm:w-auto">
                    <Link href={test.href}>
                      დაწყება
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                    მალე
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
