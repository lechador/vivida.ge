"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import {
  requestVerificationEmail,
  signInWithEmail,
  verifyEmailWithCode,
} from "@/actions/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { normalizeReturnPath } from "@/lib/safe-return-path";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Email/password login form. Reads `?verified=1` and `?verify_error=…`
 * from the search params so the verify-email route can drop the user
 * here with a status banner. Lets the user resend the verification email
 * inline if their account is unverified.
 */
export function LoginForm({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const params = useSearchParams();
  const router = useRouter();
  const verified = params.get("verified") === "1";
  const verifyError = params.get("verify_error");
  // Post-login destination — only same-origin relative paths (no open redirect).
  // Defaults to the intent-aware resolver: incomplete profiles land on
  // onboarding, complete ones on their destination (or dashboard).
  const nextParam = params.get("next");
  const safeNext = nextParam
    ? normalizeReturnPath(nextParam, "") || null
    : null;
  const dest = safeNext
    ? `/post-login?next=${encodeURIComponent(safeNext)}`
    : "/post-login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resentMsg, setResentMsg] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();
  const [codePending, startCodeTransition] = useTransition();
  // Email form vs. phone-number sign-in tab. Email is the default.
  const [mode, setMode] = useState<"email" | "phone">("email");

  const submitDisabled = isPending || (TURNSTILE_ENABLED && !turnstileToken);

  // Show one-shot banner for query params, then clear them so a refresh
  // doesn't loop the message.
  useEffect(() => {
    if (verified || verifyError) {
      const loginPath = safeNext
        ? `/login?next=${encodeURIComponent(safeNext)}`
        : "/login";
      const t = setTimeout(() => router.replace(loginPath), 5000);
      return () => clearTimeout(t);
    }
  }, [verified, verifyError, router, safeNext]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResentMsg(null);
    startTransition(async () => {
      try {
        const result = await signInWithEmail({
          email,
          password,
          turnstileToken,
        });
        if (result.ok) {
          router.push(dest);
          router.refresh();
          return;
        }
        setError(result.error);
        if (result.code === "email_unverified") {
          setUnverifiedEmail(email);
        }
      } catch {
        setError(
          en
            ? "Could not sign in. Please try again."
            : "შესვლა ვერ მოხერხდა. სცადე ხელახლა.",
        );
      } finally {
        // Turnstile tokens are single-use, including when credentials fail.
        setTurnstileToken(null);
        setTurnstileResetKey((key) => key + 1);
      }
    });
  };

  const resend = () => {
    if (!unverifiedEmail) return;
    setResentMsg(null);
    startResendTransition(async () => {
      try {
        const result = await requestVerificationEmail({
          email: unverifiedEmail,
        });
        if (result.ok) {
          setCodeError(null);
          setResentMsg(
            en
              ? "Check your inbox—a new code and link have been sent."
              : "შემოწმე საფოსტო ყუთი — ახალი კოდი და ლინკი გაიგზავნა.",
          );
        } else {
          setCodeError(result.error);
        }
      } catch {
        setCodeError(
          en
            ? "Could not send a new code. Please try again."
            : "ახალი კოდის გაგზავნა ვერ მოხერხდა. სცადე ხელახლა.",
        );
      }
    });
  };

  const verifyCode = () => {
    if (!unverifiedEmail || code.length !== 6) return;
    setCodeError(null);
    startCodeTransition(async () => {
      try {
        // Pass the password they just typed so a correct code both verifies
        // AND signs them in — straight into the app, no second "შესვლა".
        const res = await verifyEmailWithCode({
          email: unverifiedEmail,
          code: code.trim(),
          password,
        });
        if (res.ok && res.signedIn) {
          router.push(dest);
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
      } catch {
        setCodeError(
          en
            ? "Could not verify the code. Please try again."
            : "კოდის შემოწმება ვერ მოხერხდა. სცადე ხელახლა.",
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Phone sign-in is Georgian-host only (SMS codes go to Georgian
          numbers); English visitors get email sign-in with no method tabs. */}
      {!en && (
        <div
          role="tablist"
          aria-label={en ? "Sign-in method" : "შესვლის მეთოდი"}
          className="grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-card/40 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "email"}
            onClick={() => setMode("email")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "email"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {en ? "Email" : "ელფოსტით"}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "phone"}
            onClick={() => setMode("phone")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "phone"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {en ? "Mobile number" : "ნომრით"}
          </button>
        </div>
      )}

      {mode === "phone" && !en ? (
        <PhoneLoginForm locale={locale} dest={dest} nextPath={safeNext} />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {verified && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {en
                ? "Your email is verified. Sign in to continue."
                : "ელფოსტა დადასტურებულია. შედი ანგარიშში."}
            </div>
          )}
          {verifyError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {verifyError === "expired"
                ? en
                  ? "This link has expired. Request a new one after signing in."
                  : "ლინკი ვადაგასულია. შესვლის შემდეგ მოითხოვე ახალი ანგარიშის გვერდიდან."
                : en
                  ? "This link is invalid or has already been used."
                  : "ლინკი არასწორია ან უკვე გამოყენებულია."}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{en ? "Email" : "ელფოსტა"}</Label>
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
              <Label htmlFor="password">{en ? "Password" : "პაროლი"}</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {en ? "Forgot it?" : "დაგავიწყდა?"}
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
              <Label
                htmlFor="login-code"
                className="text-xs text-muted-foreground"
              >
                {en
                  ? "Enter the 6-digit code sent to your email"
                  : "შეიყვანე ელფოსტაზე გამოგზავნილი 6-ნიშნა კოდი"}
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
                  {codePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : en ? (
                    "Verify"
                  ) : (
                    "დადასტურება"
                  )}
                </Button>
              </div>
              {codeError && (
                <p className="text-xs text-destructive">{codeError}</p>
              )}
              <button
                type="button"
                onClick={resend}
                disabled={resendPending}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60"
              >
                {resendPending
                  ? en
                    ? "Sending…"
                    : "ვაგზავნი…"
                  : en
                    ? "Didn't receive it? Send again"
                    : "ვერ მიიღე? ხელახლა გამოგზავნა"}
              </button>
            </div>
          )}

          {codeVerified && (
            <div className="rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
              {en
                ? "Your email is verified. You can sign in now."
                : "ელფოსტა დადასტურდა. ახლა დააჭირე „შესვლას“."}
            </div>
          )}
          {resentMsg && (
            <div className="rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/10 px-3 py-2 text-sm text-[var(--vivida-cyan)]">
              {resentMsg}
            </div>
          )}

          <TurnstileWidget
            key={turnstileResetKey}
            locale={locale}
            onChange={setTurnstileToken}
          />

          <Button
            type="submit"
            variant="mystic"
            size="lg"
            className="w-full"
            disabled={submitDisabled}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending
              ? en
                ? "Signing in…"
                : "შესვლა…"
              : en
                ? "Sign in"
                : "შესვლა"}
          </Button>
        </form>
      )}
    </div>
  );
}
