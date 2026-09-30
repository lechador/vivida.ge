"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendPhoneVerificationCode,
  signInWithPhoneCode,
} from "@/actions/phone";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { formatGeorgianMobile, normalizeGeorgianMobile } from "@/lib/phone";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Phone-number sign-in: request an SMS code, then exchange (phone, code)
 * for a session through the "phone" credentials provider (auth.ts). Shown
 * as the second tab on /login — the email form is untouched.
 */
export function PhoneLoginForm({
  locale,
  dest,
  nextPath,
}: {
  locale: UserLocale;
  /** Post-login destination (already wrapped by /post-login). */
  dest: string;
  /** Raw safe ?next= path, kept for the signup cross-link. */
  nextPath: string | null;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  const signupHref = nextPath
    ? `/signup?next=${encodeURIComponent(nextPath)}`
    : "/signup";

  function send() {
    setError(null);
    setNoAccount(false);
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
        purpose: "login",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      trackEvent(ANALYTICS_EVENT.phoneCodeSent, { purpose: "login" });
      setStep("code");
      setCooldown(60);
      setNotice(
        en
          ? `Code sent to ${formatGeorgianMobile(normalized)}`
          : `კოდი გაიგზავნა: ${formatGeorgianMobile(normalized)}`,
      );
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "enter") {
      send();
      return;
    }
    setError(null);
    setNoAccount(false);
    const normalized = normalizeGeorgianMobile(phone);
    if (!normalized) {
      setError(en ? "Enter a valid mobile number." : "შეიყვანე სწორი ნომერი.");
      return;
    }
    startTransition(async () => {
      const result = await signInWithPhoneCode({ phone: normalized, code });
      if (result.ok) {
        trackEvent(ANALYTICS_EVENT.phoneLoginCompleted);
        router.push(dest);
        router.refresh();
        return;
      }
      setError(result.error);
      setNoAccount(result.code === "no_account");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="phone-login">
          {en ? "Mobile number" : "მობილურის ნომერი"}
        </Label>
        <Input
          id="phone-login"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+995 5XX XXX XXX"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          disabled={pending || step === "code"}
        />
      </div>

      {step === "code" && (
        <div className="space-y-3 rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => {
                setStep("enter");
                setCode("");
                setError(null);
                setCooldown(0);
              }}
              className="shrink-0 underline-offset-2 hover:underline"
            >
              {en ? "Change number" : "ნომრის შეცვლა"}
            </button>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="phone-login-code"
              className="text-xs text-muted-foreground"
            >
              {en
                ? "Enter the 6-digit code from the SMS"
                : "შეიყვანე SMS-ით მოსული 6-ნიშნა კოდი"}
            </Label>
            <Input
              id="phone-login-code"
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
              disabled={pending}
              className="text-center text-lg tracking-[0.4em]"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={send}
            disabled={pending || cooldown > 0}
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

      {error && (
        <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          {noAccount && (
            <Link
              href={signupHref}
              className="inline-block text-xs underline underline-offset-2"
            >
              {en ? "Create an account →" : "ანგარიშის შექმნა →"}
            </Link>
          )}
        </div>
      )}

      {step === "enter" ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={send}
          disabled={pending || cooldown > 0}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {en ? "Send code" : "კოდის მიღება"}
        </Button>
      ) : (
        <Button
          type="submit"
          variant="mystic"
          size="lg"
          className="w-full"
          disabled={pending || code.length !== 6}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {en ? "Sign in" : "შესვლა"}
        </Button>
      )}
    </form>
  );
}
