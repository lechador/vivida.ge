"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SendReportEmailButton } from "./send-report-email-button";
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
const STAGE_MESSAGES_AM = [
  "Հաստատում ենք գնումը…",
  "Վերլուծում ենք ձեր նատալ քարտեզը…",
  "Կարդում ենք մոլորակների լեզուն…",
  "Գրում ենք ձեր անձնական մեկնաբանությունը…",
  "Վերլուծում ենք տներն ու ասպեկտները…",
  "Ձևավորում ենք ձեր PDF-ը…",
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
  title,
}: {
  reportId: string;
  initialStatus: Status;
  locale?: UserLocale;
  title?: string;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const stageMessages = am ? STAGE_MESSAGES_AM : en ? STAGE_MESSAGES_EN : STAGE_MESSAGES;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(initialStatus === "ready" ? 100 : 6);
  const [stage, setStage] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryable, setRetryable] = useState(initialStatus === "failed");

  const done = status === "ready";
  const failed = status === "failed";
  const terminal = done || failed;

  const poll = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { cache: "no-store" });
      if (!res.ok) return false;
      const data = await res.json();
      setStatus(data.status as Status);
      setRetryable(Boolean(data.retryable));
      if (data.status === "failed") setError(data.error ?? null);
      return data.status === "ready" || data.status === "failed";
    } catch {
      /* transient — keep polling */
      return false;
    }
  }, [reportId]);

  // Poll the status endpoint until the report reaches a terminal state. The
  // effect re-runs when `terminal` flips and tears down the interval — legit
  // external-system subscription, hence the setState-in-callback.
  useEffect(() => {
    if (terminal) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delayMs = 5_000;
    const run = async () => {
      if (cancelled || document.visibilityState === "hidden") return;
      const finished = await poll();
      if (cancelled || finished) return;
      timer = setTimeout(run, delayMs);
      delayMs = Math.min(delayMs * 2, 15_000);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        delayMs = 5_000;
        void run();
      }
    };
    void run();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
      const response = await fetch(`/api/reports/${reportId}`, { method: "POST" });
      if (!response.ok) {
        setError(am ? "Կրկին ստեղծումը չհաջողվեց սկսել։ Խնդրում ենք քիչ անց նորից փորձել։" : en ? "The retry could not be started. Please try again shortly." : "ხელახალი გენერაცია ვერ გაეშვა. ცოტა ხანში ისევ სცადე.");
        return;
      }
      setStatus("paid");
      setRetryable(false);
      setProgress(8);
      void poll();
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
            {title ? `${title} — ${am ? "պատրաստ է 🌟" : en ? "ready 🌟" : "მზადაა 🌟"}` : am ? "Ձեր զեկույցը պատրաստ է։ 🌟" : en ? "Your report is ready! 🌟" : "ანგარიში მზადაა! 🌟"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-foreground/75">
            {am
              ? "Ձեր անձնական զեկույցը պատրաստ է։ Ներբեռնեք և պահեք այն ընդմիշտ։"
              : en
                ? "Your personal report is complete. Download it and keep it forever."
                : "შენი პერსონალური რეპორტი დასრულდა. ჩამოტვირთე — ის სამუდამოდ შენთან რჩება."}
          </p>
          <Button asChild variant="mystic" size="xl" className="mt-6 min-w-56">
            <a href={`/api/reports/${reportId}/download`}>
              <Download className="size-5" />
              {am ? "Ներբեռնել PDF" : en ? "Download PDF" : "ჩამოტვირთე PDF"}
            </a>
          </Button>
          <SendReportEmailButton
            reportId={reportId}
            locale={locale}
            className="mt-3 items-center"
          />
        </div>
      ) : failed ? (
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold">
            {am ? "Զեկույցի ստեղծումն ընդհատվել է" : en ? "Report generation was interrupted" : "გენერაცია შეფერხდა"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-foreground/75">
            {am
              ? "PDF-ը ստեղծելիս սխալ առաջացավ։ Գնումը պահպանված է, և կարող եք անվճար կրկին փորձել։"
              : en
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
            {am ? "Կրկին փորձել" : en ? "Try again" : "სცადე ხელახლა"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
            <Loader2 className="size-7 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold">
            {am ? "Ստեղծվում է ձեր զեկույցը" : en ? "Creating your report" : "ვქმნით შენს ანგარიშს"}
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
            {am
              ? "Խնդրում ենք բաց պահել այս էջը․ սովորաբար մեկ րոպեից պակաս է տևում։"
              : en
                ? "Please keep this page open. It usually takes less than a minute."
                : "გთხოვ, არ დახურო ეს გვერდი — ჩვეულებრივ ერთ წუთზე ნაკლები სჭირდება."}
          </p>
          {retryable && (
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={retry}
              disabled={retrying}
            >
              {retrying ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {am ? "Կրկին սկսել ստեղծումը" : en ? "Restart generation" : "გენერაციის ხელახლა გაშვება"}
            </Button>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
