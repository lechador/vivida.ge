"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, CalendarRange, CheckCircle2, Clock3, Heart, Layers3, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  REPORT_BUNDLES,
  REPORT_PRODUCTS,
  REPORT_PRODUCT_KEYS,
  bundleSavings,
  localized,
  type ReportBundleKey,
  type ReportProductKey,
} from "@/lib/report-catalog";

const ICONS = { annual: CalendarRange, relationship: Heart, career: BriefcaseBusiness, timing: Clock3 };
const ACCENTS = {
  violet: "var(--vivida-violet)", pink: "var(--vivida-pink)", cyan: "var(--vivida-cyan)", gold: "var(--vivida-gold)",
};

type RecentReport = { id: string; type: string; status: string; createdAt: string };
type Relationship = { id: string; displayName: string };

export function ReportStore({ locale, balance, premium, relationships, recentReports }: {
  locale: UserLocale; balance: number; premium: boolean; relationships: Relationship[]; recentReports: RecentReport[];
}) {
  const router = useRouter();
  const en = locale !== "ka";
  const [partnerId, setPartnerId] = useState(relationships[0]?.id ?? "");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(payload: { type?: ReportProductKey; bundleKey?: ReportBundleKey }) {
    const needsPartner = payload.type === "relationship" || (payload.bundleKey && (REPORT_BUNDLES[payload.bundleKey].products as readonly ReportProductKey[]).includes("relationship"));
    if (needsPartner && !partnerId) {
      setError(en ? "Add or choose a relationship first." : "ჯერ დაამატე ან აირჩიე ურთიერთობა.");
      return;
    }
    const key = payload.type ?? payload.bundleKey!;
    setPending(key);
    setError(null);
    try {
      const res = await fetch("/api/reports/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, partnerId: needsPartner ? partnerId : undefined }) });
      const data = await res.json();
      if (res.status === 402) {
        const product = payload.type ?? payload.bundleKey ?? "report";
        router.push(`/credits?need=${data.cost}&next=%2Freports&product=${product}`);
        return;
      }
      if (!res.ok) throw new Error(data.error === "no_chart" ? (en ? "Create your natal chart first." : "ჯერ შექმენი ნატალური რუკა.") : (en ? "The purchase could not be completed." : "შეძენა ვერ დასრულდა."));
      router.push(data.url);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (en ? "Something went wrong." : "რაღაც ვერ მოხერხდა."));
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{en ? "Available balance" : "ხელმისაწვდომი ბალანსი"}</div>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold"><Sparkles className="size-5 text-[var(--vivida-cyan)]" />{premium ? "PRO · ∞" : `${balance} ${en ? "credits" : "კრედიტი"}`}</div>
        </div>
        {!premium && <Button asChild variant="outline"><Link href="/credits?next=%2Freports">{en ? "Top up credits" : "კრედიტების შევსება"}</Link></Button>}
      </div>

      {relationships.length > 0 && (
        <div className="mb-6 max-w-sm">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="report-partner">{en ? "Relationship report subject" : "ვისთან ურთიერთობის რეპორტი"}</label>
          <select id="report-partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--vivida-violet)]/40">
            {relationships.map((relationship) => <option key={relationship.id} value={relationship.id}>{relationship.displayName}</option>)}
          </select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_PRODUCT_KEYS.map((key) => {
          const product = REPORT_PRODUCTS[key];
          const Icon = ICONS[key];
          const accent = ACCENTS[product.accent];
          return (
            <article key={key} className="relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
              <div aria-hidden className="absolute -right-12 -top-12 size-36 rounded-full blur-3xl" style={{ background: `color-mix(in oklch, ${accent} 24%, transparent)` }} />
              <div className="relative flex items-start justify-between gap-4">
                <div className="grid size-11 place-items-center rounded-2xl" style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}><Icon className="size-5" /></div>
                <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-sm font-semibold tabular-nums">{product.credits} ✦</span>
              </div>
              <h2 className="relative mt-5 text-xl font-semibold tracking-tight">{localized(product.title, locale)}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-foreground/70">{localized(product.description, locale)}</p>
              <ul className="relative mt-4 space-y-2 text-sm text-foreground/85">
                {product.includes.map((item) => <li key={item.ka} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />{localized(item, locale)}</li>)}
              </ul>
              <Button variant="mystic" className="relative mt-6 w-full" disabled={pending !== null || (key === "relationship" && !partnerId)} onClick={() => buy({ type: key })}>
                {pending === key && <Loader2 className="size-4 animate-spin" />}{key === "relationship" && !partnerId ? (en ? "Add a relationship first" : "ჯერ დაამატე ურთიერთობა") : (en ? "Get report" : "რეპორტის მიღება")}
              </Button>
            </article>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2"><Layers3 className="size-5 text-[var(--vivida-violet)]" /><h2 className="text-xl font-semibold">{en ? "Report bundles" : "რეპორტების bundle-ები"}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(REPORT_BUNDLES) as ReportBundleKey[]).map((key) => {
            const bundle = REPORT_BUNDLES[key];
            const names = bundle.products.map((product) => localized(REPORT_PRODUCTS[product].shortTitle, locale)).join(" · ");
            const needsPartner = (bundle.products as readonly ReportProductKey[]).includes("relationship");
            return (
              <article key={key} className="rounded-2xl border border-[var(--vivida-violet)]/25 bg-[var(--vivida-violet)]/7 p-5">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{localized(bundle.title, locale)}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{names}</p></div><div className="shrink-0 text-right"><div className="font-semibold tabular-nums">{bundle.credits} ✦</div><div className="text-[11px] text-[var(--vivida-cyan)]">{en ? `Save ${bundleSavings(key)}` : `დაზოგე ${bundleSavings(key)}`}</div></div></div>
                <Button variant="outline" className="mt-4 w-full" disabled={pending !== null || (needsPartner && !partnerId)} onClick={() => buy({ bundleKey: key })}>{pending === key && <Loader2 className="size-4 animate-spin" />}{en ? "Choose bundle" : "bundle-ის არჩევა"}</Button>
              </article>
            );
          })}
        </div>
      </section>

      {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {recentReports.length > 0 && (
        <section className="mt-10"><h2 className="mb-3 text-lg font-semibold">{en ? "Your reports" : "შენი რეპორტები"}</h2><div className="space-y-2">{recentReports.map((report) => {
          const product = isProduct(report.type) ? REPORT_PRODUCTS[report.type] : null;
          return <Link key={report.id} href={`/reports/${report.id}`} className="flex items-center justify-between rounded-xl border border-border bg-card/45 px-4 py-3 transition-colors hover:bg-card/75"><span className="font-medium">{product ? localized(product.shortTitle, locale) : (en ? "Natal report" : "ნატალური რეპორტი")}</span><span className="text-xs text-muted-foreground">{statusLabel(report.status, locale)} →</span></Link>;
        })}</div></section>
      )}
    </>
  );
}

function isProduct(type: string): type is ReportProductKey { return REPORT_PRODUCT_KEYS.includes(type as ReportProductKey); }
function statusLabel(status: string, locale: UserLocale) {
  if (status === "ready") return locale === "ka" ? "მზადაა" : "Ready";
  if (status === "failed") return locale === "ka" ? "ხელახლა სცადე" : "Retry";
  return locale === "ka" ? "იქმნება" : "Generating";
}
