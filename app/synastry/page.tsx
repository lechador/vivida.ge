import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import {
  listPartners,
  partnerCreationsThisMonth,
} from "@/lib/partners-core";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import { PartnerCard } from "@/components/synastry/partner-card";

export const metadata = { title: "თავსებადობა" };

export default async function SynastryPage() {
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  const [partners, used] = await Promise.all([
    listPartners(user.id),
    partnerCreationsThisMonth(user.id),
  ]);
  const cap = PARTNER_CAP_PER_MONTH[plan];
  const remaining = Math.max(0, cap - used);

  return (
    <main className="dawn relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_-5%,oklch(0.90_0.06_290/0.6),transparent_70%),radial-gradient(40%_32%_at_85%_65%,oklch(0.90_0.08_45/0.5),transparent_70%),radial-gradient(35%_28%_at_15%_75%,oklch(0.91_0.07_350/0.45),transparent_70%)]"
      />
      <Starfield tone="dawn" count={120} shooting={3} />

      <AppHeader authed plan={plan} active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                თავსებადობა
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-foreground/75 sm:text-base">
              დაამატე ადამიანი, რომელიც შენთვის მნიშვნელოვანია — ნახე, როგორ
              ერთვით ცაში ერთმანეთს.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {remaining > 0 ? (
              <Button asChild variant="mystic" size="lg">
                <Link href="/synastry/new">
                  <Plus className="size-4" />
                  ახალი პარტნიორი
                </Link>
              </Button>
            ) : (
              // Monthly cap hit — render a disabled button so the click
              // can't navigate anywhere unhelpful.
              <Button variant="outline" size="lg" disabled>
                <Plus className="size-4" />
                შემდეგი თვიდან
              </Button>
            )}
          </div>
        </div>

        {partners.length === 0 ? (
          <EmptyState canAdd={remaining > 0} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.id}>
                <PartnerCard
                  id={p.id}
                  name={p.name}
                  cityName={p.cityName}
                  dateOfBirth={p.dateOfBirth}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState({ canAdd }: { canAdd: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-10 text-center backdrop-blur-xl">
      <Heart
        className="mx-auto size-10 text-[var(--vivida-pink)]"
        aria-hidden
      />
      <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight">
        ჯერ პარტნიორი არ დაგიმატებია
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        დაამატე ახლო ადამიანი, ძველი მეგობარი, თუ ვინც გაინტერესებს — ნახე
        თქვენი ცის რუკების ერთობლივი თავსებადობა.
      </p>
      {canAdd && (
        <Button asChild className="mt-6" variant="mystic" size="lg">
          <Link href="/synastry/new">
            <Plus className="size-4" />
            დაამატე პირველი
          </Link>
        </Button>
      )}
    </div>
  );
}
