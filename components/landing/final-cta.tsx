import { SignInButton } from "./sign-in-button";
import { HOME_CONTENT } from "@/lib/seo/home-content";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

export function FinalCta() {
  const cta = HOME_CONTENT.finalCta;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pb-28"
    >
      <div className="relative overflow-hidden rounded-sm border border-primary/35 bg-card p-8 sm:p-12">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              <span className="inline-block h-px w-5 bg-primary/70" />
              პერსონალური ობსერვატორია
            </div>
            <h2
              id="final-cta-heading"
              className="mt-3 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              {cta.title}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {cta.body}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2.5 lg:items-end">
            <SignInButton label={cta.ctaText} source="final_cta" />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {cta.subtext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
