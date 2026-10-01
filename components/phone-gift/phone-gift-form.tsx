"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeorgianMobileInput } from "@/components/auth/georgian-mobile-input";
import { SmsMarketingToggle } from "@/components/auth/sms-marketing-toggle";
import { sendPhoneVerificationCode, verifyPhoneGift } from "@/actions/phone";
import { updateSmsMarketingConsent } from "@/actions/sms-marketing";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { PHONE_VERIFY_GIFT, SMS_CONSENT_GIFT } from "@/lib/credits-config";
import { formatGeorgianMobile, normalizeGeorgianMobile } from "@/lib/phone";
import type { UserLocale } from "@/lib/i18n/user-locale";

export type PhoneGiftSurface = "dashboard_popup" | "credits_card";

const TOTAL_GIFT = PHONE_VERIFY_GIFT + SMS_CONSENT_GIFT;

/**
 * The phone-gift form shared by the dashboard popup and the credits-page
 * card: number → SMS code → (optional) marketing toggle → verify, then the
 * granted-credit result. The server action decides the actual payout (10
 * credits, or 20 with the consent) and reports it back for display.
 */
export function PhoneGiftForm({
  locale,
  surface,
  onClaimed,
  onDone,
}: {
  locale: UserLocale;
  surface: PhoneGiftSurface;
  /** Fired once the verify succeeds, with the credited amount. */
  onClaimed?: (granted: number) => void;
  /** Fired when the user leaves the success state. */
  onDone?: () => void;
}) {
  const en = locale !== "ka";
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"enter" | "code" | "success">("enter");
  const [code, setCode] = useState("");
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [granted, setGranted] = useState(0);
  const [consentApplied, setConsentApplied] = useState(false);
  const [upsellError, setUpsellError] = useState<string | null>(null);
  const [upsellPending, startUpsell] = useTransition();
  const codeRef = useRef<HTMLInputElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent(ANALYTICS_EVENT.phoneGiftViewed, { surface });
  }, [surface]);

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
        purpose: "account",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      trackEvent(ANALYTICS_EVENT.phoneCodeSent, { purpose: "account" });
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
      const result = await verifyPhoneGift({
        phone: normalized,
        code,
        smsMarketing,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      trackEvent(ANALYTICS_EVENT.phoneVerified, { purpose: "account" });
      trackEvent(ANALYTICS_EVENT.phoneGiftClaimed, {
        surface,
        amount: result.granted,
        consent: smsMarketing,
      });
      setVerifiedPhone(normalized);
      setGranted(result.granted);
      setConsentApplied(smsMarketing);
      setStep("success");
      onClaimed?.(result.granted);
    });
  }

  function upgradeConsent() {
    setUpsellError(null);
    startUpsell(async () => {
      try {
        const result = await updateSmsMarketingConsent({
          phone: verifiedPhone,
          enabled: true,
        });
        if (!result.ok) {
          setUpsellError(
            en
              ? "Could not save your SMS preference. Please try again."
              : "SMS-ის პარამეტრი ვერ შეინახა. სცადე ხელახლა.",
          );
          return;
        }
        setConsentApplied(true);
        setGranted((value) => value + SMS_CONSENT_GIFT);
      } catch {
        setUpsellError(
          en
            ? "Could not save your SMS preference. Please try again."
            : "SMS-ის პარამეტრი ვერ შეინახა. სცადე ხელახლა.",
        );
      }
    });
  }

  if (step === "success") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 p-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--vivida-cyan)]" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">
              {formatGeorgianMobile(verifiedPhone)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {en ? "verified" : "დადასტურებული"}
              </span>
            </p>
            {granted > 0 && (
              <p className="mt-1 font-medium text-[var(--vivida-cyan)]">
                {en
                  ? `+${granted} credits added to your balance`
                  : `+${granted} კრედიტი დაგერიცხა ბალანსზე`}
              </p>
            )}
          </div>
        </div>

        {!consentApplied && (
          <div className="space-y-2">
            <SmsMarketingToggle
              locale={locale}
              checked={false}
              onChange={upgradeConsent}
              disabled={upsellPending}
            />
            <p className="text-xs text-muted-foreground">
              {en
                ? `Turn it on now and get +${SMS_CONSENT_GIFT} more credits.`
                : `ჩართე ახლავე და მიიღე კიდევ +${SMS_CONSENT_GIFT} კრედიტი.`}
            </p>
            {upsellError && (
              <p role="alert" className="text-xs text-destructive">
                {upsellError}
              </p>
            )}
          </div>
        )}

        {onDone && (
          <Button
            type="button"
            variant="mystic"
            className="w-full"
            onClick={onDone}
          >
            {en ? "Done" : "მშვენიერია"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {step === "enter" ? (
        <div className="flex gap-2">
          <GeorgianMobileInput
            locale={locale}
            value={phone}
            onChange={(digits) => {
              setPhone(digits);
              setError(null);
            }}
            disabled={pending}
          />
          <Button
            type="button"
            variant="outline"
            onClick={sendCode}
            disabled={pending || cooldown > 0}
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
              onClick={() => {
                setStep("enter");
                setCode("");
                setError(null);
                setNotice(null);
                setCooldown(0);
              }}
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
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              disabled={pending}
              className="text-center tracking-[0.3em]"
              aria-label={en ? "Verification code" : "დადასტურების კოდი"}
            />
            <Button
              type="button"
              onClick={verify}
              disabled={pending || code.length !== 6}
              className="shrink-0"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {en ? "Verify" : "დადასტურება"}
            </Button>
          </div>
          <button
            type="button"
            onClick={sendCode}
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

      <SmsMarketingToggle
        locale={locale}
        checked={smsMarketing}
        onChange={setSmsMarketing}
        disabled={pending}
      />

      <div className="flex items-center gap-2 rounded-xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 px-3 py-2 text-sm">
        <Sparkles className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
        <span>
          {en ? "Gift: " : "საჩუქარი: "}
          <strong className="tabular-nums">
            {smsMarketing ? TOTAL_GIFT : PHONE_VERIFY_GIFT}
          </strong>{" "}
          {en ? "credits" : "კრედიტი"}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
