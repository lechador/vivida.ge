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
  },
  {
    index: "02",
    metric: "12 სახლი · 10 სხეული",
    label: "სრული ნატალური და ტრანზიტული ღერძი",
  },
  {
    index: "03",
    metric: "78 არკანი · 3 გაშლა",
    label: "პერსონალური ტარო და კარტის არქივი",
  },
  {
    index: "04",
    metric: "4 ფსიქო-ტესტი",
    label: "Astro-MBTI, Big Five, IQ და EQ ანალიზი",
  },
];

export function Hero() {
  const c = HOME_CONTENT.hero;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      {/* Swiss-Grid Architectural Frame */}
      <div className="relative border border-border bg-card/40">
        <CornerCrosshair position="top-left" />
        <CornerCrosshair position="top-right" />
        <CornerCrosshair position="bottom-left" />
        <CornerCrosshair position="bottom-right" />

        {/* Top Meta Index Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/70 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
          <span className="text-primary">
            VOL. IV · ასტრონომიული ალმანახი და პირადი ობსერვატორია
          </span>
          <span className="tabular-nums">
            თბილისის მერიდიანი · 41°43′N 44°47′E
          </span>
        </div>

        {/* Main 2-Column Stretched Split */}
        <div className="grid items-stretch divide-y divide-border lg:grid-cols-[1.12fr_0.88fr] lg:divide-x lg:divide-y-0">
          {/* Left Column: Editorial Proposition & Action */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            <div>
              {/* Hairline Kicker */}
              <div className="mb-6 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <span
                  aria-hidden
                  className="inline-block h-px w-8 bg-primary/70"
                />
                <span>{c.kicker}</span>
              </div>

              <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
                {c.headlinePre}{" "}
                <span className="text-primary">{c.headlineGradient}</span>
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
                  className="inline-flex h-12 items-center whitespace-nowrap rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
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
                  className="text-foreground/85 transition-colors hover:text-primary"
                >
                  01. ნატალური რუკა →
                </Link>
                <Link
                  href="/taro"
                  className="text-foreground/85 transition-colors hover:text-primary"
                >
                  02. ტაროს გაშლა →
                </Link>
                <Link
                  href="/mtvaris-kalendari"
                  className="text-foreground/85 transition-colors hover:text-primary"
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
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          {TELEMETRY_SPEC_KA.map((item) => (
            <div
              key={item.index}
              className="bg-background/85 px-5 py-4 sm:px-6 sm:py-5"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
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
