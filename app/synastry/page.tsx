import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { CreditHint } from "@/components/credits/credit-hint";
import { listPartners, partnerCreationsThisMonth } from "@/lib/partners-core";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import { PartnerCard } from "@/components/synastry/partner-card";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getRequestLocale()) === "en";
  return { title: en ? "Compatibility" : "თავსებადობა" };
}

export default async function SynastryPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const user = await requireUser();
  const [partners, used] = await Promise.all([
    listPartners(user.id),
    partnerCreationsThisMonth(user.id),
  ]);
  const cap = PARTNER_CAP_PER_MONTH;
  const remaining = Math.max(0, cap - used);

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.18_350/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_305/0.3),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <AppHeader authed active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                {en ? "Compatibility" : "თავსებადობა"}
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-foreground/75 sm:text-base">
              {en
                ? "Add someone who matters to you and explore how your birth charts connect."
                : "დაამატე ადამიანი, რომელიც შენთვის მნიშვნელოვანია — ნახე, როგორ ერთვით ცაში ერთმანეთს."}
            </p>
            <div className="mt-2">
              <CreditHint>
                {en
                  ? "Your first compatibility reading is free, then 5 credits"
                  : "პირველი თავსებადობა უფასოა, შემდეგ −5 კრედიტი"}
              </CreditHint>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {remaining > 0 ? (
              <Button asChild variant="mystic" size="lg">
                <Link href="/synastry/new">
                  <Plus className="size-4" />
                  {en ? "Add partner" : "ახალი პარტნიორი"}
                </Link>
              </Button>
            ) : (
              // Monthly cap hit — render a disabled button so the click
              // can't navigate anywhere unhelpful.
              <Button variant="outline" size="lg" disabled>
                <Plus className="size-4" />
                {en ? "Available next month" : "შემდეგი თვიდან"}
              </Button>
            )}
          </div>
        </div>

        {partners.length === 0 ? (
          <EmptyState canAdd={remaining > 0} locale={locale} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.id}>
                <PartnerCard
                  id={p.id}
                  name={p.name}
                  cityName={p.cityName}
                  dateOfBirth={p.dateOfBirth}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState({
  canAdd,
  locale,
}: {
  canAdd: boolean;
  locale: UserLocale;
}) {
  const en = locale === "en";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-10 text-center backdrop-blur-xl">
      <Heart
        className="mx-auto size-10 text-[var(--vivida-pink)]"
        aria-hidden
      />
      <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight">
        {en ? "You haven't added anyone yet" : "ჯერ პარტნიორი არ დაგიმატებია"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {en
          ? "Add a partner, close friend, family member, or anyone you're curious about to see how your charts fit together."
          : "დაამატე ახლო ადამიანი, ძველი მეგობარი, თუ ვინც გაინტერესებს — ნახე თქვენი ცის რუკების ერთობლივი თავსებადობა."}
      </p>
      {canAdd && (
        <Button asChild className="mt-6" variant="mystic" size="lg">
          <Link href="/synastry/new">
            <Plus className="size-4" />
            {en ? "Add your first person" : "დაამატე პირველი"}
          </Link>
        </Button>
      )}
    </div>
  );
}
