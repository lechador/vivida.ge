"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { UserLocale } from "@/lib/i18n/locale";

import { SIGNS, signColor, type ZodiacSign } from "@/lib/zodiac";
import type { CalcPair, CalcSign } from "@/lib/compatibility-calculator-data";
import { SignInButton } from "./sign-in-button";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

type ElementEn = "fire" | "earth" | "air" | "water";

/** The zodiac catalogue stores elements in Georgian; pairKey works in English. */
const ELEMENT_EN: Record<ZodiacSign["element"], ElementEn> = {
  ცეცხლი: "fire",
  მიწა: "earth",
  ჰაერი: "air",
  წყალი: "water",
};

type ElementPairKey =
  | "fire-fire"
  | "earth-earth"
  | "air-air"
  | "water-water"
  | "fire-air"
  | "earth-water"
  | "fire-earth"
  | "fire-water"
  | "earth-air"
  | "air-water";

function pairKey(a: ElementEn, b: ElementEn): ElementPairKey {
  const normA = a.toLowerCase() as "fire" | "earth" | "air" | "water";
  const normB = b.toLowerCase() as "fire" | "earth" | "air" | "water";
  if (normA === normB) return `${normA}-${normB}` as ElementPairKey;
  const order = ["fire", "earth", "air", "water"] as const;
  const [first, second] =
    order.indexOf(normA) < order.indexOf(normB)
      ? [normA, normB]
      : [normB, normA];
  return `${first}-${second}` as ElementPairKey;
}

const ELEMENT_SUMMARIES: Record<
  ElementPairKey,
  {
    score: number;
    headlineKa: string;
    headlineEn: string;
    headlinePl: string;
    bodyKa: string;
    bodyEn: string;
    bodyPl: string;
  }
