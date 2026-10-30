"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart, Loader2, Lock } from "lucide-react";

import { ContextualPaywallActions } from "@/components/billing/contextual-paywall-actions";
import type {
  SynastryChatResult,
  SynastryProposal,
} from "@/lib/ask-synastry-pure";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Cards rendered inside the AI chat for the synastry flow.
 *  - SynastryProposalCard: explicit confirm step. Credits are only charged by
 *    the request this button fires, never by the model.
 *  - SynastryResultCard: the finished reading shown in the thread, with a link
 *    to the full page.
 */

function whenLine(p: SynastryProposal, en: boolean): string {
  const time = p.time ?? (en ? "time unknown" : "დრო უცნობია");
  return `${p.date} · ${time} · ${p.cityName}`;
}

export function SynastryProposalCard({
  proposal,
  locale,
  resolved,
  onResult,
}: {
  proposal: SynastryProposal;
  locale: UserLocale;
  /** A result for this proposal already exists later in the thread. */
  resolved: boolean;
  onResult: (content: string) => void;
}) {
  const en = locale !== "ka";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortfall, setShortfall] = useState<{
    balance: number;
    cost: number;
  } | null>(
    proposal.status === "insufficient"
      ? { balance: proposal.balance, cost: proposal.cost }
      : null,
  );
  const [done, setDone] = useState(resolved);

  async function confirm() {
    if (busy || done) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ask/synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: proposal.name,
          date: proposal.date,
          time: proposal.time,
          cityName: proposal.cityName,
          latitude: proposal.latitude,
          longitude: proposal.longitude,
          timezone: proposal.timezone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setShortfall({
          balance: typeof data.balance === "number" ? data.balance : 0,
          cost: typeof data.cost === "number" ? data.cost : proposal.cost,
        });
        return;
      }
      if (!res.ok || typeof data.content !== "string") {
        setError(
          data.error === "no_chart"
            ? en
              ? "Create your natal chart first."
              : "ჯერ შენი რუკა უნდა შეიქმნას."
            : data.error === "rate_limited"
              ? en
                ? "Daily limit reached. Try again tomorrow."
                : "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ."
              : (data.message as string | undefined) ||
                (en
                  ? "Something went wrong. Please try again."
                  : "რაღაც ვერ მოხერხდა. სცადე ხელახლა."),
        );
        return;
      }
      setDone(true);
      onResult(data.content);
    } catch {
      setError(
        en
          ? "Network error. Please try again."
          : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
    } finally {
      setBusy(false);
    }
  }

  const costLine =
    proposal.status === "pro"
      ? en
        ? "Included with PRO, no credits needed."
        : "PRO-ს ფარგლებში უფასოა, კრედიტი არ დაგჭირდება."
      : proposal.status === "already"
        ? en
          ? "Already unlocked, free to open."
          : "უკვე გახსნილია, უფასოდ ნახავ."
        : en
          ? `Costs ${proposal.cost} credits on Vivida (you have ${proposal.balance}).`
          : `Vivida-ზე ღირს ${proposal.cost} კრედიტი (შენი ბალანსია ${proposal.balance}).`;

  return (
    <div className="rounded-md border border-primary/35 bg-card p-3.5 sm:p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
        <Heart className="size-3.5" aria-hidden />
        {en ? "Compatibility reading" : "თავსებადობის ანალიზი"}
      </div>
      <p className="mt-1.5 text-[15px] font-medium text-foreground sm:text-base">
        {en ? `You × ${proposal.name}` : `შენ × ${proposal.name}`}
      </p>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
        {whenLine(proposal, en)}
      </p>
      <p className="mt-2 text-sm text-foreground/85">{costLine}</p>

      {shortfall ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2.5 flex items-start gap-1.5 text-sm text-foreground/85">
            <Lock
              className="mt-0.5 size-3.5 shrink-0 text-primary"
              aria-hidden
            />
            {en
              ? `You need ${shortfall.cost} credits (you have ${shortfall.balance}). Top up or get PRO, and I will create it right away.`
              : `გჭირდება ${shortfall.cost} კრედიტი (გაქვს ${shortfall.balance}). შეავსე ბალანსი ან აიღე PRO და მაშინვე შევქმნი.`}
          </p>
          <ContextualPaywallActions
            locale={locale}
            balance={shortfall.balance}
            cost={shortfall.cost}
            product="synastry"
            returnTo="/ask"
            placement="chart_chat_synastry"
          />
          {!done && (
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy}
              className="mt-3 inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Heart className="size-4" aria-hidden />
              )}
              {en ? "I topped up, create now" : "შევავსე, შექმენი ახლა"}
            </button>
          )}
        </div>
      ) : done ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {en
            ? "Created, see the result below."
            : "შექმნილია, შედეგი ქვემოთაა."}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={busy}
          className="mt-3 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Heart className="size-4" aria-hidden />
          )}
          {proposal.status === "pay"
            ? en
              ? `Create for ${proposal.cost} credits`
              : `შექმნა ${proposal.cost} კრედიტად`
            : en
              ? "Create compatibility"
              : "თავსებადობის შექმნა"}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SynastryResultCard({
  result,
  locale,
}: {
  result: SynastryChatResult;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  return (
    <div className="rounded-md border border-primary/35 bg-card p-3.5 sm:p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
        <Heart className="size-3.5" aria-hidden />
        {en ? "Compatibility" : "თავსებადობა"}
      </div>
      <div className="mt-1.5 flex items-baseline gap-3">
        <span className="text-3xl font-semibold tabular-nums text-foreground">
          {result.overall}%
        </span>
        <span className="text-sm text-foreground/85">
          {en ? `You × ${result.name}` : `შენ × ${result.name}`} ·{" "}
          {result.verdict}
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {result.scores.map((s) => (
          <li key={s.id} className="text-[13px]">
            <div className="flex justify-between text-foreground/85">
              <span>
                {s.emoji} {s.label}
              </span>
              <span className="tabular-nums">{s.value}%</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, s.value))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {result.aspects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {result.aspects.map((a) => (
            <span
              key={a}
              className="rounded-sm border border-border bg-secondary/40 px-2 py-0.5 text-xs text-foreground/85"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {result.summary && (
        <p className="mt-3 text-[14px] leading-relaxed text-foreground/90">
          {result.summary}
        </p>
      )}
      {result.strengths.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-foreground/85">
          {result.strengths.map((t) => (
            <li key={t}>+ {t}</li>
          ))}
        </ul>
      )}
      {result.growth.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-foreground/85">
          {result.growth.map((t) => (
            <li key={t}>~ {t}</li>
          ))}
        </ul>
      )}

      <Link
        href={result.url}
        className="mt-3.5 inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20"
      >
        {en ? "Open the full compatibility" : "სრული თავსებადობის გახსნა"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
