import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-helpers";
import { ensureChartFor } from "@/actions/chart";
import { ensureSynastryInterpretation } from "@/lib/partners-core";
import {
  ensureRelationshipWeeklyUpdate,
  getRelationshipParticipantNames,
  getRelationshipPartnerForViewer,
  getRelationshipSubscription,
  listRelationshipAnswers,
} from "@/lib/relationship-core";
import { computeSynastry } from "@/lib/synastry";
import { getSynastryInterpretationsFor } from "@/lib/synastry-library";
import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  countUnlocks,
  getBalance,
  isUnlocked,
  spendOnce,
} from "@/lib/credits";
import { SYNASTRY_DEEP_PROMPT_VERSION } from "@/lib/openrouter";
import { Starfield } from "@/components/landing/starfield";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { AppHeader } from "@/components/nav/app-header";
import { UnlockCard } from "@/components/credits/unlock-card";
import { SynastryTeaser } from "@/components/synastry/synastry-teaser";
import { SynastryDisplayLazy } from "@/components/profile/synastry-display-lazy";
import { SynastryDeepReport } from "@/components/synastry/synastry-deep-report";
import { SynastryDisplayEn } from "@/components/synastry/synastry-display-en";
import { RelationshipControls } from "@/components/synastry/relationship-controls";
import { RelationshipWeeklyCard } from "@/components/synastry/relationship-weekly-card";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "Compatibility" : "თავსებადობა",
    robots: { index: false },
  };
}