> = {
  "fire-fire": {
    score: 86,
    headlineKa: "მაღალი ენერგია და პირდაპირი მუხტი",
    headlineEn: "High-voltage momentum and shared candor",
    headlinePl: "Wysoka energia i bezpośrednia dynamika",
    bodyKa:
      "ორივე ცეცხლის ნიშანი სწრაფად იღებს გადაწყვეტილებას და აფასებს პირდაპირობას. ურთიერთობა დინამიკურია, თუმცა საჭიროებს სივრცეს ორივე ლიდერისთვის.",
    bodyEn:
      "Two fire signs move fast, speak plainly, and ignite shared projects immediately. The bond thrives when both leave room for independent initiative.",
    bodyPl:
      "Dwa znaki ognia działają szybko, cenią szczerość i natychmiast rozpalają wspólne projekty. Związek kwitnie, gdy oboje mają przestrzeń na niezależność.",
  },
  "earth-earth": {
    score: 89,
    headlineKa: "მყარი საყრდენი და გრძელვადიანი სანდოობა",
    headlineEn: "Grounded architecture and enduring trust",
    headlinePl: "Stabilny fundament i trwałe zaufanie",
    bodyKa:
      "მიწის ორი ნიშანი ქმნის სტაბილურ, პრაქტიკულ და ერთგულ კავშირს. გადაწყვეტილებები მიიღება მშვიდად, ხოლო ნდობა დროსთან ერთად ღრმავდება.",
    bodyEn:
      "Two earth signs build deliberate, dependable structures together. Trust compounds steadily through action rather than grand declarations.",
    bodyPl:
      "Dwa znaki ziemi budują bezpieczną, lojalną i praktyczną relację. Zaufanie rośnie spokojnie i pogłębia się z czasem.",
  },
  "air-air": {
    score: 85,
    headlineKa: "ინტელექტუალური სინქრონი და დიალოგი",
    headlineEn: "Intellectual resonance and effortless dialogue",
    headlinePl: "Intelektualna synchronizacja i dialog",
    bodyKa:
      "ჰაერის ნიშნებს შორის კავშირი იწყება საუბრით, იდეებითა და საერთო ცნობისმოყვარეობით. მნიშვნელოვანია ემოციური სიღრმის შენარჩუნება.",
    bodyEn:
      "Air signs connect through ideas, curiosity, and rapid conversation. Grounding intellectual rapport in emotional presence keeps the bond resilient.",
    bodyPl:
      "Znaki powietrza łączą idee, ciekawość i niekończące się rozmowy. Ugruntowanie więzi w emocjonalnej bliskości daje trwałość.",
  },
  "water-water": {
    score: 91,
    headlineKa: "ღრმა ინტუიციური და ემოციური რეზონანსი",
    headlineEn: "Deep intuitive and emotional attunement",
    headlinePl: "Głęboka intuicja i rezonans emocjonalny",
    bodyKa:
      "წყლის ორი ნიშანი უსიტყვოდ გრძნობს ერთმანეთის მდგომარეობას. კავშირი ღრმა და დამცავია, როცა საზღვრები მკაფიოდ რჩება.",
    bodyEn:
      "Two water signs read one another without explanation. The connection feels deeply protective when healthy emotional boundaries are maintained.",
    bodyPl:
      "Dwa znaki wody czują się bez słów. Więź jest niezwykle głęboka i opiekuńcza, o ile zachowane są zdrowe granice.",
  },
  "fire-air": {
    score: 92,
    headlineKa: "ბუნებრივი სინერგია: იდეა და მოქმედება",
    headlineEn: "Natural synergy: spark meets perspective",
    headlinePl: "Naturalna synergia: idea spotyka działanie",
    bodyKa:
      "ჰაერი აძლევს ცეცხლს მასშტაბს და ახალ ჰორიზონტს, ხოლო ცეცხლი იდეებს მოქმედებად აქცევს. ერთ-ერთი ყველაზე ცოცხალი ასტროლოგიური კომბინაცია.",
    bodyEn:
      "Air feeds Fire with perspective while Fire turns Air's concepts into momentum—one of the most naturally vital pairings in the zodiac.",
    bodyPl:
      "Powietrze nadaje ogniu rozmach i perspektywę, a ogień zamienia idee w czyn. To jedno z najbardziej ożywczych połączeń zodiaku.",
  },
  "earth-water": {
    score: 90,
    headlineKa: "ნაყოფიერი ბალანსი: სტრუქტურა და ემპათია",
    headlineEn: "Fertile equilibrium: structure meets depth",
    headlinePl: "Płodna równowaga: struktura i empatia",
    bodyKa:
      "მიწა ქმნის უსაფრთხო კალაპოტს წყლის ემოციური სიღრმისთვის, ხოლო წყალი ურთიერთობას სითბოსა და ინტუიციას მატებს.",
    bodyEn:
      "Earth provides a steady vessel for Water's emotional depth, while Water brings warmth and intuitive nuance to Earth's pragmatism.",
    bodyPl:
      "Ziemia tworzy bezpieczne koryto dla emocjonalnej głębi wody, a woda wnosi ciepło i intuicję w pragmatyzm ziemi.",
  },
  "fire-earth": {
    score: 76,
    headlineKa: "ხედვისა და რეალიზაციის კავშირი",
    headlineEn: "Vision paired with material execution",
    headlinePl: "Połączenie wizji i realizacji",
    bodyKa:
      "ცეცხლს შემოაქვს ინიციატივა და იმპულსი, მიწას კი — სისტემა და გამძლეობა. ტემპის შეთანხმებისას ეს წყვილი ძლიერ შედეგს დებს.",
    bodyEn:
      "Fire brings initiative and boldness; Earth brings method and staying power. Respecting each other's tempo turns contrast into strength.",
    bodyPl:
      "Ogień wnosi inicjatywę i odwagę, a ziemia metodę i wytrwałość. Szacunek dla odmiennego tempa zamienia różnice w siłę.",
  },
  "fire-water": {
    score: 74,
    headlineKa: "კონტრასტული მიზიდულობა: სითბო და სიღრმე",
    headlineEn: "Magnetic contrast: intensity and sensitivity",
    headlinePl: "Magnetyczny kontrast: żar i wrażliwość",
    bodyKa:
      "ცეცხლის პირდაპირობა და წყლის ემოციური სიღრმე ძლიერ მიზიდულობას ქმნის. წარმატების გასაღები ერთმანეთის ტემპერამენტის პატივისცემაა.",
    bodyEn:
      "Fire's directness and Water's sensitivity create unmistakable magnetism. Patience with differing emotional rhythms unlocks deep growth.",
    bodyPl:
      "Bezpośredniość ognia i wrażliwość wody tworzą silne przyciąganie. Cierpliwość wobec odmiennych rytmów emocjonalnych pozwala na wielki rozwój.",
  },
  "earth-air": {
    score: 77,
    headlineKa: "პრაგმატიზმისა და კონცეფციის გადაკვეთა",
    headlineEn: "Pragmatism intersecting with conceptual clarity",
    headlinePl: "Przecięcie pragmatyzmu z koncepcją",
    bodyKa:
      "ჰაერი ხედავს ვარიანტებს, მიწა კი ამოწმებს მათ რეალურობას. ერთად ისინი აერთიანებენ თეორიასა და პრაქტიკულ შედეგს.",
    bodyEn:
      "Air maps possibilities while Earth tests them against reality. Together they bridge abstract strategy and tangible execution.",
    bodyPl:
      "Powietrze dostrzega możliwości, a ziemia weryfikuje ich realność. Razem łączą abstrakcyjne plany z namacalnymi efektami.",
  },
  "air-water": {
    score: 78,
    headlineKa: "აზრისა და ინტუიციის დიალოგი",
    headlineEn: "Dialogue between intellect and intuition",
    headlinePl: "Dialog intelektu z intuicją",
    bodyKa:
      "ჰაერი აანალიზებს და სიტყვებში აქცევს იმას, რასაც წყალი ინტუიციურად გრძნობს. ეს კავშირი ორივეს ხედვას აფართოებს.",
    bodyEn:
      "Air articulates what Water senses intuitively. When curiosity replaces assumptions, both partners expand their emotional vocabulary.",
    bodyPl:
      "Powietrze ubiera w słowa to, co woda wyczuwa intuicyjnie. Ciekawość i brak założeń wzbogacają wzajemny język emocji.",
  },
};

