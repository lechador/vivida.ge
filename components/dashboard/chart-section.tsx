import {
  Flame,
  Globe2,
  Home,
  Lightbulb,
  Sparkles,
  Triangle,
} from "lucide-react";

import { ensureChartFor } from "@/actions/chart";
import { ContentFeedback } from "@/components/analytics/content-feedback";
import { Accent } from "@/components/en/editorial";

import { AspectCards } from "./aspect-cards";
import { BigThreeCard } from "./big-three-card";
import { ChartWheelZoom } from "@/components/report/chart-wheel-zoom";
import { ElementsCard } from "./elements-card";
import { HouseCards } from "./house-cards";
import { PlanetCards } from "./planet-cards";
import { CollapsibleSection } from "@/components/report/collapsible-section";
import { ReportNav } from "@/components/report/report-nav";
import {
  PositionsTable,
  HousesTable,
} from "@/components/report/positions-table";
import { signByIndex } from "@/lib/zodiac";
import { buildEnglishChartInterpretation } from "@/lib/report-content-en";
import type { UserLocale } from "@/lib/i18n/user-locale";

export async function ChartSection({
  userId,
  locale = "ka",
}: {
  userId: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const chart = await ensureChartFor(userId);

  if (!chart) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        {en
          ? "Add your birth details to see your natal chart."
          : "შენი რუკის სანახავად, შეავსე დაბადების მონაცემები."}
      </div>
    );
  }

  const data = chart.data;
  const sun = data.bodies.sun;
  const moon = data.bodies.moon;
  const interp = en
    ? buildEnglishChartInterpretation(data)
    : (chart.interpretation ?? null);

  const ascSign = signByIndex(data.ascendant.signIndex);

  return (
    <div>
      {/* Sticky in-page navigation with scroll-spy */}
      <ReportNav locale={locale} />

      <div className="mt-10 space-y-10">
        {/* SECTION 01, Chart wheel hero (always expanded) */}
        <section id="wheel" className="scroll-mt-16 sm:scroll-mt-24">
          <article className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
                  01 · CELESTIAL HEMISPHERE
                </div>
                <h2
                  className={
                    en
                      ? "mt-2 font-display text-3xl font-medium tracking-[-0.01em] text-foreground sm:text-4xl"
                      : "mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                  }
                >
                  {en ? "Your sky " : "შენი ცის "}
                  {en ? (
                    <Accent>at birth</Accent>
                  ) : (
                    <span className="text-primary">მომენტი</span>
                  )}
                </h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {en
                    ? `The ecliptic horizon at the moment you were born. Your Ascendant rises in ${ascSign.labelEn}.`
                    : `ეკლიპტიკის ჰორიზონტი ზუსტად შენი დაბადების წამში. ამომავალი ნიშანი ${ascSign.labelKa}-შია.`}
                </p>

                {interp?.summary && (
                  <div className="mt-6 rounded-lg border border-border/80 bg-background/60 p-4">
                    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                      {en
                        ? "SYNTHESIS · ABOUT YOUR CHART"
                        : "სინთეზი · შენი რუკის შესახებ"}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {interp.summary}
                    </p>
                  </div>
                )}
              </div>
              <div className="order-1 mx-auto w-full max-w-[460px] lg:order-2">
                <ChartWheelZoom chart={data} locale={locale} />
              </div>
            </div>
          </article>
        </section>

        {/* Positions + houses, the scannable, clickable data layer */}
        <section id="positions" className="scroll-mt-16 sm:scroll-mt-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <h2 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
                02 · {en ? "Planetary Positions" : "პლანეტარული პოზიციები"}
              </h2>
              <PositionsTable chart={data} locale={locale} />
            </div>
            <div>
              <h2 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                03 · {en ? "House Cusps" : "სახლების კუსპიდები"}
              </h2>
              <div className="rounded-xl border border-border bg-card px-4 py-2 shadow-sm sm:px-5">
                <HousesTable chart={data} locale={locale} />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02, Big three (open by default) */}
        <CollapsibleSection
          id="big-three"
          icon={<Sparkles className="size-4.5" />}
          title={en ? "The big three" : "დიდი სამეული"}
          subtitle={
            en
              ? "Sun, Moon and Ascendant, your core pattern"
              : "მზე, მთვარე და ამომავალი, შენი ბირთვი"
          }
          defaultOpen
        >
          <div className="grid gap-3.5 lg:grid-cols-3">
            {sun && (
              <BigThreeCard
                kind="sun"
                point={sun}
                interpretation={interp?.bigThree?.sun}
                locale={locale}
              />
            )}
            {moon && (
              <BigThreeCard
                kind="moon"
                point={moon}
                interpretation={interp?.bigThree?.moon}
                locale={locale}
              />
            )}
            <BigThreeCard
              kind="ascendant"
              point={data.ascendant}
              interpretation={interp?.bigThree?.ascendant}
              locale={locale}
            />
          </div>
        </CollapsibleSection>

        {/* SECTION 03, Elements (open by default) */}
        <CollapsibleSection
          id="elements"
          icon={<Flame className="size-4.5" />}
          title={en ? "Elements" : "ელემენტები"}
          subtitle={
            en
              ? "The energies that carry the most weight in your chart"
              : "რომელი ენერგიები დომინირებენ შენს ცაში"
          }
          defaultOpen
        >
          <ElementsCard chart={data} locale={locale} />
        </CollapsibleSection>

        {/* Highlights */}
        {interp?.highlights && interp.highlights.length > 0 && (
          <CollapsibleSection
            id="highlights"
            icon={<Lightbulb className="size-4.5" />}
            title={en ? "What stands out" : "რა ვამჩნევთ შენს რუკაში"}
            subtitle={
              en
                ? "The patterns that carry special emphasis"
                : "ის ნაწილები, რომლებიც განსაკუთრებით გამოირჩევა"
            }
            defaultOpen
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              {interp.highlights.map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm sm:px-5"
                >
                  <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-[var(--vivida-gold)]">
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {h.body}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* SECTION 05, Planets */}
        <CollapsibleSection
          id="planets"
          icon={<Globe2 className="size-4.5" />}
          title={en ? "Planets" : "პლანეტები"}
          subtitle={
            en
              ? "Eight distinct functions working as one system"
              : "რვა პლანეტა, რვა ხასიათი, ერთად შენ ხარ"
          }
          defaultOpen
        >
          <PlanetCards
            chart={data}
            interpretations={interp?.planets}
            locale={locale}
          />
        </CollapsibleSection>

        {/* SECTION 06, Houses */}
        <CollapsibleSection
          id="houses"
          icon={<Home className="size-4.5" />}
          title={en ? "The 12 areas of life" : "ცხოვრების 12 სფერო"}
          subtitle={
            en
              ? "Where each part of your chart tends to show up"
              : "სად რა ენერგია ვლინდება შენს ცხოვრებაში"
          }
          defaultOpen
        >
          <HouseCards
            chart={data}
            interpretations={interp?.houses}
            locale={locale}
          />
        </CollapsibleSection>

        {/* SECTION 07, Aspects */}
        <CollapsibleSection
          id="aspects"
          icon={<Triangle className="size-4.5" />}
          title={en ? "Aspects" : "ასპექტები"}
          subtitle={
            en
              ? "How the planets in your chart interact"
              : "როგორ ელაპარაკებიან პლანეტები ერთმანეთს"
          }
          defaultOpen
        >
          <AspectCards
            chart={data}
            interpretations={interp?.aspects}
            locale={locale}
          />
        </CollapsibleSection>
      </div>
      <ContentFeedback surface="natal_report" locale={locale} />
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
            className="h-20 animate-pulse rounded-md border border-border bg-card"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-md border border-border bg-card" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-md border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
