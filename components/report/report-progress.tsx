"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

type Status = "pending" | "paid" | "generating" | "ready" | "failed";

const STAGE_MESSAGES = [
  "ვადასტურებთ გადახდას…",
  "ვაანალიზებთ შენს რუკას…",
  "ვკითხულობთ პლანეტების ენას…",
  "ვწერთ შენს პერსონალურ ინტერპრეტაციას…",
  "ვაანალიზებთ სახლებსა და ასპექტებს…",
  "ვაფორმებთ ლამაზ PDF-ს…",
];

const STAGE_MESSAGES_EN = [
  "Confirming your payment…",
  "Analyzing your natal chart…",
  "Reading the language of the planets…",
  "Writing your personal interpretation…",
  "Analyzing houses and aspects…",
  "Designing your PDF…",
];

/**
 * Live status for a report. Generation is opaque (parallel LLM calls + PDF
 * render), so we show an eased "crawl" progress bar with rotating Georgian
 * stage messages while polling the status endpoint, then reveal the download
 * when it's ready.
 */
export function ReportProgress({
  reportId,
  initialStatus,
  locale = "ka",
}: {
  reportId: string;
  initialStatus: Status;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const stageMessages = en ? STAGE_MESSAGES_EN : STAGE_MESSAGES;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(initialStatus === "ready" ? 100 : 6);
  const [stage, setStage] = useState(0);
  const [retrying, setRetrying] = useState(false);

  const done = status === "ready";
  const failed = status === "failed";
  const terminal = done || failed;

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status as Status);
      if (data.status === "failed") setError(data.error ?? null);
    } catch {
      /* transient — keep polling */
    }
  }, [reportId]);

  // Poll the status endpoint until the report reaches a terminal state. The
  // effect re-runs when `terminal` flips and tears down the interval — legit
  // external-system subscription, hence the setState-in-callback.
  useEffect(() => {
    if (terminal) return;
    // Immediate kick before the first interval tick; poll() only setStates
    // after an async fetch resolves, so this isn't a synchronous cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    const id = setInterval(() => void poll(), 2500);
    return () => clearInterval(id);
  }, [terminal, poll]);

  // Eased progress crawl + rotating stage messages while generating.
  useEffect(() => {
    if (terminal) return;
    const bar = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + (92 - p) * 0.035));
    }, 350);
    const msg = setInterval(() => {
      setStage((s) => (s + 1) % stageMessages.length);
    }, 3500);
    return () => {
      clearInterval(bar);
      clearInterval(msg);
    };
  }, [stageMessages.length, terminal]);

  async function retry() {
    setRetrying(true);
    setError(null);
    try {
      await fetch(`/api/reports/${reportId}`, { method: "POST" });
      setStatus("paid");
      setProgress(8);
      poll();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card/65 p-8 ring-1 ring-foreground/5 backdrop-blur-xl">
      {done ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid size-14 place-items-center rounded-full bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-2xl font-semibold">
            {en ? "Your report is ready! 🌟" : "ანგარიში მზადაა! 🌟"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-foreground/75">
            {en
              ? "Your personal natal report is complete. Download it and keep it forever."
              : "შენი პერსონალური ნატალური ანგარიში დასრულდა. ჩამოტვირთე — ის სამუდამოდ შენთან რჩება."}
          </p>
          <Button asChild variant="mystic" size="xl" className="mt-6 min-w-56">
            <a href={`/api/reports/${reportId}/download`}>
              <Download className="size-5" />
              {en ? "Download PDF" : "ჩამოტვირთე PDF"}
            </a>
          </Button>
        </div>
      ) : failed ? (
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold">
            {en ? "Report generation was interrupted" : "გენერაცია შეფერხდა"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-foreground/75">
            {en
              ? "Something went wrong while creating the PDF. Your payment is saved, so you can retry at no extra cost."
              : "რაღაც ვერ მოხერხდა PDF-ის შექმნისას. გადახდა შენახულია — სცადე ხელახლა დამატებითი საფასურის გარეშე."}
          </p>
          {error && <p className="mt-2 text-xs text-muted-foreground">{error}</p>}
          <Button
            variant="mystic"
            size="lg"
            className="mt-6"
            onClick={retry}
            disabled={retrying}
          >
            {retrying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {en ? "Try again" : "სცადე ხელახლა"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
            <Loader2 className="size-7 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold">
            {en ? "Creating your report" : "ვქმნით შენს ანგარიშს"}
          </h2>
          <p className="mt-2 h-5 text-sm text-foreground/75 transition-opacity">
            {status === "pending" ? stageMessages[0] : stageMessages[stage]}
          </p>
          <div className="mt-6 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {en
              ? "Please keep this page open. It usually takes less than a minute."
              : "გთხოვ, არ დახურო ეს გვერდი — ჩვეულებრივ ერთ წუთზე ნაკლები სჭირდება."}
          </p>
        </div>
      )}
    </div>
  );
}
