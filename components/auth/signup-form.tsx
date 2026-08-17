"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { signUpWithEmail, verifyEmailWithCode } from "@/actions/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SignupForm({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const params = useSearchParams();
  // Where to land after signup — same-origin relative paths only.
  const nextParam = params.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Code-entry (OTP) state on the "check your inbox" screen.
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, startVerify] = useTransition();

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    startVerify(async () => {
      // Pass the password we still hold so a correct code signs them straight
      // in — no bounce to /login to retype it. Falls back to /login if the
      // auto-signin didn't take.
      const res = await verifyEmailWithCode({ email, code: code.trim(), password });
      if (res.ok) {
        trackEvent(ANALYTICS_EVENT.signUpVerified, {
          method: "email",
          auto_signed_in: res.signedIn ? 1 : 0,
        });
        if (res.signedIn) {
          // Land on the feed (usable without birth data) rather than forcing
          // onboarding — astrology is opt-in via the astro-profile CTAs.
          router.push(safeNext ?? "/dashboard");
        } else {
          // Not auto-signed-in — bounce to login, carrying next along.
          const q = safeNext ? `&next=${encodeURIComponent(safeNext)}` : "";
          router.push(`/login?verified=1${q}`);
        }
        router.refresh();
      } else {
        setCodeError(res.error);
      }
    });
  };

  // Disable submit until Turnstile passes (when enabled). When the env var
  // is missing we let the form work — server still fails-closed via verifyTurnstile.
  const submitDisabled =
    isPending || (TURNSTILE_ENABLED && !turnstileToken);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signUpWithEmail({
        name,
        email,
        password,
        turnstileToken,
      });
      if (result.ok) {
        // Account created, but email is not verified yet — a distinct step
        // from sign_up_verified below. Tracking both is what makes the
        // credential-signup abandonment rate visible in GA4.
        trackEvent(ANALYTICS_EVENT.signUpSubmitted, { method: "email" });
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  };

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--vivida-cyan)]/15 ring-1 ring-[var(--vivida-cyan)]/40">
          <MailCheck className="size-6 text-[var(--vivida-cyan)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {en ? "Check your inbox" : "შემოწმე საფოსტო ყუთი"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {en ? "We sent an email to " : "გამოგიგზავნეთ წერილი "}
            <span className="text-foreground">{email}</span>
            {en
              ? ". Enter the 6-digit code from the email, or simply open the link."
              : "-ზე. შეიყვანე მასში მითითებული 6-ნიშნა კოდი, ან უბრალოდ დააჭირე ლინკს."}
          </p>
        </div>

        {/* OTP code entry — the easy path for users who struggle with links */}
        <form onSubmit={verifyCode} className="space-y-3 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="code">{en ? "Verification code" : "დადასტურების კოდი"}</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={verifying}
              className="text-center text-lg tracking-[0.4em]"
            />
          </div>
          {codeError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {codeError}
            </div>
          )}
          <Button
            type="submit"
            variant="mystic"
            size="lg"
            className="w-full"
            disabled={verifying || code.length !== 6}
          >
            {verifying && <Loader2 className="size-4 animate-spin" />}
            {verifying ? (en ? "Verifying…" : "მოწმდება…") : en ? "Verify" : "დადასტურება"}
          </Button>
        </form>

        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-left text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
          {en ? "Can't find the email? Check spam or request it again from the " : "ვერ ნახავ წერილს? ნახე spam-ში ან "}
          <Link href="/login" className="underline-offset-2 hover:underline">
            {en ? "sign-in page" : "შესვლის გვერდიდან"}
          </Link>{" "}
          {en ? "." : " მოითხოვე ხელახლა."}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{en ? "Name" : "სახელი"}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="given-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          placeholder={en ? "e.g. Alex" : "მაგ. გიორგი"}
        />
      </div>
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
        <Label htmlFor="password">{en ? "Password" : "პაროლი"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {en ? "At least 8 characters." : "მინიმუმ 8 სიმბოლო."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <TurnstileWidget locale={locale} onChange={setTurnstileToken} />

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
            ? "Creating account…"
            : "ანგარიშის შექმნა…"
          : en
            ? "Create account"
            : "ანგარიშის შექმნა"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {en ? "By creating an account, you agree to the " : "რეგისტრაციით ეთანხმები "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          {en ? "Terms" : "წესებსა და პირობებს"}
        </Link>{" "}
        {en ? " and " : " და "}
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          {en ? "Privacy Policy" : "კონფიდენციალურობის პოლიტიკას"}
        </Link>
        .
      </p>
    </form>
  );
}