export function CompatibilityCalculator({
  signs,
  pairs,
  locale = "ka",
}: {
  signs?: CalcSign[];
  pairs?: Record<string, CalcPair>;
  locale?: UserLocale;
}) {
  const isPl = locale === "pl";
  const en = locale === "en";
  const [signA, setSignA] = useState<number>(0); // Aries
  const [signB, setSignB] = useState<number>(6); // Libra

  const a = SIGNS[signA] ?? SIGNS[0];
  const b = SIGNS[signB] ?? SIGNS[6];
  const key = pairKey(ELEMENT_EN[a.element], ELEMENT_EN[b.element]);
  const summary = ELEMENT_SUMMARIES[key];
  const sameSignBonus = signA === signB ? 2 : 0;
  const oppositionBonus = Math.abs(signA - signB) === 6 ? 3 : 0;

  const slugA = signs?.[signA]?.slug;
  const slugB = signs?.[signB]?.slug;
  const matchedPair =
    slugA && slugB && pairs
      ? (pairs[`${slugA}-${slugB}`] ?? pairs[`${slugB}-${slugA}`])
      : undefined;

  const score = matchedPair
    ? matchedPair.percent
    : Math.min(98, summary.score + sameSignBonus + oppositionBonus);
  const angularDistance = Math.abs(signA - signB) * 30;
  const normalizedAngle =
    angularDistance > 180 ? 360 - angularDistance : angularDistance;

  return (
    <section
      aria-labelledby="compat-calc-heading"
      className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] p-4 shadow-md sm:p-6">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left 5 cols: Controls */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--vivida-pink)]">
                <span className="inline-block h-px w-5 bg-[var(--vivida-pink)]/70" />
                {isPl
                  ? "INSTRUMENT SYNASTRII · TEST NA ŻYWO"
                  : en
                    ? "SYNASTRY INSTRUMENT · LIVE PREVIEW"
                    : "სინასტრიის ინსტრუმენტი · სწრაფი ტესტი"}
              </div>
              <h2
                id="compat-calc-heading"
                className={
                  en || isPl
                    ? "mt-2 text-balance font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
                    : "mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                }
              >
                {isPl
                  ? "Sprawdź dopasowanie znaków zodiaku"
                  : en
                    ? "Test solar sign resonance"
                    : "შეამოწმე ნიშნების თავსებადობა"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isPl
                  ? "Wybierz dwa znaki zodiaku, aby sprawdzić ich harmonię żywiołów i odległość kątową. Pełna synastria porównuje wszystkie 10 planet i domy."
                  : en
                    ? "Select two solar signs to inspect their elemental harmonic and angular distance. Full synastry compares all 10 planets and house overlays."
                    : "აირჩიე ორი ზოდიაქოს ნიშანი საბაზისო ელემენტური რეზონანსის სანახავად. სრული სინასტრია ადარებს ორივე რუკის ყველა პლანეტასა და სახლს."}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <label
                    htmlFor="compat-sign-a"
                    className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {isPl
                      ? "PIERWSZY KOSMOGRAM (SŁOŃCE)"
                      : en
                        ? "FIRST NATAL CHART (SUN)"
                        : "პირველი ნიშანი (მზე)"}
                  </label>
                  <select
                    id="compat-sign-a"
                    value={signA}
                    onChange={(e) => setSignA(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground focus:border-primary lg:text-sm focus:outline-none"
                  >
                    {SIGNS.map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.symbol}{" "}
                        {isPl ? s.labelPl : en ? s.labelEn : s.labelKa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="compat-sign-b"
                    className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {isPl
                      ? "DRUGI KOSMOGRAM (SŁOŃCE)"
                      : en
                        ? "SECOND NATAL CHART (SUN)"
                        : "მეორე ნიშანი (მზე)"}
                  </label>
                  <select
                    id="compat-sign-b"
                    value={signB}
                    onChange={(e) => setSignB(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground focus:border-primary lg:text-sm focus:outline-none"
                  >
                    {SIGNS.map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.symbol}{" "}
                        {isPl ? s.labelPl : en ? s.labelEn : s.labelKa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {isPl
                ? `ODLEGŁOŚĆ KĄTOWA · ŁUK ${normalizedAngle}°`
                : `ANGULAR SEPARATION · ${normalizedAngle}° ARC`}
            </div>
          </div>

          {/* Right 7 cols: Readout */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-[var(--vivida-pink)]/35 bg-gradient-to-br from-[var(--vivida-pink)]/10 via-card to-primary/10 p-6 shadow-sm sm:p-8 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-lg border border-border bg-background/80 text-xl"
                    style={{ color: signColor(a) }}
                  >
                    {`${a.symbol}︎`}
                  </span>
                  <span className="font-mono text-xs text-[var(--vivida-pink)]">
                    ×
                  </span>
                  <span
                    className="grid size-11 place-items-center rounded-lg border border-border bg-background/80 text-xl"
                    style={{ color: signColor(b) }}
                  >
                    {`${b.symbol}︎`}
                  </span>
                  <div className="ml-1">
                    <div className="text-base font-semibold text-foreground">
                      {isPl
                        ? `${a.labelPl} i ${b.labelPl}`
                        : en
                          ? `${a.labelEn} & ${b.labelEn}`
                          : `${a.labelKa} და ${b.labelKa}`}
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {a.element.toUpperCase()} · {b.element.toUpperCase()} ·{" "}
                      {normalizedAngle}°
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {matchedPair
                      ? matchedPair.score
                      : isPl
                        ? "INDEKS HARMONII"
                        : en
                          ? "HARMONIC INDEX"
                          : "ჰარმონიული ინდექსი"}
                  </div>
                  <div className="font-mono text-3xl font-semibold tabular-nums text-[var(--vivida-pink)]">
                    {score}%
                  </div>
                </div>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {isPl
                  ? summary.headlinePl
                  : en
                    ? summary.headlineEn
                    : summary.headlineKa}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {matchedPair
                  ? matchedPair.tagline
                  : isPl
                    ? summary.bodyPl
                    : en
                      ? summary.bodyEn
                      : summary.bodyKa}
              </p>

              {matchedPair && matchedPair.strengths.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-foreground/85">
                  {matchedPair.strengths.map((str) => (
                    <li key={str} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--vivida-pink)]"
                      />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              {isPl ? (
                <Link
                  href="/onboarding?locale=pl"
                  className="inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Porównaj pełne kosmogramy synastrii
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : en ? (
                <Link
                  href="/onboarding?locale=en"
                  className="inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Run full 10-planet synastry chart
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <SignInButton
                  size="sm"
                  label="სრული რუკების შედარება"
                  source="landing_compat_calculator"
                />
              )}
              <Link
                href={
                  matchedPair
                    ? isPl
                      ? `/pl/horoskop-partnerski/${matchedPair.slug}`
                      : en
                        ? `/en/compatibility/${matchedPair.slug}`
                        : `/zodiac/tavsebadoba/${matchedPair.slug}`
                    : isPl
                      ? "/pl/horoskop-partnerski"
                      : en
                        ? "/en/compatibility"
                        : "/zodiac/tavsebadoba"
                }
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                {isPl
                  ? "Pełny przewodnik dopasowania →"
                  : en
                    ? "Compatibility Dossier →"
                    : "წყვილის სრული გზამკვლევი →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
