"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { computeElementBalance } from "@/lib/elements";
import { signByIndex, bodyMeta, formatDegree } from "@/lib/zodiac";
import type { NatalChartJson, ChartInterpretationJson } from "@/db/schema";

const ELEMENT_GLYPH: Record<string, string> = {
  ცეცხლი: "△",
  მიწა: "▽",
  ჰაერი: "△",
  წყალი: "▽",
};

const ELEMENT_COLOR: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

const ELEMENT_DESCRIPTOR: Record<string, string> = {
  ცეცხლი: "მოქმედება, ვნება, ენთუზიაზმი",
  მიწა: "სტაბილურობა, რესურსები, ხანგრძლივობა",
  ჰაერი: "გონება, კომუნიკაცია, იდეები",
  წყალი: "ემოცია, ინტუიცია, თანაგრძნობა",
};

type ModalKind =
  | { kind: "body"; bodyKey: "sun" | "moon" }
  | { kind: "ascendant" }
  | {
      kind: "element";
      element: ReturnType<typeof computeElementBalance>["dominant"];
    }
  | null;

export function QuickStats({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: ChartInterpretationJson;
}) {
  const [modal, setModal] = useState<ModalKind>(null);

  const sun = chart.bodies.sun ? signByIndex(chart.bodies.sun.signIndex) : null;
  const moon = chart.bodies.moon
    ? signByIndex(chart.bodies.moon.signIndex)
    : null;
  const asc = signByIndex(chart.ascendant.signIndex);
  const balance = computeElementBalance(chart);
  const dominantPct = Math.round(balance.percentages[balance.dominant]);
  const aspectCount = chart.aspects?.length ?? 0;

  return (
    <>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {sun && (
          <Stat
            label="მზე"
            value={sun.labelKa}
            glyph="☉"
            accent="oklch(0.85 0.16 85)"
            subValue={sun.symbol}
            onClick={() => setModal({ kind: "body", bodyKey: "sun" })}
            index={0}
          />
        )}
        {moon && (
          <Stat
            label="მთვარე"
            value={moon.labelKa}
            glyph="☽"
            accent="oklch(0.78 0.18 200)"
            subValue={moon.symbol}
            onClick={() => setModal({ kind: "body", bodyKey: "moon" })}
            index={1}
          />
        )}
        <Stat
          label="ამომავალი"
          value={asc.labelKa}
          glyph="AC"
          accent="oklch(0.78 0.18 305)"
          subValue={asc.symbol}
          onClick={() => setModal({ kind: "ascendant" })}
          index={2}
        />
        <Stat
          label="დომინანტი"
          value={balance.dominant}
          glyph={ELEMENT_GLYPH[balance.dominant] ?? "△"}
          accent={ELEMENT_COLOR[balance.dominant]}
          subValue={`${dominantPct}%`}
          onClick={() => setModal({ kind: "element", element: balance.dominant })}
          index={3}
        />
        <Stat
          label="ასპექტი"
          value={String(aspectCount)}
          glyph="◇"
          accent="oklch(0.72 0.22 350)"
          subValue="ძირითადი"
          /* No modal, aspect detail lives in its own section. Hash bounce
             also auto-expands the section if it's collapsed. */
          asLink="#aspects"
          index={4}
        />
      </div>

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
      >
        {modal !== null && (
          <DialogContent>
            {modal.kind === "body" && (
              <BodyModalContent
                chart={chart}
                bodyKey={modal.bodyKey}
                interpretations={interpretations}
              />
            )}
            {modal.kind === "ascendant" && (
              <AscendantModalContent
                chart={chart}
                interpretations={interpretations}
              />
            )}
            {modal.kind === "element" && (
              <ElementModalContent
                chart={chart}
                element={modal.element}
                balance={balance}
              />
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function Stat({
  label,
  value,
  glyph,
  accent,
  subValue,
  onClick,
  asLink,
  index,
}: {
  label: string;
  value: string;
  glyph: string;
  accent: string;
  subValue?: string;
  onClick?: () => void;
  asLink?: string;
  index: number;
}) {
  const Component = asLink ? motion.a : motion.button;
  const componentProps = asLink
    ? { href: asLink }
    : ({ type: "button" as const, onClick });

  return (
    <Component
      {...componentProps}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.05 + index * 0.07,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 px-4 py-3 text-left backdrop-blur-xl ring-1 ring-foreground/5 transition-colors hover:bg-card/80 hover:ring-foreground/20 cursor-pointer"
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 size-20 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="text-xs font-medium text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {subValue}
            </span>
          )}
        </div>
      </div>
      <motion.span
        aria-hidden
        className="vivida-float absolute right-3 top-2.5 text-2xl leading-none"
        style={{ color: accent, opacity: 0.6 }}
        whileHover={{ scale: 1.25, rotate: -5, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        {glyph}
      </motion.span>
    </Component>
  );
}

function BodyModalContent({
  chart,
  bodyKey,
  interpretations,
}: {
  chart: NatalChartJson;
  bodyKey: "sun" | "moon";
  interpretations?: ChartInterpretationJson;
}) {
  const body = chart.bodies[bodyKey]!;
  const sign = signByIndex(body.signIndex);
  const meta = bodyMeta(bodyKey);
  const text = interpretations?.bigThree?.[bodyKey];

  return (
    <>
      <DialogHeader>
        <div className="text-sm font-medium text-muted-foreground">
          {meta?.labelKa}
        </div>
        <DialogTitle className="flex items-baseline gap-3">
          {sign.labelKa}
          <span className="text-2xl text-muted-foreground">{sign.symbol}</span>
        </DialogTitle>
        <DialogDescription>
          {sign.element} · {sign.modality}
          {body.house ? ` · ${body.house}-ე სახლი` : ""}
          <span className="block text-xs opacity-70">
            {formatDegree(body.signDegree)}
          </span>
        </DialogDescription>
      </DialogHeader>
      {text && (
        <p className="mt-2 text-base leading-relaxed text-foreground/90">
          {text}
        </p>
      )}
    </>
  );
}

function AscendantModalContent({
  chart,
  interpretations,
}: {
  chart: NatalChartJson;
  interpretations?: ChartInterpretationJson;
}) {
  const sign = signByIndex(chart.ascendant.signIndex);
  const text = interpretations?.bigThree?.ascendant;

  return (
    <>
      <DialogHeader>
        <div className="text-sm font-medium text-muted-foreground">
          ამომავალი
        </div>
        <DialogTitle className="flex items-baseline gap-3">
          {sign.labelKa}
          <span className="text-2xl text-muted-foreground">{sign.symbol}</span>
        </DialogTitle>
        <DialogDescription>
          {sign.element} · {sign.modality}
          <span className="block text-xs opacity-70">
            {formatDegree(chart.ascendant.signDegree)}
          </span>
        </DialogDescription>
      </DialogHeader>
      {text && (
        <p className="mt-2 text-base leading-relaxed text-foreground/90">
          {text}
        </p>
      )}
    </>
  );
}

function ElementModalContent({
  chart,
  element,
  balance,
}: {
  chart: NatalChartJson;
  element: ReturnType<typeof computeElementBalance>["dominant"];
  balance: ReturnType<typeof computeElementBalance>;
}) {
  const percent = Math.round(balance.percentages[element]);
  const planets = balance.planetsByElement[element] ?? [];
  const accent = ELEMENT_COLOR[element];

  return (
    <>
      <DialogHeader>
        <div className="text-sm font-medium text-muted-foreground">
          დომინანტი ელემენტი
        </div>
        <DialogTitle className="flex items-baseline gap-3">
          {element}
          <span
            className="text-2xl"
            style={{ color: accent }}
          >
            {ELEMENT_GLYPH[element]}
          </span>
        </DialogTitle>
        <DialogDescription>
          {ELEMENT_DESCRIPTOR[element]} · {percent}% შენი რუკიდან
        </DialogDescription>
      </DialogHeader>
      {planets.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            ამ ელემენტში
          </div>
          <ul className="space-y-2 text-sm">
            {planets.map((key) => {
              const meta = bodyMeta(key);
              const body = chart.bodies[key];
              if (key === "ascendant") {
                const sign = signByIndex(chart.ascendant.signIndex);
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <span>ამომავალი</span>
                    <span className="text-muted-foreground">
                      {sign.symbol} {sign.labelKa}
                    </span>
                  </li>
                );
              }
              if (key === "midheaven") {
                const sign = signByIndex(chart.midheaven.signIndex);
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <span>ზენიტი</span>
                    <span className="text-muted-foreground">
                      {sign.symbol} {sign.labelKa}
                    </span>
                  </li>
                );
              }
              if (!body || !meta) return null;
              const sign = signByIndex(body.signIndex);
              return (
                <li
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{meta.symbol}</span>
                    {meta.labelKa}
                    {body.house && (
                      <span className="text-xs text-muted-foreground">
                        ({body.house}-ე სახლი)
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {sign.symbol} {sign.labelKa}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

