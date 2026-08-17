import { eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { computeTiming, type DayTier } from "@/lib/timing";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "Your best days" : "საუკეთესო დღეები" };
}
export const dynamic = "force-dynamic";

const TIER: Record<DayTier, { color: string; label: string; labelEn: string }> = {
  great: { color: "oklch(0.78 0.17 150)", label: "შესანიშნავი", labelEn: "Excellent" },
  good: { color: "oklch(0.80 0.15 200)", label: "კარგი", labelEn: "Good" },
  calm: { color: "oklch(0.72 0.03 280)", label: "მშვიდი", labelEn: "Calm" },
  tough: { color: "oklch(0.72 0.18 35)", label: "რთული", labelEn: "Challenging" },
};
const FAMILY_COLOR: Record<string, string> = {
  harmonic: "var(--vivida-cyan)",
  tense: "var(--vivida-pink)",
  neutral: "var(--vivida-gold)",
};

export default async function TimingPage() {
  const user = await requireUser();
  const locale = await getUserLocale(user.id);
  const en = locale !== "ka";
  const am = locale === "am";

  const [[chart], [profile]] = await Promise.all([
    db.select({ data: charts.data }).from(charts).where(eq(charts.userId, user.id)).limit(1),
    db.select({ timezone: profiles.timezone }).from(profiles).where(eq(profiles.userId, user.id)).limit(1),
  ]);

  if (!chart)
    return (
      <AstroLockedMain
        active="timing"
        title={am ? "Ձեր լավագույն օրերին անհրաժեշտ է նատալ քարտեզ" : en ? "Your best days need a natal chart" : "საუკეთესო დღეები ნატალურ რუკას საჭიროებს"}
        description={am ? "Ավելացրեք Ձեր ծննդյան տվյալները՝ տեսնելու համար, թե որ օրերն են աջակցում Ձեր թափին և որոնք են խնամք պահանջում։" : en ? "Add your birth details to see which days support your momentum and which call for care." : "შეავსე დაბადების მონაცემები, რომ ნახო, რომელი დღეები უბერავს ქარს ზურგში."}
        next="/timing"
        locale={locale}
      />
    );
  const timezone = profile?.timezone ?? "Asia/Tbilisi";

  const { days, notable } = computeTiming(chart.data, new Date(), timezone, 28, locale);

  const best = [...days]
    .map((d, i) => ({ ...d, i }))
    .filter((d) => d.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i);
  const tough = [...days]
    .filter((d) => d.score <= -20)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%),radial-gradient(35%_25%_at_15%_75%,oklch(0.30_0.15_350/0.3),transparent_70%)]"
      />
      <Starfield count={110} shooting={3} />
      <AppHeader authed active="timing" />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-6">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {am ? "Ձեր լավագույն" : en ? "Your best" : "საუკეთესო"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {am ? "օրերը" : en ? "days" : "დღეები"}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "The next four weeks through your chart—when the current supports you and when to move more carefully."
              : "მომდევნო 4 კვირა შენი რუკის მიხედვით — როდის უბერავს ქარი ზურგში და როდის ღირს სიფრთხილე."}
          </p>
        </header>

        {/* Best / tough highlights */}
        {(best.length > 0 || tough.length > 0) && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {best.length > 0 && (
              <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
                <div className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: TIER.great.color }}>
                  {am ? "Աջակցող օրեր" : en ? "Supportive days" : "ხელსაყრელი დღეები"}
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {best.map((d) => (
                    <li key={d.dateIso} className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: TIER.great.color }} />
                      <span className="font-medium">{d.dom}</span>
                      <span className="text-muted-foreground">({d.weekdayKa})</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
            {tough.length > 0 && (
              <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
                <div className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: TIER.tough.color }}>
                  {am ? "Առանձնահատուկ զգուշություն" : en ? "Take extra care" : "ფრთხილად ამ დღეებში"}
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {tough.map((d) => (
                    <li key={d.dateIso} className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: TIER.tough.color }} />
                      <span className="font-medium">{d.dom}</span>
                      <span className="text-muted-foreground">({d.weekdayKa})</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        )}

        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((d, i) => {
              const t = TIER[d.tier];
              return (
                <div
                  key={d.dateIso}
                  className="flex flex-col items-center justify-center rounded-lg py-2 text-center"
                  style={{
                    background: `color-mix(in oklch, ${t.color} 16%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${t.color} 30%, transparent)`,
                  }}
                  title={`${d.weekdayKa} ${d.dom} · ${en ? t.labelEn : t.label}`}
                >
                  <span className="text-[10px] text-muted-foreground">{d.weekdayKa}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: t.color }}>
                    {d.dom}
                  </span>
                  {i === 0 && <span className="text-[9px] text-muted-foreground">{am ? "այսօր" : en ? "today" : "დღეს"}</span>}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {(Object.keys(TIER) as DayTier[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: TIER[k].color }} />
                {en ? TIER[k].labelEn : TIER[k].label}
              </span>
            ))}
          </div>
        </div>

        {/* Notable transits */}
        {notable.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              {am ? "Ուշագրավ պահեր" : en ? "Notable moments" : "მნიშვნელოვანი მომენტები"}
            </h2>
            <ul className="space-y-3">
              {notable.map((n, i) => {
                const c = FAMILY_COLOR[n.family] ?? "var(--vivida-violet)";
                return (
                  <li
                    key={i}
                    className="flex gap-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: `color-mix(in oklch, ${c} 14%, transparent)` }}>
                      <span className="text-base font-bold tabular-nums" style={{ color: c }}>
                        {n.dateLabelKa.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {n.dateLabelKa.split(" ").slice(1).join(" ")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold tracking-tight">{n.title}</h3>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                        {n.meaning}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          {en
            ? "Timing is a prompt, not a prediction—use it to support your planning."
            : "დროის ენერგია მინიშნებაა, არა წინასწარმეტყველება — გამოიყენე დაგეგმვისთვის."}
        </p>
      </section>
    </main>
  );
}
