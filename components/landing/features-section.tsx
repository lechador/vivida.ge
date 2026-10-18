import { HOME_CONTENT } from "@/lib/seo/home-content";
import { Reveal } from "@/components/landing/reveal";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

const FEATURE_ACCENTS = [
  "text-[var(--vivida-gold)]",
  "text-[var(--vivida-cyan)]",
  "text-primary",
  "text-[var(--vivida-pink)]",
] as const;

export function FeaturesSection() {
  const features = HOME_CONTENT.features;
  const what = HOME_CONTENT.whatIsSection;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-md">
        <CornerCrosshair position="top-left" />
        <CornerCrosshair position="top-right" />
        <CornerCrosshair position="bottom-left" />
        <CornerCrosshair position="bottom-right" />

        {/* Editorial Explainer: Two-Column Asymmetric Ledger */}
        <Reveal
          y={18}
          className="grid gap-8 border-b border-border bg-[oklch(0.155_0.038_280)] p-6 sm:p-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:divide-x lg:divide-border lg:p-0"
        >
          <div className="lg:p-10">
            {what.kicker && (
              <div className="mb-3 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
                <span
                  aria-hidden
                  className="inline-block h-px w-8 bg-[var(--vivida-cyan)]/70"
                />
                <span>{what.kicker}</span>
              </div>
            )}
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {what.title}
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--vivida-gold)]">
              სისტემური არქიტექტურა · 360° ეკლიპტიკა
            </p>
          </div>
          <div className="max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg lg:p-10">
            {what.body
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </Reveal>

        {/* Capabilities Sub-Header */}
        <div className="flex flex-col justify-between gap-2 border-b border-border bg-background/75 px-6 py-5 sm:flex-row sm:items-end sm:px-10">
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              პლატფორმის შესაძლებლობები
            </div>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              ფუნქციები და ინსტრუმენტები
            </h3>
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            01 — 0{features.length} · ასტრონომიული სიზუსტე
          </p>
        </div>

        {/* Outlined Cards Grid inside Recessed Frame */}
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {features.map((f, i) => {
            const accent = FEATURE_ACCENTS[i % FEATURE_ACCENTS.length];
            return (
              <Reveal
                as="article"
                key={f.title}
                y={16}
                durationMs={450}
                delayMs={(i % 3) * 60}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-150 hover:border-primary/45 hover:bg-secondary/50 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border/70 pb-3 font-mono text-xs tabular-nums">
                    <span className={`font-semibold ${accent}`}>
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Vivida Instrument
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {f.title}
                  </h4>
                  <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
