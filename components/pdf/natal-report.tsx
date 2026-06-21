import path from "path";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

import { bodyMeta, formatDegree, signByIndex } from "@/lib/zodiac";
import { aspectKey } from "@/lib/aspects";
import { ELEMENT_ORDER } from "@/lib/elements";
import { C, ELEMENT_COLOR } from "@/lib/pdf/theme";
import type {
  NatalChartJson,
  ChartInterpretationJson,
} from "@/db/schema";
import type { ChartSalience } from "@/lib/report-salience";
import type { NatalReportHighlights } from "@/lib/report-content";

const FONT_DIR = path.join(process.cwd(), "app", "_fonts");
let fontsReady = false;
export function registerReportFonts() {
  if (fontsReady) return;
  Font.register({
    family: "Noto",
    fonts: [
      { src: path.join(FONT_DIR, "NotoSansGeorgian-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(FONT_DIR, "NotoSansGeorgian-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  // Long Georgian words shouldn't be hyphenated.
  Font.registerHyphenationCallback((w) => [w]);
  fontsReady = true;
}

export type NatalReportData = {
  name: string | null;
  birth: { date: string; time: string | null; place: string };
  chart: NatalChartJson;
  salience: ChartSalience;
  highlights: NatalReportHighlights | null;
  interpretation: ChartInterpretationJson | null;
};

const ASPECT_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};
const FAMILY_COLOR: Record<string, string> = {
  harmonic: C.cyan,
  tense: C.pink,
  neutral: C.gold,
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "Noto",
    fontSize: 10.5,
    lineHeight: 1.6,
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },
  // Cover
  cover: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "Noto",
    flexDirection: "column",
    justifyContent: "center",
    paddingHorizontal: 64,
  },
  coverKicker: {
    fontSize: 11,
    letterSpacing: 3,
    color: C.cyan,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  coverTitle: { fontSize: 46, fontWeight: "bold", lineHeight: 1.08 },
  coverName: { fontSize: 20, color: C.violet, marginTop: 18, fontWeight: "bold" },
  coverMeta: { fontSize: 11.5, color: C.textMuted, marginTop: 26, lineHeight: 1.9 },
  coverRule: {
    marginTop: 30,
    height: 2,
    width: 88,
    backgroundColor: C.violet,
    borderRadius: 2,
  },
  coverBrand: {
    position: "absolute",
    bottom: 54,
    left: 64,
    fontSize: 10,
    letterSpacing: 2,
    color: C.textDim,
    textTransform: "uppercase",
  },
  // Section
  sectionKicker: {
    fontSize: 9.5,
    letterSpacing: 2.5,
    color: C.violet,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 18 },
  // Highlight blocks
  hl: {
    backgroundColor: C.panel,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.violet,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  hlTitle: { fontSize: 12, fontWeight: "bold", color: C.text, marginBottom: 3 },
  hlBody: { fontSize: 10.5, color: C.textMuted, lineHeight: 1.6 },
  // Balance bars
  barTrack: {
    flexDirection: "row",
    height: 9,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: C.panel2,
    marginBottom: 8,
  },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 3 },
  dot: { width: 8, height: 8, borderRadius: 2, marginRight: 5 },
  legendText: { fontSize: 9.5, color: C.textMuted },
  prose: { fontSize: 10.5, color: C.text, lineHeight: 1.65, marginTop: 8 },
  // Data table
  table: {
    borderWidth: 1,
    borderColor: C.borderSoft,
    borderRadius: 8,
    overflow: "hidden",
  },
  thead: { flexDirection: "row", backgroundColor: C.panel, paddingVertical: 6, paddingHorizontal: 12 },
  tr: {
    flexDirection: "row",
    paddingVertical: 6.5,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: C.borderSoft,
  },
  th: { fontSize: 8.5, letterSpacing: 0.8, color: C.textDim, textTransform: "uppercase" },
  cName: { flex: 1.3 },
  cSign: { flex: 1.3 },
  cDeg: { flex: 1, textAlign: "right" },
  cHouse: { flex: 0.6, textAlign: "right" },
  td: { fontSize: 10, color: C.text },
  tdMuted: { fontSize: 10, color: C.textMuted },
  // Placement / house / aspect entries
  entry: { marginBottom: 13 },
  entryHead: { flexDirection: "row", alignItems: "baseline", marginBottom: 3 },
  entryName: { fontSize: 11.5, fontWeight: "bold", color: C.text },
  entryMeta: { fontSize: 9.5, color: C.textDim, marginLeft: 8 },
  entryBody: { fontSize: 10.5, color: C.textMuted, lineHeight: 1.6 },
  aspectChip: {
    fontSize: 9,
    color: C.onAccent,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontWeight: "bold",
  },
  // footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: C.textDim,
  },
});

const e = React.createElement;

const POINTS = [
  "sun",
  "moon",
  "ascendant",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

function Footer() {
  return e(
    View,
    { style: s.footer, fixed: true },
    e(Text, null, "VIVIDA · ნატალური ანგარიში"),
    e(Text, {
      render: ({ pageNumber }: { pageNumber: number }) => `${pageNumber}`,
    })
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return e(
    View,
    null,
    e(Text, { style: s.sectionKicker }, kicker),
    e(Text, { style: s.sectionTitle }, title)
  );
}

function BalanceBar({
  data,
  colorOf,
}: {
  data: Array<{ label: string; pct: number }>;
  colorOf: (label: string) => string;
}) {
  return e(
    View,
    null,
    e(
      View,
      { style: s.barTrack },
      ...data
        .filter((d) => d.pct > 0)
        .map((d, i) =>
          e(View, {
            key: i,
            style: { width: `${d.pct}%`, backgroundColor: colorOf(d.label) },
          })
        )
    ),
    e(
      View,
      { style: s.legendRow },
      ...data.map((d, i) =>
        e(
          View,
          { key: i, style: s.legendItem },
          e(View, { style: [s.dot, { backgroundColor: colorOf(d.label) }] }),
          e(Text, { style: s.legendText }, `${d.label} ${Math.round(d.pct)}%`)
        )
      )
    )
  );
}

export function NatalReport({ data }: { data: NatalReportData }) {
  registerReportFonts();
  const { chart, salience, highlights, interpretation } = data;

  const sunSign = signByIndex(chart.bodies.sun.signIndex).labelKa;
  const moonSign = signByIndex(chart.bodies.moon.signIndex).labelKa;
  const ascSign = signByIndex(chart.ascendant.signIndex).labelKa;

  const rows = POINTS.map((key) => {
    const p = key === "ascendant" ? chart.ascendant : chart.bodies[key];
    if (!p) return null;
    const sign = signByIndex(p.signIndex);
    return {
      key,
      label: bodyMeta(key)?.labelKa ?? key,
      sign: sign.labelKa,
      color: ELEMENT_COLOR[sign.element] ?? C.violet,
      degree: formatDegree(p.signDegree),
      retro: !!p.retrograde,
      house: key === "ascendant" ? 1 : p.house ?? null,
    };
  }).filter(Boolean) as Array<{
    key: string;
    label: string;
    sign: string;
    color: string;
    degree: string;
    retro: boolean;
    house: number | null;
  }>;

  const elementsBar = ELEMENT_ORDER.map((el) => ({
    label: el,
    pct: salience.elements.percentages[el],
  }));
  const modalityBar = (["კარდინალური", "ფიქსირებული", "მუტაბელური"] as const).map(
    (m) => ({ label: m, pct: salience.modality.percentages[m] })
  );
  const MOD_COLOR: Record<string, string> = {
    კარდინალური: C.pink,
    ფიქსირებული: C.cyan,
    მუტაბელური: C.gold,
  };

  const planetKeys = [
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ];

  return e(
    Document,
    { title: "ნატალური ანგარიში", author: "Vivida" },

    // ── Cover ──
    e(
      Page,
      { size: "A4", style: s.cover },
      e(Text, { style: s.coverKicker }, "ვივიდა · პერსონალური ანგარიში"),
      e(Text, { style: s.coverTitle }, "ნატალური\nრუკა"),
      data.name ? e(Text, { style: s.coverName }, data.name) : null,
      e(View, { style: s.coverRule }),
      e(
        Text,
        { style: s.coverMeta },
        `${data.birth.date}${data.birth.time ? ` · ${data.birth.time}` : ""}\n${data.birth.place}\n\nმზე ${sunSign} · მთვარე ${moonSign} · ამომავალი ${ascSign}`
      ),
      e(Text, { style: s.coverBrand }, "vivida.ge")
    ),

    // ── Content ──
    e(
      Page,
      { size: "A4", style: s.page, wrap: true },
      Footer(),

      // What stands out (salience-led)
      e(SectionTitle, {
        kicker: "შენი რუკის ხელწერა",
        title: "რა გამოირჩევა",
      }),
      ...(highlights?.standout ?? []).map((h, i) =>
        e(
          View,
          { key: i, style: s.hl, wrap: false },
          e(Text, { style: s.hlTitle }, h.title),
          e(Text, { style: s.hlBody }, h.body)
        )
      ),

      e(View, { style: s.divider }),

      // Balance
      e(SectionTitle, { kicker: "ენერგია", title: "ელემენტები და მოდალობა" }),
      e(BalanceBar, {
        data: elementsBar,
        colorOf: (l) => ELEMENT_COLOR[l] ?? C.violet,
      }),
      e(View, { style: { height: 10 } }),
      e(BalanceBar, {
        data: modalityBar,
        colorOf: (l) => MOD_COLOR[l] ?? C.violet,
      }),
      highlights?.balance
        ? e(Text, { style: s.prose }, highlights.balance)
        : null,

      e(View, { style: s.divider }),

      // Positions table
      e(SectionTitle, { kicker: "მონაცემები", title: "პოზიციები" }),
      e(
        View,
        { style: s.table },
        e(
          View,
          { style: s.thead },
          e(Text, { style: [s.th, s.cName] }, "პლანეტა"),
          e(Text, { style: [s.th, s.cSign] }, "ნიშანი"),
          e(Text, { style: [s.th, s.cDeg] }, "გრადუსი"),
          e(Text, { style: [s.th, s.cHouse] }, "სახლი")
        ),
        ...rows.map((r) =>
          e(
            View,
            { key: r.key, style: s.tr },
            e(Text, { style: [s.td, s.cName] }, r.label),
            e(Text, { style: [s.tdMuted, s.cSign, { color: r.color }] }, r.sign),
            e(
              Text,
              { style: [s.tdMuted, s.cDeg] },
              `${r.degree}${r.retro ? " ℞" : ""}`
            ),
            e(Text, { style: [s.tdMuted, s.cHouse] }, r.house ? String(r.house) : "—")
          )
        )
      ),

      // Big Three
      e(View, { style: s.divider, break: true }),
      e(SectionTitle, { kicker: "ბირთვი", title: "დიდი სამეული" }),
      ...(
        [
          ["sun", "მზე", interpretation?.bigThree?.sun],
          ["moon", "მთვარე", interpretation?.bigThree?.moon],
          ["ascendant", "ამომავალი", interpretation?.bigThree?.ascendant],
        ] as const
      ).map(([key, label, body], i) => {
        const p = key === "ascendant" ? chart.ascendant : chart.bodies[key];
        const sign = signByIndex(p.signIndex);
        return e(
          View,
          { key: i, style: s.entry, wrap: false },
          e(
            View,
            { style: s.entryHead },
            e(Text, { style: s.entryName }, label),
            e(Text, { style: s.entryMeta }, `${sign.labelKa} · ${formatDegree(p.signDegree)}`)
          ),
          body ? e(Text, { style: s.entryBody }, body) : null
        );
      }),

      // Planets
      e(View, { style: s.divider }),
      e(SectionTitle, { kicker: "პლანეტები", title: "პლანეტარული განლაგება" }),
      ...planetKeys
        .filter((k) => chart.bodies[k])
        .map((key) => {
          const p = chart.bodies[key];
          const sign = signByIndex(p.signIndex);
          const body = interpretation?.planets?.[key];
          return e(
            View,
            { key, style: s.entry, wrap: false },
            e(
              View,
              { style: s.entryHead },
              e(Text, { style: s.entryName }, bodyMeta(key)?.labelKa ?? key),
              e(
                Text,
                { style: s.entryMeta },
                `${sign.labelKa} · ${formatDegree(p.signDegree)}${p.house ? ` · მე-${p.house} სახლი` : ""}${p.retrograde ? " · ℞" : ""}`
              )
            ),
            body ? e(Text, { style: s.entryBody }, body) : null
          );
        }),

      // Houses
      e(View, { style: s.divider, break: true }),
      e(SectionTitle, { kicker: "ცხოვრების სფეროები", title: "12 სახლი" }),
      ...Array.from({ length: 12 }, (_, i) => i + 1)
        .map((n) => {
          const body = interpretation?.houses?.[String(n)];
          if (!body) return null;
          const cusp = chart.houses.find((h) => h.number === n);
          const sign = cusp ? signByIndex(cusp.signIndex) : null;
          return e(
            View,
            { key: n, style: s.entry, wrap: false },
            e(
              View,
              { style: s.entryHead },
              e(Text, { style: s.entryName }, `მე-${n} სახლი`),
              sign
                ? e(Text, { style: s.entryMeta }, sign.labelKa)
                : null
            ),
            e(Text, { style: s.entryBody }, body)
          );
        })
        .filter(Boolean),

      // Aspects (tightest first)
      e(View, { style: s.divider, break: true }),
      e(SectionTitle, { kicker: "ბმები", title: "მთავარი ასპექტები" }),
      ...salience.tightestAspects.map((a, i) => {
        const k = aspectKey(
          a.a,
          a.b,
          a.kind as Parameters<typeof aspectKey>[2]
        );
        const body = interpretation?.aspects?.[k];
        const col = FAMILY_COLOR[a.family] ?? C.violet;
        return e(
          View,
          { key: i, style: s.entry, wrap: false },
          e(
            View,
            { style: s.entryHead },
            e(Text, { style: s.entryName }, `${a.aLabel} – ${a.bLabel}`),
            e(
              Text,
              { style: [s.aspectChip, { backgroundColor: col }] },
              `${ASPECT_KA[a.kind] ?? a.kind} ${a.orb.toFixed(1)}°`
            )
          ),
          body ? e(Text, { style: s.entryBody }, body) : null
        );
      }),

      // Closing
      highlights?.closing
        ? e(
            View,
            null,
            e(View, { style: s.divider }),
            e(SectionTitle, { kicker: "დასკვნა", title: "შენი კოსმიური ხელწერა" }),
            e(Text, { style: s.prose }, highlights.closing)
          )
        : null
    )
  );
}
