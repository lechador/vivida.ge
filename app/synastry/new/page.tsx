import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { partnerCreationsThisMonth } from "@/lib/partners-core";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import { PartnerForm } from "@/components/synastry/partner-form";

export const metadata = { title: "ახალი პარტნიორი" };

export default async function NewPartnerPage() {
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  // Server-side cap check — keeps unauthorised users from bypassing the
  // client-side disabled CTA.
  const used = await partnerCreationsThisMonth(user.id);
  const cap = PARTNER_CAP_PER_MONTH[plan];
  if (used >= cap) {
    redirect("/synastry");
  }

  return (
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_-5%,oklch(0.90_0.06_290/0.6),transparent_70%),radial-gradient(40%_32%_at_85%_65%,oklch(0.90_0.08_45/0.5),transparent_70%),radial-gradient(35%_28%_at_15%_75%,oklch(0.91_0.07_350/0.45),transparent_70%)]"
      />
      <Starfield tone="dawn" count={120} shooting={3} />

      <AppHeader authed plan={plan} active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <Link
          href="/synastry"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          უკან
        </Link>

        <h1 className="mb-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          ვისთან გინდა შეადარო ცა?
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          ჩაწერე პარტნიორის დაბადების მონაცემები. პარტნიორი ვინც არ უნდა იყოს —
          საყვარელი, ოჯახის წევრი, ძველი მეგობარი ან ვინც გაინტერესებს.
        </p>

        <PartnerForm />
      </section>
    </main>
  );
}
