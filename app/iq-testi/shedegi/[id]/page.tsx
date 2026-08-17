import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Brain, RotateCcw } from "lucide-react";

import { db } from "@/db";
import { iqResults } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { iqBand } from "@/lib/iq/scoring";
import { DOMAIN_LABELS_EN, DOMAIN_LABELS_KA, type IqDomain } from "@/lib/iq/items";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { IqBellCurve, DomainBar } from "@/components/iq/iq-bell-curve";
import { ProfileVisibilityToggle } from "@/components/tests/profile-visibility-toggle";
import { NextTestWidget } from "@/components/tests/next-test-widget";
import { UnlockCard } from "@/components/credits/unlock-card";
import { CREDIT_COST, getBalance, isUnlocked } from "@/lib/credits";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";
  return { title: am ? "Ձեր Ինտելեկտի Գործակցի Արդյունքը" : en ? "Your IQ Result" : "შენი IQ შედეგი", robots: { index: false } };
}
export const dynamic = "force-dynamic";

const DOMAINS: IqDomain[] = ["numeric", "logic", "spatial", "pattern"];

/**
 * A saved IQ result, owner-only — the persistent view behind "ჩემი შედეგი" on
 * the tests hub (the fresh /iq-testi/shedegi is localStorage-only). Renders from
 * the stored row so it works from any device.
 */
export default async function SavedIqResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const am = locale === "am";

  const [row] = await db
    .select()
    .from(iqResults)
    .where(and(eq(iqResults.id, id), eq(iqResults.userId, user.id)))
    .limit(1);
  if (!row) notFound(); // not found OR not the owner

  const band = iqBand(row.iq);
  const ds = row.domainScores;

  // The score/percentile/curve are free (shareable); the deep domain profile
  // unlocks once for CREDIT_COST.iqTest credits.
  const [unlocked, balance] = await Promise.all([
    isUnlocked(user.id, row.id, "spend_iq"),
    getBalance(user.id),
  ]);

  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_265/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_190/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <AppHeader authed active="tests" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <div className="rounded-3xl border border-border bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            VIVIDA IQ
          </div>
          <div className="mt-3 text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
            {row.iq}
          </div>
          <div className="mt-1 text-lg font-semibold text-[var(--vivida-cyan)]">
            {en ? band.labelEn : band.labelKa}
          </div>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/75">
            {en ? band.descEn : band.descKa}
          </p>

          <div className="mx-auto mt-6 w-full max-w-lg">
            <IqBellCurve iq={row.iq} locale={locale} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>
              {am ? "Տոկոսային դասակարգում " : en ? "Percentile " : "ჯობნი მოსახლეობის "}
              <span className="font-semibold text-foreground">{row.percentile}{am ? "րդ" : en ? "th" : "%"}</span>{!en && "-ს"}
            </span>
            <span>
              {am ? "Ճիշտ պատասխաններ " : en ? "Correct answers " : "სწორი პასუხი "}
              <span className="font-semibold text-foreground">
                {row.correct} / {row.total}
              </span>
            </span>
          </div>
        </div>

        {/* Per-domain breakdown — gated behind a one-time credit unlock */}
        {unlocked ? (
          <div className="mt-4 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold tracking-tight">
              <Brain className="size-4 text-[var(--vivida-violet)]" />
              {am ? "Դատողության պրոֆիլ" : en ? "Reasoning profile" : "აზროვნების პროფილი"}
            </h2>
            <div className="space-y-4">
              {DOMAINS.map((d) => (
                <DomainBar key={d} label={(en ? DOMAIN_LABELS_EN : DOMAIN_LABELS_KA)[d]} pct={ds[d] ?? 0} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <UnlockCard
              kind="iq"
              resultId={row.id}
              cost={CREDIT_COST.iqTest}
              balance={balance}
              title={am ? "Բացահայտեք Ձեր դատողության պրոֆիլը" : en ? "Unlock your reasoning profile" : "აზროვნების პროფილის გახსნა"}
              blurb={am ? "Տեսեք Ձեր ուժեղ կողմերը տրամաբանության, թվերի, տարածական դատողության և օրինաչափությունների մեջ։ Վճարեք մեկ անգամ և պահպանեք արդյունքը։" : en ? "See your strengths across logic, numbers, spatial reasoning and patterns. Pay once and keep the result." : "ნახე შენი ძლიერი მხარეები ოთხ დომენში — ლოგიკა, რიცხვები, სივრცე და პატერნები. გადაიხდი ერთხელ, შედეგი სამუდამოდ შენია."}
              locale={locale}
            />
          </div>
        )}

        {unlocked && <ProfileVisibilityToggle kind="iq" locale={locale} />}

        <NextTestWidget completed="iq" locale={locale} />

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/iq-testi">
              <RotateCcw className="size-4" />
              {am ? "Կրկնել թեստը" : en ? "Retake the test" : "ტესტის თავიდან გავლა"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
