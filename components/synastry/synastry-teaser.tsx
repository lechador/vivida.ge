import { Lock } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_LABEL_KA,
  ELEMENT_LABEL_KA,
  overallVerdict,
  type ChartElement,
  type SynastryResult,
} from "@/lib/synastry";
import {
  CATEGORY_LABEL_EN,
  ELEMENT_LABEL_EN,
  overallVerdictEn,
} from "@/lib/synastry-en";
import { overallNarrative } from "@/lib/synastry-interpretation";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Static filler for the locked rows. Never derived from `result`: the page
 * source is readable by anyone, so a blurred row may only hold this string.
 */
const LOCKED_PLACEHOLDER_EN =
  "The full interpretation of this section opens with the complete reading.";
const LOCKED_PLACEHOLDER_KA =
  "ამ სექციის სრული ანალიზი სრული კითხვის გახსნასთან ერთად გამოჩნდება.";

/** What the paid reading answers, stated as a promise rather than a category. */
const LOCKED_TITLES_EN = [
  "Emotional & intimate attraction (Venus–Mars aspect)",
  "Your main friction point: what could pull you apart?",
  "Karmic bond & 2026 forecast for this relationship",
] as const;

const LOCKED_TITLES_KA = [
  "ემოციური და ინტიმური მიზიდულობა (ვენერა–მარსის ასპექტი)",
  "თქვენი მთავარი კონფლიქტის წერტილი: რამ შეიძლება დაგაშოროთ?",
  "კარმული კავშირი და 2026 წლის პროგნოზი ამ ურთიერთობისთვის",
] as const;

/** Same element, or the two elements that share a polarity (fire/air, earth/water). */
const ELEMENT_PARTNER: Record<ChartElement, ChartElement> = {
  fire: "air",
  air: "fire",
  earth: "water",
  water: "earth",
};

type ElementRelation = "same" | "flow" | "tension";

function elementRelation(a: ChartElement, b: ChartElement): ElementRelation {
  if (a === b) return "same";
  if (ELEMENT_PARTNER[a] === b) return "flow";
  return "tension";
}

/** Georgian genitive, so "ცეცხლის მთვარე" reads correctly inside a sentence. */
const ELEMENT_GENITIVE_KA: Record<ChartElement, string> = {
  fire: "ცეცხლის",
  earth: "მიწის",
  air: "ჰაერის",
  water: "წყლის",
};

/** What each Moon element needs in order to feel safe, stated as a noun list. */
const MOON_NEED_EN: Record<ChartElement, string> = {
  fire: "movement, warmth, and a direct answer",
  earth: "routine, touch, and promises actually kept",
  air: "conversation, space, and curiosity",
  water: "tenderness, silence, and being held",
};

const MOON_NEED_KA: Record<ChartElement, string> = {
  fire: "მოძრაობა, სითბო და პირდაპირი პასუხი",
  earth: "რუტინა, შეხება და შესრულებული დაპირება",
  air: "საუბარი, სივრცე და ცნობისმოყვარეობა",
  water: "სინაზე, სიჩუმე და ჩახუტება",
};

function sunLineEn(
  a: ChartElement,
  b: ChartElement,
  label: Record<ChartElement, string>,
): string {
  const rel = elementRelation(a, b);
  if (rel === "same") {
    return `Sun to Sun, ${label[a]} meets ${label[b]}: the same reflex and the same instinct about how a life should be lived, so you recognise each other fast.`;
  }
  if (rel === "flow") {
    return `Sun to Sun, ${label[a]} meets ${label[b]}: one of you brings the spark, the other gives it room, and the rhythm between you is unusually easy.`;
  }
  return `Sun to Sun, ${label[a]} meets ${label[b]}: you want different things from the same moment, and that angle is exactly where the pull starts.`;
}

function moonLineEn(
  a: ChartElement,
  b: ChartElement,
  label: Record<ChartElement, string>,
  need: Record<ChartElement, string>,
): string {
  const rel = elementRelation(a, b);
  if (rel === "same") {
    return `Moon to Moon, you both run on ${label[a]}: you each feel safe with ${need[a]}.`;
  }
  if (rel === "flow") {
    return `Moon to Moon, ${label[a]} and ${label[b]} feed each other: ${need[a]} on one side, ${need[b]} on the other, and neither of you has to translate.`;
  }
  return `Moon to Moon, ${label[a]} and ${label[b]} soothe themselves differently: ${need[a]} on one side, ${need[b]} on the other, so comfort has to be learned, not assumed.`;
}

function sunLineKa(
  a: ChartElement,
  b: ChartElement,
  label: Record<ChartElement, string>,
): string {
  const rel = elementRelation(a, b);
  if (rel === "same") {
    return `მზე-მზეს: ${label[a]} და ${label[b]}, ერთი და იმავე რეფლექსი და ერთი და იმავე წარმოდგენა იმაზე, როგორ უნდა იცხოვრო, ამიტომ ერთმანეთს სწრაფად ცნობთ.`;
  }
  if (rel === "flow") {
    return `მზე-მზეს: ${label[a]} და ${label[b]}, ერთი ნაპერწკალს იძლევა, მეორე მას სუნთქვის ადგილს უტოვებს, რიტმი თქვენ შორის უჩვეულოდ მარტივია.`;
  }
  return `მზე-მზეს: ${label[a]} და ${label[b]}, ერთი და იმავე მომენტიდან სხვადასხვას გინდათ, და სწორედ ეს კუთხე ქმნის მიზიდულობას.`;
}

