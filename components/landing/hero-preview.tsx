"use client";

import { useState } from "react";

import { ZodiacWheel } from "./zodiac-wheel";

type DialMode = "natal" | "transit" | "synastry";

type PlacementSpec = {
  key: string;
  glyph: string;
  bodyKa: string;
  bodyEn: string;
  signKa: string;
  signEn: string;
  signGlyph: string;
  deg: string;
  houseKa: string;
  houseEn: string;
  elementKa: string;
  elementEn: string;
  noteKa: Record<DialMode, string>;
  noteEn: Record<DialMode, string>;
};

const SPECIMEN_PLACEMENTS: PlacementSpec[] = [
  {
    key: "sun",
    glyph: "☉",
    bodyKa: "მზე",
    bodyEn: "Sun",
    signKa: "ლომი",
    signEn: "Leo",
    signGlyph: "♌",
    deg: "14°28′",
    houseKa: "X სახლი",
    houseEn: "House X",
    elementKa: "ცეცხლი · ფიქსირებული",
    elementEn: "Fire · Fixed",
    noteKa: {
      natal:
        "მზე მე-10 სახლში (ზენიტი) მიუთითებს მკაფიო პროფესიულ ავტორიტეტსა და შემოქმედებით ლიდერობაზე.",
      transit:
        "დღის ტრანზიტი: მზე ქმნის ტრიгонს ნატალურ იუპიტერთან — ხელსაყრელი დროა სტრატეგიული გადაწყვეტილებებისთვის.",
      synastry:
        "სინასტრიული ღერძი: პარტნიორის მთვარე ეხება შენს მზეს (ორბისი 1°12′) — ძლიერი ურთიერთნდობის კავშირი.",
    },
    noteEn: {
      natal:
        "Sun culminating in the 10th House (Midheaven) indicates visible vocation, creative authority, and purposeful direction.",
      transit:
        "Active Transit: Solar trine to natal Jupiter (orb 0°44′) opens a high-clarity window for long-term commitments.",
      synastry:
        "Synastry Axis: Partner's Moon conjuncts your natal Sun (orb 1°12′), forming a classic harmonic bond of mutual recognition.",
    },
  },
  {
    key: "moon",
    glyph: "☽",
    bodyKa: "მთვარე",
    bodyEn: "Moon",
    signKa: "თევზები",
    signEn: "Pisces",
    signGlyph: "♓",
    deg: "08°12′",
    houseKa: "VII სახლი",
    houseEn: "House VII",
    elementKa: "წყალი · ცვალებადი",
    elementEn: "Water · Mutable",
    noteKa: {
      natal:
        "მთვარე მე-7 სახლში აძლიერებს ემპათიას, ინტუიციურ აღქმასა და ღრმა ემოციურ კავშირს პარტნიორობაში.",
      transit:
        "დღის ტრანზიტი: მთვარე გადის დესცენდენტის ღერძს — იდეალური საღამოა გულწრფელი საუბრისა და შეთანხმებისთვის.",
      synastry:
        "სინასტრიული ღერძი: ვენერა-მთვარის სექსტილი ქმნის რბილ, უსაფრთხო ემოციურ გარემოს ორივე მხარისთვის.",
    },
    noteEn: {
      natal:
        "Moon in Pisces in the 7th House heightens emotional receptivity, artistic intuition, and relational depth.",
      transit:
        "Active Transit: Lunar passage across the Descendant favors candid dialogue and emotional alignment.",
      synastry:
        "Synastry Axis: Venus–Moon sextile (orb 0°52′) establishes effortless domestic warmth and intuitive understanding.",
    },
  },
  {
    key: "ascendant",
    glyph: "↑",
    bodyKa: "ასცენდენტი",
    bodyEn: "Ascendant",
    signKa: "ქალწული",
    signEn: "Virgo",
    signGlyph: "♍",
    deg: "22°45′",
    houseKa: "I სახლი",
    houseEn: "House I",
    elementKa: "მიწა · ცვალებადი",
    elementEn: "Earth · Mutable",
    noteKa: {
      natal:
        "ქალწულის ასცენდენტი განსაზღვრავს ანალიტიკურ სიზუსტეს, დაკვირვებულობასა და სტრუქტურულ მიდგომას.",
      transit:
        "დღის ტრანზიტი: მერკური ააქტიურებს პირველ სახლს — მაღალია კონცენტრაცია და დეტალების ხედვა.",
      synastry:
        "სინასტრიული ღერძი: პარტნიორის მზე ხვდება შენს მე-7 სახლში — ბუნებრივი მიზიდულობა და პოლარობის ბალანსი.",
    },
    noteEn: {
      natal:
        "Virgo Rising shapes an observant, articulate presence governed by Mercury's analytical precision.",
      transit:
        "Active Transit: Mercury activating the 1st House sharpens discernment, writing, and structural planning.",
      synastry:
        "Synastry Axis: Partner's Sun falls directly on your 7th House cusp, creating magnetic complementarity.",
    },
  },
  {
    key: "mercury",
    glyph: "☿",
    bodyKa: "მერკური",
    bodyEn: "Mercury",
    signKa: "ქალწული",
    signEn: "Virgo",
    signGlyph: "♍",
    deg: "03°19′",
    houseKa: "I სახლი",
    houseEn: "House I",
    elementKa: "მიწა · დომიცილი",
    elementEn: "Earth · Domicile",
    noteKa: {
      natal:
        "მერკური საკუთარ ნიშანში (დომიცილი) იძლევა მკაფიო ლოგიკას, სისტემურ აზროვნებასა და ზუსტ კომუნიკაციას.",
      transit:
        "დღის ტრანზიტი: ზუსტი ასპექტი ურანთან ხელს უწყობს ახალ იდეებს, კვლევასა და სწრაფ გადაწყვეტებს.",
      synastry:
        "სინასტრიული ღერძი: მერკურის ტრიგონი უზრუნველყოფს ინტელექტუალურ თანხვედრას და მარტივ დიალოგს.",
    },
    noteEn: {
      natal:
        "Mercury dignified in Virgo bestows lucid synthesis, editorial discernment, and methodical problem-solving.",
      transit:
        "Active Transit: Earth trine to Uranus sparks sudden intellectual breakthroughs and clean technical execution.",
      synastry:
        "Synastry Axis: Mercury–Mercury trine ensures frictionless communication and shared intellectual curiosity.",
    },
  },
  {
    key: "venus",
    glyph: "♀",
    bodyKa: "ვენერა",
    bodyEn: "Venus",
    signKa: "სასწორი",
    signEn: "Libra",
    signGlyph: "♎",
    deg: "19°04′",
    houseKa: "II სახლი",
    houseEn: "House II",
    elementKa: "ჰაერი · კარდინალური",
    elementEn: "Air · Cardinal",
    noteKa: {
      natal:
        "ვენერა სასწორში აყალიბებს დახვეწილ ესთეტიკურ გემოვნებას, დიპლომატიურობასა და ჰარმონიის მოთხოვნილებას.",
      transit:
        "დღის ტრანზიტი: ვენერა აძლიერებს მე-2 სახლის რესურსებს — კარგი პერიოდია ფინანსური და შემოქმედებითი ნაბიჯებისთვის.",
      synastry:
        "სინასტრიული ღერძი: ვენერა-მარსის კონიუნქცია ქმნის ძლიერ რომანტიკულ დინამიკასა და შემოქმედებით მუხტს.",
    },
    noteEn: {
      natal:
        "Venus in domicile in Libra refines aesthetic judgment, relational fairness, and diplomatic grace.",
      transit:
        "Active Transit: Venus transiting the 2nd House supports material stability and creative acquisitions.",
      synastry:
        "Synastry Axis: Exact Venus–Mars conjunction (orb 0°38′) generates unmistakable romantic chemistry.",
    },
  },
  {
    key: "mars",
    glyph: "♂",
    bodyKa: "მარსი",
    bodyEn: "Mars",
    signKa: "მორიელი",
    signEn: "Scorpio",
    signGlyph: "♏",
    deg: "27°51′",
    houseKa: "III სახლი",
    houseEn: "House III",
    elementKa: "წყალი · ფიქსირებული",
    elementEn: "Water · Fixed",
    noteKa: {
      natal:
        "მარსი მორიელში გამოირჩევა სტრატეგიული ნებისყოფით, სიღრმისეული კვლევის უნარითა და მიზანდასახულობით.",
      transit:
        "დღის ტრანზიტი: მარსი-სატურნის სექსტილი გეხმარება რთული ამოცანების ბოლომდე მიყვანაში.",
      synastry:
        "სინასტრიული ღერძი: მარსის ჰარმონიული ასპექტი აძლიერებს საერთო მიზნებისკენ სწრაფვას.",
    },
    noteEn: {
      natal:
        "Mars in traditional rulership in Scorpio channels unwavering focus, strategic endurance, and investigative depth.",
      transit:
        "Active Transit: Mars sextile Saturn provides disciplined stamina for completing demanding projects.",
      synastry:
        "Synastry Axis: Constructive Mars–Sun trine fuels shared ambition and decisive mutual support.",
    },
  },
];

