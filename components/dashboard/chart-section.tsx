import {
  Flame,
  Globe2,
  Home,
  Lightbulb,
  Sparkles,
  Triangle,
} from "lucide-react";

import { ensureChartFor } from "@/actions/chart";

import { AspectCards } from "./aspect-cards";
import { BigThreeCard } from "./big-three-card";
import { ChartWheel } from "./chart-wheel";
import { ElementsCard } from "./elements-card";
import { HouseCards } from "./house-cards";
import { PlanetCards } from "./planet-cards";
import { LockedCard } from "@/components/paywall/locked-card";
import { CollapsibleSection } from "@/components/report/collapsible-section";
import { ReportNav } from "@/components/report/report-nav";
import { QuickStats } from "@/components/report/quick-stats";
import { canUseFeature } from "@/lib/features";
import type { PlanId } from "@/lib/pricing";
import { signByIndex } from "@/lib/zodiac";

/**
 * Static natal report content. Computes once per user (cached) and never
 * changes after — we render this on /report.
 */
export async function ChartSection({
  userId,
  plan,
}: {
  userId: string;
  plan: PlanId;
}) {
  const chart = await ensureChartFor(userId, plan);

  if (!chart) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        შენი რუკის სანახავად, შეავსე დაბადების მონაცემები.
      </div>
    );
  }

  const canSummary = canUseFeature("aiSummary", plan);
  const canHighlights = canUseFeature("aiHighlights", plan);

  const data = chart.data;
  const sun = data.bodies.sun;
  const moon = data.bodies.moon;
  const interp = chart.interpretation ?? null;

  const ascSign = signByIndex(data.ascendant.signIndex);

  return (
    <div>
      {/* Quick stats — clickable, opens modals */}
      <QuickStats chart={data} interpretations={interp ?? undefined} />

      {/* Sticky in-page navigation with scroll-spy */}
      <div className="mt-8">
        <ReportNav />
      </div>

      <div className="mt-10 space-y-10">
        {/* SECTION 01 — Chart wheel hero (always expanded) */}
        <section id="wheel" className="scroll-mt-16 sm:scroll-mt-24">
          <article className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 size-64 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
            />
            <div className="relative grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="order-2 sm:order-1">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  შენი ცის{" "}
                  <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                    მომენტი
                  </span>
                </h2>
                <p className="mt-3 max-w-md text-sm text-foreground/80">
                  ცა ზუსტად შენი დაბადების წამში. ამომავალი ნიშანი{" "}
                  {ascSign.labelKa}-შია.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.78_0.18_200/0.4)] bg-[oklch(0.78_0.18_200/0.1)] px-2.5 py-1 text-foreground/85">
                    <span aria-hidden>✨</span>
                    ჰარმონიული ბმები
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.22_350/0.4)] bg-[oklch(0.72_0.22_350/0.1)] px-2.5 py-1 text-foreground/85">
                    <span aria-hidden>⚡</span>
                    დაძაბული ბმები
                  </span>
                </div>
              </div>
              <div className="order-1 mx-auto w-full max-w-[480px] sm:order-2">
                <ChartWheel chart={data} />
              </div>
            </div>
          </article>
        </section>

        {/* AI summary — inline, between sections */}
        {canSummary && interp?.summary ? (
          <article
            id="summary"
            className="scroll-mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:scroll-mt-24 sm:p-6"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)]">
              <Sparkles className="size-4" aria-hidden />
              <span>შენი რუკის შესახებ</span>
            </div>
            <p className="text-lg leading-relaxed text-foreground/90">
              {interp.summary}
            </p>
          </article>
        ) : !canSummary ? (
          <LockedCard
            title="პერსონალური AI ანალიზი"
            preview="შენი რუკის ემოციური პორტრეტი, შექმნილი AI-ს მიერ შენი დიდი სამეულისა და პლანეტების განლაგების მიხედვით."
            description="გადადი Pro-ზე და ნახე შენი კოსმიური რუკის სრული ანალიზი."
          />
        ) : null}

        {/* SECTION 02 — Big three (open by default) */}
        <CollapsibleSection
          id="big-three"
          icon={<Sparkles className="size-5" />}
          title="დიდი სამეული"
          subtitle="მზე, მთვარე და ამომავალი — შენი ბირთვი"
          defaultOpen
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sun && (
              <BigThreeCard
                kind="sun"
                point={sun}
                interpretation={interp?.bigThree?.sun}
              />
            )}
            {moon && (
              <BigThreeCard
                kind="moon"
                point={moon}
                interpretation={interp?.bigThree?.moon}
              />
            )}
            <BigThreeCard
              kind="ascendant"
              point={data.ascendant}
              interpretation={interp?.bigThree?.ascendant}
            />
          </div>
        </CollapsibleSection>

        {/* SECTION 03 — Elements (open by default) */}
        <CollapsibleSection
          id="elements"
          icon={<Flame className="size-5" />}
          title="ელემენტები"
          subtitle="რომელი ენერგიები დომინირებენ შენს ცაში"
          defaultOpen
        >
          <ElementsCard chart={data} />
        </CollapsibleSection>

        {/* Highlights */}
        {canHighlights && interp?.highlights && interp.highlights.length > 0 && (
          <CollapsibleSection
            id="highlights"
            icon={<Lightbulb className="size-5" />}
            title="რა ვამჩნევთ შენს რუკაში"
            subtitle="ის ნაწილები, რომლებიც განსაკუთრებით გამოირჩევა"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interp.highlights.map((h, i) => (
                <article
                  key={i}
                  className="group rounded-2xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/75 hover:ring-foreground/15"
                >
                  <h3 className="mb-2 text-base font-semibold tracking-tight text-[var(--vivida-cyan)]">
                    {h.title}
                  </h3>
                  <p className="text-base leading-relaxed text-foreground/85">
                    {h.body}
                  </p>
                </article>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {!canHighlights && (
          <CollapsibleSection
            id="highlights"
            icon={<Lightbulb className="size-5" />}
            title="რა ვამჩნევთ შენს რუკაში"
          >
            <LockedCard
              title="რუკის უნიკალური აქცენტები"
              preview="მორიელის სამმაგი ძალა — შენი მზე, ვენერა და მერკური ერთ ნიშანშია."
              description="Pro ვერსიაში AI შენს რუკაში ყველაზე საინტერესო კავშირებს პოულობს."
              variant="tall"
            />
          </CollapsibleSection>
        )}

        {/* SECTION 05 — Planets */}
        <CollapsibleSection
          id="planets"
          icon={<Globe2 className="size-5" />}
          title="პლანეტები"
          subtitle="რვა პლანეტა, რვა ხასიათი — ერთად შენ ხარ"
        >
          <PlanetCards chart={data} interpretations={interp?.planets} />
        </CollapsibleSection>

        {/* SECTION 06 — Houses */}
        <CollapsibleSection
          id="houses"
          icon={<Home className="size-5" />}
          title="ცხოვრების 12 სფერო"
          subtitle="სად რა ენერგია ვლინდება შენს ცხოვრებაში"
        >
          <HouseCards chart={data} interpretations={interp?.houses} />
        </CollapsibleSection>

        {/* SECTION 07 — Aspects */}
        <CollapsibleSection
          id="aspects"
          icon={<Triangle className="size-5" />}
          title="ასპექტები"
          subtitle="როგორ ელაპარაკებიან პლანეტები ერთმანეთს"
        >
          <AspectCards chart={data} interpretations={interp?.aspects} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border/60 bg-card/40"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl border border-border/60 bg-card/40"
          />
        ))}
      </div>
    </div>
  );
}
