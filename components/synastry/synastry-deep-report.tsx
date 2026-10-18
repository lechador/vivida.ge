"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import type { SynastryDeepReportJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ERRORS: Record<string, string> = {
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  generation_failed: "ანგარიშის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
};

const ERRORS_EN: Record<string, string> = {
  rate_limited: "You've reached today's limit. Try again tomorrow.",
  unavailable: "This service is temporarily unavailable.",
  generation_failed: "We couldn't create the report. Please try again.",
};

const GEN_MESSAGES = [
  "ვაანალიზებთ ორ რუკას…",
  "ვადარებთ პლანეტებსა და სახლებს…",
  "ვწერთ ღრმა ანგარიშს…",
];

const GEN_MESSAGES_EN = [
  "Analyzing both charts…",
  "Comparing planets and houses…",
  "Writing your in-depth report…",
];

const SECTIONS: {
  key: keyof SynastryDeepReportJson;
  code: string;
  title: string;
}[] = [
  { key: "love", code: "01", title: "სიყვარული და რომანტიკა" },
  { key: "communication", code: "02", title: "კომუნიკაცია და გონებრივი კავშირი" },
  { key: "trust", code: "03", title: "ნდობა და ემოციური უსაფრთხოება" },
  { key: "friction", code: "04", title: "ხახუნი და ზრდა" },
  { key: "longTerm", code: "05", title: "გრძელვადიანი პოტენციალი" },
];

const SECTIONS_EN: typeof SECTIONS = [
  { key: "love", code: "01", title: "Love and romance" },
  { key: "communication", code: "02", title: "Communication and mental connection" },
  { key: "trust", code: "03", title: "Trust and emotional safety" },
  { key: "friction", code: "04", title: "Friction and growth" },
  { key: "longTerm", code: "05", title: "Long-term potential" },
];

function paras(s: string): string[] {
  return (s || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function SynastryDeepReport({
  partnerId,
  partnerName,
  initial,
  locale,
}: {
  partnerId: string;
  partnerName: string;
  initial: SynastryDeepReportJson | null;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const messages = en ? GEN_MESSAGES_EN : GEN_MESSAGES;
  const sections = en ? SECTIONS_EN : SECTIONS;
  const [report, setReport] = useState<SynastryDeepReportJson | null>(initial);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (status !== "generating") return;
    const bar = setInterval(
      () => setProgress((p) => (p >= 92 ? 92 : p + (92 - p) * 0.04)),
      350,
    );
    const msg = setInterval(
      () => setStage((s) => (s + 1) % messages.length),
      3500,
    );
    return () => {
      clearInterval(bar);
      clearInterval(msg);
    };
  }, [messages.length, status]);

  async function generate() {
    setError(null);
    setProgress(8);
    setStatus("generating");
    try {
      const res = await fetch(`/api/synastry/${partnerId}/deep`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.report) {
        setError(
          (en ? ERRORS_EN : ERRORS)[data.error] ??
            (en
              ? "Something went wrong. Please try again."
              : "რაღაც ვერ მოხერხდა. სცადე ხელახლა."),
        );
        setStatus("error");
        return;
      }
      setReport(data.report as SynastryDeepReportJson);
      setStatus("idle");
    } catch {
      setError(
        en
          ? "Network error. Please try again."
          : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
      setStatus("error");
    }
  }

  if (report) {
    return (
      <article className="relative mt-10 overflow-hidden rounded-sm border border-border bg-card">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="border-b border-border bg-background/50 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Sparkles className="size-3.5" />
            {en ? "MONOGRAPH · IN-DEPTH SYNASTRY REPORT" : "მონოგრაფია · ღრმა ანგარიში"}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paras(report.intro).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-8 divide-y divide-border border-t border-border">
            {sections.map((s) => {
              const body = report[s.key];
              if (typeof body !== "string" || !body.trim()) return null;
              return (
                <section key={s.key} className="py-6">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    CHAPTER {s.code}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <div className="space-y-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                    {paras(body).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {report.advice.length > 0 && (
            <section className="mt-6 rounded-sm border border-primary/30 bg-primary/5 p-5">
              <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                {en ? "PRACTICAL PROTOCOL · ADVICE" : "პრაქტიკული რეკომენდაციები"}
              </h3>
              <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                {report.advice.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-1.5 inline-block size-1.5 shrink-0 bg-primary"
                    />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    );
  }

  if (status === "generating") {
    return (
      <div className="mt-10 rounded-sm border border-border bg-card p-6 text-center sm:p-8">
        <Loader2 className="mx-auto mb-3 size-6 animate-spin text-primary" />
        <p className="text-sm text-foreground/85">{messages[stage]}</p>
        <div className="mx-auto mt-4 h-1 w-full max-w-sm overflow-hidden bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {en ? "COMPUTING EPHEMERIS SYNTHESIS…" : "მიმდინარეობს ანგარიშის შედგენა…"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-10 overflow-hidden rounded-sm border border-primary/35 bg-card p-7 text-center sm:p-9">
      <CornerCrosshair position="tl" />
      <CornerCrosshair position="tr" />
      <CornerCrosshair position="bl" />
      <CornerCrosshair position="br" />

      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
        <Lock className="size-4.5" />
      </div>
      <h3 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {en ? "In-depth compatibility monograph" : "ღრმა თავსებადობის ანგარიში"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
        {en
          ? `A complete reading of your connection with ${partnerName}: love, communication, trust, friction, long-term potential, and practical advice.`
          : `${partnerName}-თან თქვენი კავშირის სრული წაკითხვა: სიყვარული, კომუნიკაცია, ნდობა, ხახუნი, გრძელვადიანი პოტენციალი და პრაქტიკული რჩევები.`}
      </p>
      <Button size="lg" className="mt-5" onClick={generate}>
        <Sparkles className="size-4" />
        {en ? "Create in-depth report" : "შექმენი ღრმა ანგარიში"}
      </Button>
      {status === "error" && error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
