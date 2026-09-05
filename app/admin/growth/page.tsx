import { Activity, BellRing, FlaskConical, Gauge, Users, WalletCards } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { creditGuardrail, freeCreditRatio } from "@/lib/credit-economy-metrics";
import { getGrowthMetrics } from "@/lib/growth-metrics";

export const metadata = { title: "ექსპერიმენტები და მეტრიკები · ადმინი" };
export const dynamic = "force-dynamic";

function percent(numerator: number, denominator: number): string {
  if (denominator <= 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function ratioLabel(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}×`;
}

const GUARDRAIL_STYLE = {
  healthy: "border-emerald-400/25 bg-emerald-400/8 text-emerald-200",
  watch: "border-amber-400/25 bg-amber-400/8 text-amber-200",
  stop: "border-rose-400/25 bg-rose-400/8 text-rose-200",
} as const;

const GUARDRAIL_LABEL = {
  healthy: "ჯანმრთელი",
  watch: "დაკვირვება",
  stop: "შეაჩერე უფასო ზრდა",
} as const;

export default async function AdminGrowthPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  // Layout gating is useful for navigation, but sensitive business data keeps
  // its authorization check beside the query as well.
  await requireAdmin();
  const params = await searchParams;
  const days = params.days === "84" ? 84 : 28;
  const metrics = await getGrowthMetrics(days);
  const fourWeekFree = metrics.creditSummary.freeIssued;
  const fourWeekPurchased = metrics.creditSummary.purchased;
  const fourWeekSpent = metrics.creditSummary.spent;
  const fourWeekRatio = freeCreditRatio(fourWeekFree, fourWeekSpent);
  const overallGuardrail = creditGuardrail(fourWeekRatio);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-[var(--vivida-cyan)]" />
            <h1 className="text-2xl font-semibold tracking-tight">ექსპერიმენტები და მეტრიკები</h1>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Postgres-ზე დაფუძნებული assignment, exposure და outcome მონაცემები; reminder funnel და საკრედიტო ეკონომიკის ოთხკვირიანი guardrail.
          </p>
        </div>
        <div className="flex rounded-xl border border-border bg-card/55 p-1 text-xs">
          {[28, 84].map((value) => (
            <Link key={value} href={`/admin/growth?days=${value}`} className={`rounded-lg px-3 py-2 ${days === value ? "bg-[var(--vivida-violet)]/20 text-foreground" : "text-muted-foreground"}`}>
              {value} დღე
            </Link>
          ))}
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-4">
        <SummaryCard label="უფასოდ გაცემული · 4 კვირა" value={fourWeekFree} icon={WalletCards} />
        <SummaryCard label="ნაყიდი კრედიტები · 4 კვირა" value={fourWeekPurchased} icon={WalletCards} />
        <SummaryCard label="დახარჯული · 4 კვირა" value={fourWeekSpent} icon={Gauge} />
        <div className={`rounded-2xl border p-5 ${GUARDRAIL_STYLE[overallGuardrail]}`}>
          <div className="text-xs opacity-80">უფასო გაცემა / ხარჯვა</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{ratioLabel(fourWeekRatio)}</div>
          <div className="mt-1 text-xs">{GUARDRAIL_LABEL[overallGuardrail]}</div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
        <div className="flex items-center gap-2"><FlaskConical className="size-5 text-[var(--vivida-violet)]" /><h2 className="text-lg font-semibold">A/B ექსპერიმენტები</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">Assigned = ახალი assignment არჩეულ პერიოდში; დანარჩენი ეტაპები = მოვლენები იმავე პერიოდში. Purchase მხოლოდ Stripe-ის დასრულებული webhook-ია.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-2 pr-4">ექსპერიმენტი / ვარიანტი</th><th className="px-3 py-2">Assigned</th><th className="px-3 py-2">Exposed</th><th className="px-3 py-2">Exposure rate</th><th className="px-3 py-2">Checkout</th><th className="pl-3 py-2">Purchase / exposed</th></tr></thead>
            <tbody>{metrics.experiments.map((row) => <tr key={`${row.experiment}:${row.variant}`} className="border-b border-border/50 last:border-0"><td className="py-3 pr-4"><div className="font-medium">{row.experiment}</div><div className="text-xs text-muted-foreground">{row.variant}</div></td><td className="px-3 py-3 tabular-nums">{row.assigned}</td><td className="px-3 py-3 tabular-nums">{row.exposed}</td><td className="px-3 py-3 tabular-nums">{percent(row.exposed, row.assigned)}</td><td className="px-3 py-3 tabular-nums">{row.checkoutStarted}</td><td className="pl-3 py-3 tabular-nums">{row.purchaseCompleted} · {percent(row.purchaseCompleted, row.exposed)}</td></tr>)}</tbody>
          </table>
          {!metrics.experiments.length && <p className="py-8 text-center text-sm text-muted-foreground">მონაცემი assignment-ის პირველი exposure-ის შემდეგ გამოჩნდება.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
        <div className="flex items-center gap-2"><BellRing className="size-5 text-[var(--vivida-pink)]" /><h2 className="text-lg font-semibold">Reminder funnel</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">Value completion = მომხმარებელმა მიიღო `sent` reminder და ავტორიზებულად გახსნა მისი მიზნობრივი გვერდი. Opt-in/out უნიკალური მომხმარებლებია; delivery მოვლენებია.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-2 pr-4">თემა</th><th className="px-3 py-2">Opt-in</th><th className="px-3 py-2">Delivered</th><th className="px-3 py-2">Value completion</th><th className="px-3 py-2">Delivery → value</th><th className="pl-3 py-2">Opt-out</th></tr></thead>
            <tbody>{metrics.reminders.map((row) => <tr key={row.topic} className="border-b border-border/50 last:border-0"><td className="py-3 pr-4"><span className="font-medium">{row.topic}</span></td><td className="px-3 py-3 tabular-nums">{row.optedIn}</td><td className="px-3 py-3 tabular-nums">{row.delivered}</td><td className="px-3 py-3 tabular-nums">{row.valueCompleted}</td><td className="px-3 py-3 tabular-nums">{percent(row.valueCompleted, row.delivered)}</td><td className="pl-3 py-3 tabular-nums">{row.optedOut}</td></tr>)}</tbody>
          </table>
          {!metrics.reminders.length && <p className="py-8 text-center text-sm text-muted-foreground">მონაცემი პირველი opt-in ან delivery მოვლენის შემდეგ გამოჩნდება.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Users className="size-5 text-[var(--vivida-cyan)]" /><h2 className="text-lg font-semibold">ურთიერთობები · recurring synastry</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">მოწვევები, მიღების წილი, მიმდინარე გამომწერები (snapshot, არა პერიოდი), გაზიარებული პასუხები და გენერირებული ყოველკვირეული განახლებები არჩეულ პერიოდში.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={`მოწვევები · მიღებული ${percent(metrics.relationships.invitesAccepted, metrics.relationships.invitesCreated)}`} value={`${metrics.relationships.invitesAccepted} / ${metrics.relationships.invitesCreated}`} wide />
          <Metric label="ყოველკვირეული გამომწერები" value={metrics.relationships.weeklySubscribers} />
          <Metric label="ტრანზიტ-ალერტ გამომწერები" value={metrics.relationships.transitSubscribers} />
          <Metric label={`საერთო პასუხები · ${metrics.relationships.answerUsers} მომხმარებელი`} value={metrics.relationships.answers} />
          <Metric label="გენერირებული weekly განახლებები" value={metrics.relationships.weeklyUpdates} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card/45 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Gauge className="size-5 text-[var(--vivida-gold)]" /><h2 className="text-lg font-semibold">კრედიტების ოთხკვირიანი კონტროლი</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">ზედა guardrail ზუსტად ბოლო 28 დღეს ითვლის; ქვემოთ მიმდინარე და წინა სამი კალენდარული კვირაა. უფასო = ყველა დადებითი ledger ჩანაწერი `purchase`-ის გარდა; ხარჯვა = ყველა უარყოფითი ჩანაწერის აბსოლუტური ჯამი. მიზანი ≤2.0×, დაკვირვება 2.0–2.5×, უფასო გაცემის ზრდის გაჩერება &gt;2.5×.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.creditWeeks.map((week) => <article key={week.weekStart} className={`rounded-xl border p-4 ${GUARDRAIL_STYLE[week.guardrail]}`}><div className="text-xs opacity-75">კვირა · {week.weekStart}</div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><Metric label="უფასო" value={week.freeIssued} /><Metric label="ნაყიდი" value={week.purchased} /><Metric label="ხარჯვა" value={week.spent} /></div><div className="mt-4 flex items-end justify-between"><span className="text-xs opacity-75">ratio</span><span className="text-xl font-semibold tabular-nums">{ratioLabel(week.ratio)}</span></div></article>)}
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">განახლება: გვერდის ყოველ გახსნაზე · დროის ზონა: Asia/Tbilisi · მონაცემთა წყაროები: experiment_assignment/event, reminder_preference_event/delivery, credit_transaction.</p>
    </main>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Activity }) {
  return <div className="rounded-2xl border border-border bg-card/55 p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4" />{label}</div><div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div></div>;
}

function Metric({ label, value, wide }: { label: string; value: string | number; wide?: boolean }) {
  return <div className={wide ? "rounded-xl border border-border/60 p-4 sm:col-span-2 lg:col-span-2" : undefined}><div className="text-lg font-semibold tabular-nums">{value}</div><div className="text-[10px] opacity-70">{label}</div></div>;
}
