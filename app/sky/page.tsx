import { requireUser } from "@/lib/auth-helpers";
import { ensureChartFor } from "@/actions/chart";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { composeSkyData } from "@/lib/sky";
import { BODIES } from "@/lib/zodiac";
import { signByIndex } from "@/lib/zodiac";
import { houseLocativeKa } from "@/lib/houses";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { LiveSky } from "@/components/sky/live-sky";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { HOUSES } from "@/lib/houses";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Live sky" : "ცოცხალი ცა" };
}

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
 * The live sky, where every planet is RIGHT NOW, mapped onto the user's own
 * natal houses, with interpretations from the pre-generated transit library.
 * Positions extrapolate client-side from server-computed speeds, so the page
 * genuinely moves while you watch. The daily engagement loop's "come back
 * and check" surface.
 */
export default async function SkyPage() {
  const user = await requireUser();
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";
  // Positions only, never wait on (or trigger) chart AI here.
  const chart = await ensureChartFor(user.id, { aiUpgrade: "skip" });
  if (!chart)
    return (
      <AstroLockedMain
        active="sky"
        title={
          en
            ? "The live sky needs your natal chart"
            : "ცოცხალი ცა ნატალურ რუკას საჭიროებს"
        }
        description={
          en
            ? "Add your birth details to see where today's planets fall in your chart."
            : "შეავსე დაბადების მონაცემები, რომ ნახო, სად არიან პლანეტები ახლა შენს რუკაზე."
        }
        next="/sky"
        locale={locale}
      />
    );

  const sky = await composeSkyData(chart.data, locale);
  const moonSign = signByIndex(sky.moon.signIndex);

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={2} />

      <AppHeader authed active="sky" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <header className="mb-8">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Live sky · now" : "ცოცხალი ცა · ახლა"}
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {en ? "The Moon is now" : "მთვარე ახლა"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? `in ${moonSign.labelEn}` : `${moonSign.labelKa}შია`}
              {sky.moon.house
                ? en
                  ? `, in your ${HOUSES[sky.moon.house]?.labelEn}`
                  : `, შენს ${houseLocativeKa(sky.moon.house)}`
                : ""}
            </span>
          </h1>
          {(en ? sky.moon.house : sky.moon.houseText) && (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/85">
              {en && sky.moon.house
                ? HOUSES[sky.moon.house]?.meaningEn
                : sky.moon.houseText}
            </p>
          )}
        </header>

        <LiveSky data={sky} locale={locale} />

        {/* Active aspects right now */}
        {sky.aspects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {en ? "Active aspects now" : "აქტიური ასპექტები ახლა"}
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
                        {t?.symbol}{" "}
                        {en
                          ? (t?.labelEn ?? a.transit)
                          : (t?.labelKa ?? a.transit)}
                        <span aria-hidden>{ASPECT_GLYPH[a.kind] ?? "·"}</span>
                        {n?.symbol}{" "}
                        {en ? (n?.labelEn ?? a.natal) : (n?.labelKa ?? a.natal)}
                      </span>
                      <span className="text-muted-foreground">
                        {en ? "orb" : "ორბისი"} {a.orb.toFixed(1)}°
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground/95">
                      {en
                        ? `${t?.labelEn ?? a.transit} ${a.kind} ${n?.labelEn ?? a.natal}`
                        : a.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      {en
                        ? `This aspect connects ${t?.meaningEn ?? "current planetary movement"} with ${n?.meaningEn ?? "a natal pattern"}. Notice what becomes more visible, and use it as a prompt for reflection.`
                        : a.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-10 border-t border-border/40 pt-4 text-xs text-muted-foreground">
          {en
            ? "Positions update every second. The Moon moves roughly half a degree per hour, come back tomorrow and the sky will already look different."
            : "პოზიციები ცოცხლდება წამში ერთხელ, მთვარე ცაზე ყოველ საათში დაახლოებით ნახევარი გრადუსით მიიწევს. დაბრუნდი ხვალ, ცა უკვე სხვაგან იქნება."}
        </p>
      </section>
    </main>
  );
}
