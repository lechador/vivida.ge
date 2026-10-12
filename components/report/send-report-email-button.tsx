"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

type State = "idle" | "sending" | "sent" | "error";

/**
 * "Email me the PDF" next to the download button on a finished report.
 *
 * The address is never asked for, it mails the account's own address, which
 * the success line then names, because the one thing a person needs to know
 * after pressing this is *which inbox* to go and look in.
 *
 * Stays pressable after a successful send: "it never arrived" is exactly when
 * someone wants to press it again. The server rate-limits.
 */
export function SendReportEmailButton({
  reportId,
  locale = "ka",
  size = "lg",
  variant = "outline",
  className,
}: {
  reportId: string;
  locale?: UserLocale;
  size?: "default" | "lg" | "xl";
  variant?: "outline" | "mystic" | "ghost";
  className?: string;
}) {
  const en = locale !== "ka";
  const [state, setState] = useState<State>("idle");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function errorFor(code: string | undefined): string {
    if (code === "rate_limited") {
      return en
        ? "Too many emails for now. Please try again in an hour."
        : "ძალიან ბევრი წერილი გაიგზავნა. სცადე ერთ საათში.";
    }
    if (code === "no_email") {
      return en
        ? "There's no email address on your account."
        : "შენს ანგარიშზე ელფოსტა მითითებული არ არის.";
    }
    if (code === "not_ready") {
      return en ? "The report isn't ready yet." : "ანგარიში ჯერ არ არის მზად.";
    }
    return en
      ? "We couldn't send it. Please try again."
      : "გაგზავნა ვერ მოხერხდა. სცადე ხელახლა.";
  }

  async function send() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/email`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(errorFor(data.error));
        setState("error");
        return;
      }
      setSentTo(typeof data.to === "string" ? data.to : null);
      setState("sent");
    } catch {
      setError(
        en
          ? "Network error. Please try again."
          : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
      setState("error");
    }
  }

  const label =
    state === "sent"
      ? en
        ? "Sent"
        : "გაიგზავნა"
      : en
        ? "Email me the PDF"
        : "გამომიგზავნე PDF ელფოსტაზე";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={send}
        disabled={state === "sending"}
      >
        {state === "sending" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : state === "sent" ? (
          <Check className="size-4 text-[var(--vivida-cyan)]" />
        ) : (
          <Mail className="size-4" />
        )}
        {label}
      </Button>

      {state === "sent" && (
        <p className="text-xs text-foreground/70">
          {sentTo
            ? en
              ? `Sent to ${sentTo}, check your inbox.`
              : `გაიგზავნა ${sentTo}-ზე, შეამოწმე ფოსტა.`
            : en
              ? "Check your inbox."
              : "შეამოწმე ფოსტა."}
        </p>
      )}
      {state === "error" && error && (
        <p className="text-xs text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}
