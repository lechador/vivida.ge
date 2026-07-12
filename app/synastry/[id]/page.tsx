import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { ensureChartFor } from "@/actions/chart";
import {
  ensureSynastryInterpretation,
  getPartnerForViewer,
} from "@/lib/partners-core";
import { computeSynastry } from "@/lib/synastry";
import { getSynastryInterpretationsFor } from "@/lib/synastry-library";
import { canUseFeature } from "@/lib/features";
import { SYNASTRY_DEEP_PROMPT_VERSION } from "@/lib/openrouter";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SynastryDisplayLazy } from "@/components/profile/synastry-display-lazy";
import { SynastryDeepReport } from "@/components/synastry/synastry-deep-report";

export const metadata = { title: "თავსებადობა" };

export default async function SynastryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  const partner = await getPartnerForViewer(id, user.id);
  if (!partner) notFound();

  const viewerChart = await ensureChartFor(user.id, plan);
  if (!viewerChart) {
    return (
      <main className="relative isolate flex flex-1 flex-col overflow-hidden">
        <AppHeader authed plan={plan} active="synastry" />
        <section className="mx-auto w-full max-w-xl p-8 text-center text-sm text-muted-foreground">
          შენი რუკა ჯერ შედგენილი არ არის. ჯერ <Link href="/onboarding" className="underline">შეავსე დაბადების მონაცემები</Link>.
        </section>
      </main>
    );
  }

  // Cheap deterministic compute on every visit — keeps the result fresh
  // without a cache while we tune scoring.
  const synastry = computeSynastry(viewerChart.data, partner.chart);
  const synastryTexts = await getSynastryInterpretationsFor(synastry);

  // Ensure AI interpretation exists (lazy generation — first visit pays
  // the Gemini call, subsequent visits read the cached row).
  const partnerWithAi = await ensureSynastryInterpretation(partner, plan);
  const ai = partnerWithAi.aiInterpretation;

  // Deep report is cached on the partner row; show it if it's fresh for this
  // viewer + prompt version, otherwise the component offers to generate it.
  const deepStamp = `${viewerChart.inputHash}:v${SYNASTRY_DEEP_PROMPT_VERSION}`;
  const initialDeep =
    partnerWithAi.deepReport && partnerWithAi.deepViewerHash === deepStamp
      ? partnerWithAi.deepReport
      : null;

  const viewerName = user.name?.split(" ")[0] ?? null;

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.18_350/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_305/0.3),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <AppHeader authed plan={plan} active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <Link
          href="/synastry"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          ყველა პარტნიორი
        </Link>

        <h1 className="mb-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {viewerName ?? "შენ"}{" "}
          <span className="text-muted-foreground">და</span>{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {partner.name}
          </span>
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {partner.dateOfBirth} · {partner.cityName}
        </p>

        {ai && (
          <article className="mb-8 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-pink)]/12 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)]">
              <Sparkles className="size-4" aria-hidden />
              <span>AI-ს მცირე ნარატივი</span>
            </div>
            <p className="text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
              {ai.summary}
            </p>
            {(ai.strengths.length > 0 || ai.growth.length > 0) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ai.strengths.length > 0 && (
                  <div className="rounded-xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/5 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--vivida-cyan)]">
                      <span aria-hidden>✨</span>
                      <span>რას გაერთიანებთ</span>
                    </div>
                    <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
                      {ai.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span aria-hidden className="mt-0.5 text-[var(--vivida-cyan)]">
                            ◆
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.growth.length > 0 && (
                  <div className="rounded-xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/5 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--vivida-pink)]">
                      <span aria-hidden>⚡</span>
                      <span>სად არის ხახუნი</span>
                    </div>
                    <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
                      {ai.growth.map((g, i) => (
                        <li key={i} className="flex gap-2">
                          <span aria-hidden className="mt-0.5 text-[var(--vivida-pink)]">
                            ◆
                          </span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </article>
        )}

        <SynastryDisplayLazy
          result={synastry}
          partnerName={partner.name}
          interpretations={synastryTexts}
        />

        <SynastryDeepReport
          partnerId={partner.id}
          partnerName={partner.name}
          initial={initialDeep}
          canUse={canUseFeature("deepSynastry", plan)}
        />
      </section>
    </main>
  );
}
