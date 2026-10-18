import { HOME_CONTENT } from "@/lib/seo/home-content";
import { Reveal } from "@/components/landing/reveal";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

export function FeaturesSection() {
  const features = HOME_CONTENT.features;
  const what = HOME_CONTENT.whatIsSection;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative border border-border bg-card/30">
        <CornerCrosshair position="top-left" />
        <CornerCrosshair position="top-right" />
        <CornerCrosshair position="bottom-left" />
        <CornerCrosshair position="bottom-right" />

        {/* Editorial Explainer: Two-Column Asymmetric Ledger */}
        <Reveal
          y={18}
          className="grid gap-8 border-b border-border p-6 sm:p-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:divide-x lg:divide-border lg:p-0"
        >
          <div className="lg:p-10">
            {what.kicker && (
              <div className="mb-3 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <span
                  aria-hidden
                  className="inline-block h-px w-8 bg-primary/70"
                />
                <span>{what.kicker}</span>
              </div>
            )}
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {what.title}
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
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
        <div className="flex flex-col justify-between gap-2 border-b border-border bg-background/60 px-6 py-5 sm:flex-row sm:items-end sm:px-10">
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

        {/* Asymmetric Hairline Swiss Grid */}
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal
              as="article"
              key={f.title}
              y={16}
              durationMs={450}
              delayMs={(i % 3) * 60}
              className="flex flex-col justify-between bg-card p-6 transition-colors duration-150 hover:bg-secondary/50 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs tabular-nums">
                  <span className="font-semibold text-primary">
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
          ))}
        </div>
      </div>
    </section>
  );
}
