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
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  სექცია 01 · ნატალური რუკა
                </div>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  შენი ცის{" "}
                  <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
                    მომენტი
                  </span>
                </h2>
                <p className="mt-3 max-w-md text-sm text-foreground/80">
                  ცა ზუსტად შენი დაბადების წამში. ამომავალი ნიშანი{" "}
                  {ascSign.labelKa}-შია.
                </p>
                <ul className="mt-5 space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-px w-6 bg-[oklch(0.78_0.18_200)]" />
                    სამკუთხა · სექსტილი (ჰარმონიული)
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className="inline-block h-px w-6 bg-[oklch(0.72_0.22_350)]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, oklch(0.72 0.22 350) 50%, transparent 50%)",
                        backgroundSize: "6px 1px",
                      }}
                    />
                    კვადრატი · ოპოზიცია (დაძაბულობა)
                  </li>
                </ul>
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
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--vivida-violet)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                AI ანალიზი
              </span>
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
          number="02"
          icon={<Sparkles className="size-5" />}
          title="დიდი სამეული"
          subtitle="მზე · მთვარე · ამომავალი — შენი ბირთვი"
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
          number="03"
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
            number="04"
            icon={<Lightbulb className="size-5" />}
            title="მნიშვნელოვანი შტრიხები"
            subtitle="რუკის ის ნაწილები, რომელთაც გამოვყოფდით"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interp.highlights.map((h, i) => (
                <article
                  key={i}
                  className="group rounded-2xl border border-border bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/75 hover:ring-foreground/15"
                >
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--vivida-cyan)]">
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
            number="04"
            icon={<Lightbulb className="size-5" />}
            title="მნიშვნელოვანი შტრიხები"
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
          number="05"
          icon={<Globe2 className="size-5" />}
          title="პლანეტები"
          subtitle="მერკური · ვენერა · მარსი · იუპიტერი · სატურნი · ურანი · ნეპტუნი · პლუტონი"
        >
          <PlanetCards chart={data} interpretations={interp?.planets} />
        </CollapsibleSection>

        {/* SECTION 06 — Houses */}
        <CollapsibleSection
          id="houses"
          number="06"
          icon={<Home className="size-5" />}
          title="12 სახლი"
          subtitle="ცხოვრების სფეროები — სად ვლინდება ენერგია"
        >
          <HouseCards chart={data} interpretations={interp?.houses} />
        </CollapsibleSection>

        {/* SECTION 07 — Aspects */}
        <CollapsibleSection
          id="aspects"
          number="07"
          icon={<Triangle className="size-5" />}
          title="ასპექტები"
          subtitle="როგორ ესაუბრებიან პლანეტები ერთმანეთს"
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
