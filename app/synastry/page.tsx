import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { CreditHint } from "@/components/credits/credit-hint";
import { partnerCreationsThisMonth } from "@/lib/partners-core";
import { listRelationshipsForViewer } from "@/lib/relationship-core";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import { PartnerCard } from "@/components/synastry/partner-card";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { UserLocale } from "@/lib/i18n/user-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return { title: en ? "Compatibility" : "თავსებადობა" };
}

export default async function SynastryPage() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const user = await requireUser();
  const [partners, used] = await Promise.all([
    listRelationshipsForViewer(user.id),
    partnerCreationsThisMonth(user.id),
  ]);
  const cap = PARTNER_CAP_PER_MONTH;
  const remaining = Math.max(0, cap - used);

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-pink)]">
              RELATIONAL SYNASTRY · თავსებადობა
            </div>
            <h1
              className={
                en
                  ? "mt-2 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl"
                  : "mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
              }
            >
              {en ? "Chart " : "რუკების "}
              <span className="text-[var(--vivida-pink)]">
                {en ? "Compatibility" : "თავსებადობა"}
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              {en
                ? "Add someone who matters to you and explore how your birth charts connect across planets, houses, and aspects."
                : "დაამატე ადამიანი, რომელიც შენთვის მნიშვნელოვანია, ნახე, როგორ ერთვით ცაში ერთმანეთს."}
            </p>
            <div className="mt-3">
              <CreditHint>
                {en
                  ? "Your first compatibility reading is free, then 5 credits"
                  : "პირველი თავსებადობა უფასოა, შემდეგ −5 კრედიტი"}
              </CreditHint>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {remaining > 0 ? (
              <Button asChild size="lg">
                <Link href="/synastry/new">
                  <Plus className="size-4" />
                  {en ? "Add partner" : "ახალი პარტნიორი"}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="lg" disabled>
                <Plus className="size-4" />
                {en ? "Available next month" : "შემდეგი თვიდან"}
              </Button>
            )}
          </div>
        </header>

        {partners.length === 0 ? (
          <EmptyState canAdd={remaining > 0} locale={locale} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.id}>
                <PartnerCard
                  id={p.id}
                  name={p.displayName}
                  cityName={p.cityName}
                  dateOfBirth={p.dateOfBirth}
                  canDelete={p.viewerRole === "owner"}
                  connected={p.connected}
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
  const en = locale !== "ka";
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-lg border border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/15 text-[var(--vivida-pink)]">
        <Heart className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-foreground">
        {en ? "You haven't added anyone yet" : "ჯერ პარტნიორი არ დაგიმატებია"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {en
          ? "Add a partner, close friend, family member, or anyone you're curious about to see how your charts fit together."
          : "დაამატე ახლო ადამიანი, ძველი მეგობარი, თუ ვინც გაინტერესებს, ნახე თქვენი ცის რუკების ერთობლივი თავსებადობა."}
      </p>
      {canAdd && (
        <Button asChild className="mt-6" size="lg">
          <Link href="/synastry/new">
            <Plus className="size-4" />
            {en ? "Add your first person" : "დაამატე პირველი"}
          </Link>
        </Button>
      )}
    </div>
  );
}
