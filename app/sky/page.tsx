import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { ensureChartFor } from "@/actions/chart";
import { composeSkyData } from "@/lib/sky";
import { BODIES } from "@/lib/zodiac";
import { signByIndex } from "@/lib/zodiac";
import { houseLocativeKa } from "@/lib/houses";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { LiveSky } from "@/components/sky/live-sky";

export const metadata = { title: "ცოცხალი ცა" };

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const ASPECT_TONE: Record<string, string> = {
  conjunction: "var(--vivida-violet)",
  sextile: "var(--vivida-cyan)",
  trine: "var(--vivida-cyan)",
  square: "var(--vivida-pink)",
  opposition: "var(--vivida-pink)",
};

/**
 * The live sky — where every planet is RIGHT NOW, mapped onto the user's own
 * natal houses, with interpretations from the pre-generated transit library.
 * Positions extrapolate client-side from server-computed speeds, so the page
 * genuinely moves while you watch. The daily engagement loop's "come back
 * and check" surface.
 */
export default async function SkyPage() {
  const user = await requireUser();
  const plan = await getCurrentPlan(user.id);

  // Positions only — never wait on (or trigger) chart AI here.
  const chart = await ensureChartFor(user.id, plan, { aiUpgrade: "skip" });
  if (!chart) redirect("/onboarding");

  const sky = await composeSkyData(chart.data);
  const moonSign = signByIndex(sky.moon.signIndex);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={2} />

      <AppHeader authed plan={plan} active="sky" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <header className="mb-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ცოცხალი ცა · ახლა
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            მთვარე ახლა{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {moonSign.labelKa}შია
              {sky.moon.house ? `, შენს ${houseLocativeKa(sky.moon.house)}` : ""}
            </span>
          </h1>
          {sky.moon.houseText && (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/85">
              {sky.moon.houseText}
            </p>
          )}
        </header>

        <LiveSky data={sky} />

        {/* Active aspects right now */}
        {sky.aspects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              აქტიური ასპექტები ახლა
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {sky.aspects.map((a, i) => {
                const tone = ASPECT_TONE[a.kind] ?? "var(--vivida-violet)";
                const t = BODIES[a.transit];
                const n = BODIES[a.natal];
                return (
                  <li
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card/50 p-4 ring-1 ring-foreground/5 backdrop-blur-xl"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium"
                        style={{
                          color: tone,
                          borderColor: `color-mix(in oklch, ${tone} 40%, transparent)`,
                          backgroundColor: `color-mix(in oklch, ${tone} 10%, transparent)`,
                        }}
                      >
                        {t?.symbol} {t?.labelKa ?? a.transit}
                        <span aria-hidden>{ASPECT_GLYPH[a.kind] ?? "·"}</span>
                        {n?.symbol} {n?.labelKa ?? a.natal}
                      </span>
                      <span className="text-muted-foreground">
                        ორბისი {a.orb.toFixed(1)}°
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground/95">
                      {a.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      {a.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-10 border-t border-border/40 pt-4 text-xs text-muted-foreground">
          პოზიციები ცოცხლდება წამში ერთხელ — მთვარე ცაზე ყოველ საათში დაახლოებით
          ნახევარი გრადუსით მიიწევს. დაბრუნდი ხვალ — ცა უკვე სხვაგან იქნება.
        </p>
      </section>
    </main>
  );
}
