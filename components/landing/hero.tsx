"use client";

import Link from "next/link";

import { SignInButton } from "./sign-in-button";
import { HeroPreview } from "./hero-preview";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { HOME_CONTENT } from "@/lib/seo/home-content";

const TELEMETRY_SPEC_KA = [
  {
    index: "01",
    metric: "0°01′ სიზუსტე",
    label: "შვეიცარიული ეფემერიდების სტანდარტი",
    accent: "text-[var(--vivida-gold)]",
  },
  {
    index: "02",
    metric: "12 სახლი · 10 სხეული",
    label: "სრული ნატალური და ტრანზიტული ღერძი",
    accent: "text-[var(--vivida-cyan)]",
  },
  {
    index: "03",
    metric: "78 არკანი · 3 გაშლა",
    label: "პერსონალური ტარო და კარტის არქივი",
    accent: "text-primary",
  },
  {
    index: "04",
    metric: "4 ფსიქო-ტესტი",
    label: "Astro-MBTI, Big Five, IQ და EQ ანალიზი",
    accent: "text-[var(--vivida-pink)]",
  },
];

export function Hero() {
  const c = HOME_CONTENT.hero;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      {/* Swiss-Grid Architectural Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-lg">
        <CornerCrosshair position="top-left" />
        <CornerCrosshair position="top-right" />
        <CornerCrosshair position="bottom-left" />
        <CornerCrosshair position="bottom-right" />

        {/* Top Meta Index Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/80 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
          <span className="text-[var(--vivida-gold)]">
            VOL. IV · ასტრონომიული ალმანახი და პირადი ობსერვატორია
          </span>
          <span className="tabular-nums text-[var(--vivida-cyan)]">
            თბილისის მერიდიანი · 41°43′N 44°47′E
          </span>
        </div>

        {/* Main 2-Column Stretched Split */}
        <div className="grid items-stretch divide-y divide-border lg:grid-cols-[1.12fr_0.88fr] lg:divide-x lg:divide-y-0">
          {/* Left Column: Editorial Proposition & Action */}
          <div className="flex flex-col justify-between bg-[oklch(0.155_0.038_280)] p-6 sm:p-10 lg:p-12">
            <div>
              {/* Hairline Kicker */}
              <div className="mb-6 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
                <span
                  aria-hidden
                  className="inline-block h-px w-8 bg-[var(--vivida-cyan)]/70"
                />
                <span>{c.kicker}</span>
              </div>

              <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
                {c.headlinePre}{" "}
                <span className="text-gradient-vivida">
                  {c.headlineGradient}
                </span>
                {c.headlinePost ? <> {c.headlinePost}</> : null}
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {c.subhead}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <SignInButton
                  label={c.ctaPrimary}
                  loadingLabel={c.ctaPrimaryLoading}
                />
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center whitespace-nowrap rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground shadow-2xs transition-colors hover:border-primary/50 hover:bg-secondary"
                >
                  {c.secondary}
                </Link>
              </div>
            </div>

            {/* Bottom Left: Unboxed Trust Metadata + Direct Instrument Links */}
            <div className="mt-10 border-t border-border/80 pt-6">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                {c.microNotes.map((note, idx) => (
                  <span key={note} className="inline-flex items-center gap-2.5">
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span>{note}</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                <Link
                  href="/nataluri-ruka"
                  className="text-[var(--vivida-gold)] transition-colors hover:text-primary"
                >
                  01. ნატალური რუკა →
                </Link>
                <Link
                  href="/taro"
                  className="text-primary transition-colors hover:text-foreground"
                >
                  02. ტაროს გაშლა →
                </Link>
                <Link
                  href="/mtvaris-kalendari"
                  className="text-[var(--vivida-cyan)] transition-colors hover:text-primary"
                >
                  03. მთვარის ფაზა →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Astronomical Astrolabe Console */}
          <div className="flex flex-col">
            <HeroPreview locale="ka" />
          </div>
        </div>

        {/* Full-Width 4-Column Astronomical Telemetry Strip */}
        <div className="grid grid-cols-2 gap-3 border-t border-border bg-background/75 p-3.5 sm:p-5 lg:grid-cols-4">
          {TELEMETRY_SPEC_KA.map((item) => (
            <div
              key={item.index}
              className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-2xs sm:px-5 sm:py-4"
            >
              <div
                className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${item.accent}`}
              >
                {item.index}
              </div>
              <div className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg">
                {item.metric}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
