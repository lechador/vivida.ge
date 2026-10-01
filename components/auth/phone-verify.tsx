"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeorgianMobileInput } from "@/components/auth/georgian-mobile-input";
import {
  sendPhoneVerificationCode,
  verifyAccountPhone,
  verifySignupPhone,
} from "@/actions/phone";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { formatGeorgianMobile, normalizeGeorgianMobile } from "@/lib/phone";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Inline "enter number → SMS code → verified" widget, shared by the signup
 * form (purpose "signup") and the account phone card ("account"). Owns the
 * intermediate UI states; the parent decides what happens once verified
 * (signup stores the claim token, the account card just refreshes).
 */
export function PhoneVerify({
  locale,
  purpose,
  disabled = false,
  onVerified,
  onReset,
  onInputChange,
}: {
  locale: UserLocale;
  purpose: "signup" | "account";
  disabled?: boolean;
  /** Fired once the code checks out. claimToken is set for signup only. */
  onVerified: (result: { phone: string; claimToken: string | null }) => void;
  /** Fired when a previously entered number is edited/reset. */
  onReset?: () => void;
  /** Mirrors raw input so the parent can block half-filled submits. */
  onInputChange?: (value: string) => void;
}) {
  const en = locale !== "ka";
  const [phone, setPhone] = useState("");
  /** Display copy of the verified number (E.164) — the input state stays
   *  raw so "change" restores exactly what the user typed. */
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [step, setStep] = useState<"enter" | "code" | "verified">("enter");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  function sendCode() {
    setError(null);
    const normalized = normalizeGeorgianMobile(phone);
    if (!normalized) {
      setError(
        en
          ? "Enter a valid Georgian mobile number (e.g. +995 555 123 456)."
          : "შეიყვანე ქართული მობილურის ნომერი სწორად (მაგ. +995 555 123 456).",
      );
      return;
    }
    startTransition(async () => {
      const result = await sendPhoneVerificationCode({
        phone: normalized,
        purpose,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      trackEvent(ANALYTICS_EVENT.phoneCodeSent, { purpose });
      setStep("code");
      setCooldown(60);
      setNotice(
        en
          ? `Code sent to ${formatGeorgianMobile(normalized)}`
          : `კოდი გაიგზავნა: ${formatGeorgianMobile(normalized)}`,
      );
      requestAnimationFrame(() => codeRef.current?.focus());
    });
  }

  function verify() {
    setError(null);
    const normalized = normalizeGeorgianMobile(phone);
    if (!normalized) {
      setError(
        en ? "Enter a valid Georgian mobile number." : "შეიყვანე სწორი ნომერი.",
      );
      return;
    }
    startTransition(async () => {
      if (purpose === "signup") {
        const result = await verifySignupPhone({ phone: normalized, code });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        trackEvent(ANALYTICS_EVENT.phoneVerified, { purpose });
        setVerifiedPhone(normalized);
        setStep("verified");
        onVerified({ phone: normalized, claimToken: result.claimToken });
      } else {
        const result = await verifyAccountPhone({ phone: normalized, code });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        trackEvent(ANALYTICS_EVENT.phoneVerified, { purpose });
        setVerifiedPhone(normalized);
        setStep("verified");
        onVerified({ phone: normalized, claimToken: null });
      }
    });
  }

  function editAgain() {
    setStep("enter");
    setCode("");
    setError(null);
    setNotice(null);
    setCooldown(0);
    onReset?.();
  }

  if (step === "verified") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm text-[var(--vivida-cyan)]">
          <CheckCircle2 className="size-4 shrink-0" />
          {formatGeorgianMobile(verifiedPhone)}
          <span className="text-xs opacity-80">
            {en ? "verified" : "დადასტურებული"}
          </span>
        </span>
        <button
          type="button"
          onClick={editAgain}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {en ? "Change" : "შეცვლა"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {step === "enter" ? (
        <div className="flex gap-2">
          <GeorgianMobileInput
            locale={locale}
            value={phone}
            onChange={(digits) => {
              setPhone(digits);
              setError(null);
              onInputChange?.(digits);
            }}
            disabled={pending || disabled}
          />
          <Button
            type="button"
            variant="outline"
            onClick={sendCode}
            disabled={pending || disabled || cooldown > 0}
            className="shrink-0"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {cooldown > 0
              ? `${cooldown}${en ? "s" : "წმ"}`
              : en
                ? "Send code"
                : "კოდის მიღება"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{notice}</span>
            <button
              type="button"
              onClick={editAgain}
              className="shrink-0 underline-offset-2 hover:underline"
            >
              {en ? "Change number" : "ნომრის შეცვლა"}
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              ref={codeRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              disabled={pending || disabled}
              className="text-center tracking-[0.3em]"
              aria-label={en ? "Verification code" : "დადასტურების კოდი"}
            />
            <Button
              type="button"
              onClick={verify}
              disabled={pending || disabled || code.length !== 6}
              className="shrink-0"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {en ? "Verify" : "დადასტურება"}
            </Button>
          </div>
          <button
            type="button"
            onClick={sendCode}
            disabled={pending || disabled || cooldown > 0}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60"
          >
            {cooldown > 0
              ? en
                ? `Resend in ${cooldown}s`
                : `ხელახლა გაგზავნა ${cooldown} წმ-ში`
              : en
                ? "Didn't receive it? Send again"
                : "ვერ მიიღე? ხელახლა გაგზავნა"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
