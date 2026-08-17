"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SynastryDeepReportJson } from "@/db/schema";

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
  title: string;
  color: string;
}[] = [
  { key: "love", title: "სიყვარული და რომანტიკა", color: "var(--vivida-pink)" },
  {
    key: "communication",
    title: "კომუნიკაცია და გონებრივი კავშირი",
    color: "var(--vivida-cyan)",
  },
  {
    key: "trust",
    title: "ნდობა და ემოციური უსაფრთხოება",
    color: "var(--vivida-violet)",
  },
  { key: "friction", title: "ხახუნი და ზრდა", color: "var(--vivida-gold)" },
  {
    key: "longTerm",
    title: "გრძელვადიანი პოტენციალი",
    color: "var(--vivida-cyan)",
  },
];

const SECTIONS_EN: typeof SECTIONS = [
  { key: "love", title: "Love and romance", color: "var(--vivida-pink)" },
  {
    key: "communication",
    title: "Communication and mental connection",
    color: "var(--vivida-cyan)",
  },
  {
    key: "trust",
    title: "Trust and emotional safety",
    color: "var(--vivida-violet)",
  },
  {
    key: "friction",
    title: "Friction and growth",
    color: "var(--vivida-gold)",
  },
  {
    key: "longTerm",
    title: "Long-term potential",
    color: "var(--vivida-cyan)",
  },
];

function paras(s: string): string[] {
  return (s || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

import type { UserLocale } from "@/lib/i18n/user-locale";

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

  // Rendered report
  if (report) {
    return (
      <article className="mt-8 rounded-2xl border border-[var(--vivida-violet)]/30 bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)]">
          <Sparkles className="size-4" />
          {en ? "In-depth report" : "ღრმა ანგარიში"}
        </div>
        <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
          {paras(report.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {sections.map((s) => {
          const body = report[s.key];
          if (typeof body !== "string" || !body.trim()) return null;
          return (
            <section key={s.key} className="mt-8">
              <h3
                className="mb-3 text-lg font-semibold tracking-tight"
                style={{ color: s.color }}
              >
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

        {report.advice.length > 0 && (
          <section className="mt-8 rounded-xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/5 p-5">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
              {en ? "Practical advice" : "რჩევები"}
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {report.advice.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-0.5 text-[var(--vivida-cyan)]"
                  >
                    ◆
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    );
  }

  // Generating
  if (status === "generating") {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--vivida-violet)]/30 bg-card/55 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
        <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[var(--vivida-violet)]" />
        <p className="text-sm text-foreground/85">{messages[stage]}</p>
        <div className="mx-auto mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {en ? "This may take up to a minute." : "ერთ წუთამდე სჭირდება."}
        </p>
      </div>
    );
  }

  // CTA
  return (
    <div className="mt-8 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-pink)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
        <Lock className="size-5" />
      </div>
      <h3 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
        {en ? "In-depth compatibility report" : "ღრმა თავსებადობის ანგარიში"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
        {en
          ? `A complete reading of your connection with ${partnerName}—love, communication, trust, friction, long-term potential, and practical advice.`
          : `${partnerName}-თან თქვენი კავშირის სრული წაკითხვა — სიყვარული, კომუნიკაცია, ნდობა, ხახუნი, გრძელვადიანი პოტენციალი და პრაქტიკული რჩევები.`}
      </p>
      <Button variant="mystic" size="lg" className="mt-5" onClick={generate}>
        <Sparkles className="size-4" />
        {en ? "Create in-depth report" : "შექმენი ღრმა ანგარიში"}
      </Button>
      {status === "error" && error && (
        <p className="mt-3 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}