export default async function SynastryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const { id } = await params;
  const user = await requireUser();
  const partner = await getRelationshipPartnerForViewer(id, user.id);
  if (!partner) notFound();

  const isOwner = partner.userId === user.id;
  const participantNames = await getRelationshipParticipantNames(partner);
  const viewerName = participantNames.ownerName;
  const viewerChart = await ensureChartFor(partner.userId);
  if (!viewerChart) {
    return (
      <main
        lang={locale}
        className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background"
      >
        <AppHeader authed active="synastry" />
        <section className="mx-auto w-full max-w-xl p-8 text-center text-sm text-muted-foreground">
          {en
            ? "Your chart hasn't been created yet. "
            : "შენი რუკა ჯერ შედგენილი არ არის. ჯერ "}
          <Link href="/onboarding" className="text-primary underline">
            {en ? "Add your birth details" : "შეავსე დაბადების მონაცემები"}
          </Link>
          .
        </section>
      </main>
    );
  }

  let unlocked = await isUnlocked(partner.userId, partner.id, "spend_synastry");
  if (!unlocked && isOwner) {
    const used = await countUnlocks(partner.userId, "spend_synastry");
    if (used < FREE_ALLOWANCE.synastry) {
      await spendOnce(partner.userId, 0, "spend_synastry", partner.id);
      unlocked = true;
    }
  }

  if (!unlocked) {
    const balance = isOwner ? await getBalance(partner.userId) : 0;
    const teaserScores = isOwner
      ? computeSynastry(viewerChart.data, partner.chart)
      : null;
    return (
      <main
        lang={locale}
        className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background"
      >
        <Starfield count={48} />
        <AppHeader authed active="synastry" />
        <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
          <Link
            href="/synastry"
            className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            {en ? "All partners" : "ყველა პარტნიორი"}
          </Link>

          <header className="mb-6 border-b border-border pb-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-pink)]">
              SYNASTRY SPECIMEN · LOCKED DOSSIER
            </div>
            <h1
              className={
                en
                  ? "mt-2 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
                  : "mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              }
            >
              {viewerName ?? (en ? "You" : "შენ")}{" "}
              <span className="text-muted-foreground">×</span>{" "}
              <span className="text-[var(--vivida-pink)]">{partner.name}</span>
            </h1>
            <p className="mt-1.5 font-mono text-xs tabular-nums text-muted-foreground">
              {partner.dateOfBirth} · {partner.cityName}
            </p>
          </header>

          {isOwner ? (
            <>
              {teaserScores && (
                <SynastryTeaser result={teaserScores} locale={locale} />
              )}
              <UnlockCard
                kind="synastry"
                resultId={partner.id}
                cost={CREDIT_COST.synastry}
                balance={balance}
                title={
                  en
                    ? "Unlock your compatibility reading"
                    : "თქვენი თავსებადობის გახსნა"
                }
                blurb={
                  en
                    ? "See the complete synastry reading, key aspects, strengths, and points of friction. Pay once and this partner remains unlocked."
                    : "ნახე სრული სინასტრია, ასპექტები, ძლიერი მხარეები და ხახუნის წერტილები. გადაიხდი ერთხელ, ეს პარტნიორი სამუდამოდ გახსნილია."
                }
                locale={locale}
              />
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
              {en
                ? "The relationship owner needs to unlock this reading first."
                : "ამ თავსებადობის შედეგი ჯერ ურთიერთობის მფლობელმა უნდა გახსნას."}
            </div>
          )}
        </section>
      </main>
    );
  }

  const synastry = computeSynastry(viewerChart.data, partner.chart);
  const synastryTexts = await getSynastryInterpretationsFor(synastry, locale);
  const partnerWithAi = await ensureSynastryInterpretation(partner, locale);
  const ai = partnerWithAi.aiInterpretation;

  const [weekly, subscription] = await Promise.all([
    ensureRelationshipWeeklyUpdate(partnerWithAi, locale),
    getRelationshipSubscription(partner.id, user.id),
  ]);
  const answers = weekly
    ? await listRelationshipAnswers(partner.id, user.id, weekly.weekStart)
    : [];

  const deepStamp = `${viewerChart.inputHash}:${locale}:v${SYNASTRY_DEEP_PROMPT_VERSION}`;
  const initialDeep =
    partnerWithAi.deepReport && partnerWithAi.deepViewerHash === deepStamp
      ? partnerWithAi.deepReport
      : null;

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <Link
          href="/synastry"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          {en ? "All partners" : "ყველა პარტნიორი"}
        </Link>

        <header className="mb-8 border-b border-border pb-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-pink)]">
            RELATIONAL EPHEMERIS · SYNASTRY DOSSIER
          </div>
          <h1
            className={
              en
                ? "mt-2 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl"
                : "mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
            }
          >
            {viewerName ?? (en ? "You" : "შენ")}{" "}
            <span className="text-muted-foreground">×</span>{" "}
            <span className="text-[var(--vivida-pink)]">{partner.name}</span>
          </h1>
          <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
            {partner.dateOfBirth} · {partner.cityName}
          </p>
        </header>

        <RelationshipControls
          partnerId={partner.id}
          partnerName={partner.name}
          isOwner={isOwner}
          connected={Boolean(partner.linkedUserId)}
          initialSubscription={subscription}
          locale={locale}
        />

        {weekly && (
          <RelationshipWeeklyCard
            partnerId={partner.id}
            weekly={weekly}
            answers={answers}
            currentUserId={user.id}
            connected={Boolean(partner.linkedUserId)}
            locale={locale}
          />
        )}

        {ai && (
          <article className="relative mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <CornerCrosshair position="tl" />
            <CornerCrosshair position="tr" />
            <CornerCrosshair position="bl" />
            <CornerCrosshair position="br" />

            <div className="border-b border-border bg-background/70 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--vivida-pink)]">
                <Sparkles className="size-3.5" aria-hidden />
                <span>
                  {en
                    ? "SYNTHESIS · RELATIONAL NARRATIVE"
                    : "სინთეზი · ურთიერთობის ნარატივი"}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
                {ai.summary}
              </p>

              {(ai.strengths.length > 0 || ai.growth.length > 0) && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {ai.strengths.length > 0 && (
                    <div className="rounded-lg border border-border bg-background/75 p-4 sm:p-5">
                      <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
                        {en
                          ? "HARMONIC CONVERGENCE · STRENGTHS"
                          : "ჰარმონიული გადაკვეთა · რას გაერთიანებთ"}
                      </div>
                      <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                        {ai.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              aria-hidden
                              className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--vivida-cyan)]"
                            />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ai.growth.length > 0 && (
                    <div className="rounded-lg border border-border bg-background/75 p-4 sm:p-5">
                      <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                        {en
                          ? "DYNAMIC TENSION · GROWTH POINTS"
                          : "დინამიკური კვანძი · სად არის ხახუნი"}
                      </div>
                      <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                        {ai.growth.map((g, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              aria-hidden
                              className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--vivida-gold)]"
                            />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        )}

        {en ? (
          <SynastryDisplayEn result={synastry} partnerName={partner.name} />
        ) : (
          <SynastryDisplayLazy
            result={synastry}
            partnerName={partner.name}
            interpretations={synastryTexts}
          />
        )}

        <SynastryDeepReport
          partnerId={partner.id}
          partnerName={partner.name}
          initial={initialDeep}
          locale={locale}
        />
      </section>
    </main>
  );
}
