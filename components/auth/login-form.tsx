"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import {
  requestVerificationEmail,
  signInWithEmail,
  verifyEmailWithCode,
} from "@/actions/auth";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Email/password login form. Reads `?verified=1` and `?verify_error=…`
 * from the search params so the verify-email route can drop the user
 * here with a status banner. Lets the user resend the verification email
 * inline if their account is unverified.
 */
export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const verified = params.get("verified") === "1";
  const verifyError = params.get("verify_error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resentMsg, setResentMsg] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();
  const [codePending, startCodeTransition] = useTransition();

  const submitDisabled =
    isPending || (TURNSTILE_ENABLED && !turnstileToken);

  // Show one-shot banner for query params, then clear them so a refresh
  // doesn't loop the message.
  useEffect(() => {
    if (verified || verifyError) {
      const t = setTimeout(() => router.replace("/login"), 5000);
      return () => clearTimeout(t);
    }
  }, [verified, verifyError, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResentMsg(null);
    startTransition(async () => {
      const result = await signInWithEmail({
        email,
        password,
        turnstileToken,
      });
      if (result.ok) {
        router.push("/feed");
        router.refresh();
        return;
      }
      setError(result.error);
      if (result.error.includes("არ არის დადასტურებული")) {
        setUnverifiedEmail(email);
      }
    });
  };

  const resend = () => {
    if (!unverifiedEmail) return;
    setResentMsg(null);
    startResendTransition(async () => {
      await requestVerificationEmail({ email: unverifiedEmail });
      setResentMsg("შემოწმე საფოსტო ყუთი — ახალი კოდი და ლინკი გაიგზავნა.");
    });
  };

  const verifyCode = () => {
    if (!unverifiedEmail || code.length !== 6) return;
    setCodeError(null);
    startCodeTransition(async () => {
      // Pass the password they just typed so a correct code both verifies
      // AND signs them in — straight into the app, no second "შესვლა".
      const res = await verifyEmailWithCode({
        email: unverifiedEmail,
        code: code.trim(),
        password,
      });
      if (res.ok && res.signedIn) {
        router.push("/feed");
        router.refresh();
      } else if (res.ok) {
        // Verified but auto-signin didn't take — clear the wall so they can
        // press "შესვლა" with the password they already typed.
        setCodeVerified(true);
        setError(null);
        setUnverifiedEmail(null);
      } else {
        setCodeError(res.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {verified && (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ელფოსტა დადასტურებულია. შედი ანგარიშში.
        </div>
      )}
      {verifyError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {verifyError === "expired"
            ? "ლინკი ვადაგასულია. შესვლის შემდეგ მოითხოვე ახალი ანგარიშის გვერდიდან."
            : "ლინკი არასწორია ან უკვე გამოყენებულია."}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">ელფოსტა</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">პაროლი</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            დაგავიწყდა?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </div>

      {error && (
        <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}

      {/* Unverified account: enter the emailed code (or resend it). */}
      {unverifiedEmail && (
        <div className="space-y-2 rounded-lg border border-border/60 bg-card/40 p-3">
          <Label htmlFor="login-code" className="text-xs text-muted-foreground">
            შეიყვანე ელფოსტაზე გამოგზავნილი 6-ნიშნა კოდი
          </Label>
          <div className="flex gap-2">
            <Input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={codePending}
              className="text-center tracking-[0.3em]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={verifyCode}
              disabled={codePending || code.length !== 6}
            >
              {codePending ? <Loader2 className="size-4 animate-spin" /> : "დადასტურება"}
            </Button>
          </div>
          {codeError && <p className="text-xs text-destructive">{codeError}</p>}
          <button
            type="button"
            onClick={resend}
            disabled={resendPending}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resendPending ? "ვაგზავნი…" : "ვერ მიიღე? ხელახლა გამოგზავნა"}
          </button>
        </div>
      )}

      {codeVerified && (
        <div className="rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
          ელფოსტა დადასტურდა. ახლა დააჭირე „შესვლას“.
        </div>
      )}
      {resentMsg && (
        <div className="rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
          {resentMsg}
        </div>
      )}

      <TurnstileWidget onChange={setTurnstileToken} />

      <Button
        type="submit"
        variant="mystic"
        size="lg"
        className="w-full"
        disabled={submitDisabled}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "შესვლა…" : "შესვლა"}
      </Button>
    </form>
  );
}