function moonLineKa(
  a: ChartElement,
  b: ChartElement,
  genitive: Record<ChartElement, string>,
  need: Record<ChartElement, string>,
): string {
  const rel = elementRelation(a, b);
  if (rel === "same") {
    return `მთვარე-მთვარეს: ორივეს ${genitive[a]} მთვარე გაქვთ, ამიტომ ერთსა და იმავეს გჭირდებათ: ${need[a]}.`;
  }
  if (rel === "flow") {
    return `მთვარე-მთვარეს: ${genitive[a]}ა და ${genitive[b]} მთვარეები ერთმანეთს კვებავს, ერთს სჭირდება ${need[a]}, მეორეს ${need[b]}, და არც ერთს არ უწევს თარგმნა.`;
  }
  return `მთვარე-მთვარეს: ${genitive[a]}ა და ${genitive[b]} მთვარეები სხვანაირად ნუგეშინდებიან, ერთს სჭირდება ${need[a]}, მეორეს ${need[b]}, ამიტომ სიმშვიდე ერთმანეთისგან უნდა ისწავლოთ და არა ვივარაუდოთ.`;
}

export function SynastryTeaser({
  result,
  locale,
}: {
  result: SynastryResult;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const verdict = en
    ? overallVerdictEn(result.overall)
    : overallVerdict(result.overall);
  const elementLabel = en ? ELEMENT_LABEL_EN : ELEMENT_LABEL_KA;

  // Deterministic, no AI call: the free 30% has to be real insight, not a
  // countdown. Elements come straight from the computed result.
  const { sunA, sunB, moonA, moonB } = result.elements;
  const sunLine = en
    ? sunLineEn(sunA, sunB, elementLabel)
    : sunLineKa(sunA, sunB, elementLabel);
  const moonLine = en
    ? moonLineEn(moonA, moonB, elementLabel, MOON_NEED_EN)
    : moonLineKa(moonA, moonB, ELEMENT_GENITIVE_KA, MOON_NEED_KA);
  const overallLine = overallNarrative(result.overall, locale);
  const lockedTitles = en ? LOCKED_TITLES_EN : LOCKED_TITLES_KA;
  const lockedPlaceholder = en ? LOCKED_PLACEHOLDER_EN : LOCKED_PLACEHOLDER_KA;

  return (
    <div className="relative mb-6 overflow-hidden rounded-sm border border-border bg-card p-5 sm:p-6">
      <CornerCrosshair position="tl" />
      <CornerCrosshair position="tr" />
      <CornerCrosshair position="bl" />
      <CornerCrosshair position="br" />

      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
        {en ? "SYNASTRY INDEX · PREVIEW" : "თავსებადობის ინდექსი · მიმოხილვა"}
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="font-mono text-5xl font-semibold tabular-nums tracking-tight text-primary">
            {result.overall}
            <span className="text-xl font-normal text-muted-foreground">%</span>
          </div>
          <p className="mt-1 text-base font-medium text-foreground/90">
            {verdict}
          </p>
        </div>
        <div className="space-y-1 font-mono text-xs text-foreground/85">
          <p>
            ☉ {elementLabel[result.elements.sunA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
            {elementLabel[result.elements.sunB]}
          </p>
          <p>
            ☽ {elementLabel[result.elements.moonA]}
            <span className="mx-1.5 text-muted-foreground">↔</span>
            {elementLabel[result.elements.moonB]}
          </p>
        </div>
      </div>

      <section className="mt-5 border-t border-border pt-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--vivida-pink)]">
          {en
            ? "SUN–MOON CONNECTION · FREE TEASER"
            : "მზე–მთვარის კავშირი · უფასო მიმოხილვა"}
        </div>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/90">
          {sunLine} {moonLine}{" "}
          <span className="text-foreground/75">{overallLine}</span>
        </p>
      </section>

      <div aria-hidden className="mt-5 space-y-2.5 select-none blur-[5px]">
        {CATEGORIES.map((cat) => {
          const score = result.scores[cat];
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-foreground/85">
                {en ? CATEGORY_LABEL_EN[cat] : CATEGORY_LABEL_KA[cat]}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-foreground/85">
                {score}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-border pt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Lock className="size-3.5 text-primary" />
        {en
          ? "Key aspects, strengths and friction points unlock below"
          : "მთავარი ასპექტები, ძლიერი მხარეები და ხახუნის წერტილები ქვემოთ გაიხსნება"}
      </p>

      <ul className="mt-3 space-y-2">
        {lockedTitles.map((title) => (
          <li
            key={title}
            className="rounded-sm border border-border/80 bg-background/40 px-3 py-2.5"
          >
            <div className="flex items-start gap-2">
              <span className="shrink-0 pt-0.5">
                <Lock className="size-4 text-[var(--vivida-pink)]" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-foreground">
                  {title}
                </p>
                <p
                  aria-hidden
                  className="mt-1 select-none text-xs leading-relaxed text-foreground/70 blur-[5px]"
                >
                  {lockedPlaceholder}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