/**
 * Interactive Astronomical Astrolabe & Live Sky Dial Console.
 * Visitors can switch between Natal Specimen, Live Sky Transits, and Synastry Axis,
 * and click any planet on the wheel or ephemeris table to inspect its telemetry.
 */
export function HeroPreview({ locale = "ka" }: { locale?: "ka" | "en" }) {
  const en = locale === "en";
  const [mode, setMode] = useState<DialMode>("natal");
  const [selectedKey, setSelectedKey] = useState<string>("sun");

  const activePlacement =
    SPECIMEN_PLACEMENTS.find((p) => p.key === selectedKey) ??
    SPECIMEN_PLACEMENTS[0];

  const modes: Array<{ id: DialMode; label: string }> = en
    ? [
        { id: "natal", label: "01 · Natal Chart" },
        { id: "transit", label: "02 · Live Sky" },
        { id: "synastry", label: "03 · Synastry" },
      ]
    : [
        { id: "natal", label: "01 · ნატალური" },
        { id: "transit", label: "02 · დღის ცა" },
        { id: "synastry", label: "03 · სინასტრია" },
      ];

  return (
    <div className="flex h-full w-full flex-col justify-between bg-card p-5 sm:p-6">
      {/* Top Specimen Header + Mode Selector */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs text-muted-foreground">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {en
              ? "Interactive Astrolabe · Specimen"
              : "ინტერაქტიული ასტროლაბი · ეფემერიდა"}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-foreground/80">
            41°43′N · 44°47′E · UTC+4
          </span>
        </div>

        {/* Interactive Mode Switcher */}
        <div
          role="tablist"
          aria-label={en ? "Observatory mode" : "ობსერვატორიის რეჟიმი"}
          className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-background/70 p-1"
        >
          {modes.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                className={`whitespace-nowrap rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors ${
                  active
                    ? "border border-primary/40 bg-secondary font-semibold text-primary shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Astrolabe Wheel Stage */}
      <div className="my-4 flex flex-col items-center justify-center py-1">
        <ZodiacWheel
          size={224}
          selectedBodyKey={selectedKey}
          onSelectBody={setSelectedKey}
          activeMode={mode}
        />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {en
            ? "Select any planetary node or row to inspect coordinates"
            : "დააჭირე პლანეტას ან ცხრილის სტრიქონს დეტალური გრადუსისთვის"}
        </p>
      </div>

      {/* Interactive 6-Body Ephemeris Ledger */}
      <div className="border-t border-border pt-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>
            {en
              ? "Planetary Ephemeris (Click to inspect)"
              : "პლანეტარული ეფემერიდა"}
          </span>
          <span>{en ? "Longitude · House" : "გრადუსი · სახლი"}</span>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border/70 overflow-hidden rounded-lg border border-border bg-background/65 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {[
            SPECIMEN_PLACEMENTS.slice(0, 3),
            SPECIMEN_PLACEMENTS.slice(3, 6),
          ].map((group, colIdx) => (
            <div key={colIdx} className="divide-y divide-border/70">
              {group.map((row) => {
                const isSelected = row.key === activePlacement.key;
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => setSelectedKey(row.key)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`w-4 text-center font-mono ${
                          isSelected
                            ? "font-semibold text-[var(--vivida-gold)]"
                            : "text-primary/85"
                        }`}
                      >
                        {row.glyph}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {en ? row.bodyEn : row.bodyKa}
                      </span>
                      <span className="truncate text-muted-foreground">
                        · {row.signGlyph} {en ? row.signEn : row.signKa}
                      </span>
                    </div>
                    <div className="shrink-0 font-mono text-[11px] tabular-nums">
                      <span className="text-foreground/90">{row.deg}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Live Selected Node Telemetry Readout */}
      <div className="mt-3 rounded-lg border border-border bg-background/75 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2 font-mono text-[11px]">
          <span className="font-semibold text-[var(--vivida-gold)]">
            {activePlacement.glyph}{" "}
            {en ? activePlacement.bodyEn : activePlacement.bodyKa} ·{" "}
            {activePlacement.signGlyph}{" "}
            {en ? activePlacement.signEn : activePlacement.signKa}{" "}
            {activePlacement.deg}
          </span>
          <span className="text-[var(--vivida-cyan)]">
            {en ? activePlacement.houseEn : activePlacement.houseKa} ·{" "}
            {en ? activePlacement.elementEn : activePlacement.elementKa}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {en ? activePlacement.noteEn[mode] : activePlacement.noteKa[mode]}
        </p>
      </div>
    </div>
  );
}
