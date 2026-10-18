import { HOME_CONTENT } from "@/lib/seo/home-content";
import { Reveal } from "@/components/landing/reveal";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

const PILLAR_KICKERS = [
  "AXIS 01 · NATAL EPHEMERIS",
  "AXIS 02 · DAILY TRANSITS",
  "AXIS 03 · RELATIONAL SYNASTRY",
];

const PILLAR_ACCENTS = [
  "text-[var(--vivida-gold)]",
  "text-[var(--vivida-cyan)]",
  "text-[var(--vivida-pink)]",
] as const;

export function PillarsSection() {
  const pillars = HOME_CONTENT.pillars;

  return (
    <section
      id="about"
      aria-labelledby="pillars-heading"
      className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-md">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="border-b border-border bg-background/70 px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                <span className="inline-block h-px w-5 bg-primary/70" />
                სამი საყრდენი · მეთოდოლოგია
              </div>
              <h2
                id="pillars-heading"
                className="mt-2.5 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                ასტრონომიული სიზუსტე, ნათარგმნი ადამიანურ ენაზე
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              ARCHITECTURAL PILLARS · 0{pillars.length} AXES
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.title}
              delayMs={i * 60}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-secondary/40 sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <span
                    className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${PILLAR_ACCENTS[i % PILLAR_ACCENTS.length]}`}
                  >
                    {PILLAR_KICKERS[i] ?? `AXIS 0${i + 1}`}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    0{i + 1} / 0{pillars.length}
                  </span>
                </div>
                <h3 className="mt-5 text-balance text-xl font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </div>

              <div className="mt-6 border-t border-border/70 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                SWISS EPHEMERIS · CALIBRATED
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
