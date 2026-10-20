import { HOME_CONTENT } from "@/lib/seo/home-content";
import { Reveal } from "@/components/landing/reveal";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

const STEP_ACCENTS = [
  "text-[var(--vivida-gold)]",
  "text-[var(--vivida-cyan)]",
  "text-primary",
] as const;

export function HowItWorksSection() {
  const how = HOME_CONTENT.howItWorks;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
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
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
                <span className="inline-block h-px w-5 bg-[var(--vivida-cyan)]/70" />
                პროცესი · 3 მარტივი ნაბიჯი
              </div>
              <h2
                id="how-heading"
                className="mt-2.5 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                {how.title}
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              COMPUTATION PROTOCOL · 0{how.steps.length} STAGES
            </span>
          </div>
        </div>

        <ol className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
          {how.steps.map((s, i) => {
            const num = String(s.n).padStart(2, "0");
            const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];
            return (
              <Reveal
                as="li"
                key={s.n}
                delayMs={i * 60}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-secondary/40 sm:p-7"
              >
                <div>
                  <div className="flex items-baseline justify-between border-b border-border/70 pb-3">
                    <span
                      className={`font-mono text-2xl font-semibold tabular-nums ${accent}`}
                    >
                      {num}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      STAGE {num}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
                <div className="mt-6 border-t border-border/70 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  SWISS EPHEMERIS · VERIFIED
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
