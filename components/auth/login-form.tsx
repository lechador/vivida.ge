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
  const [isPending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();

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
        router.push("/dashboard");
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
      setResentMsg("შემოწმე საფოსტო ყუთი — ვერიფიკაციის ლინკი ხელახლა გაიგზავნა.");
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
          {unverifiedEmail && (
            <button
              type="button"
              onClick={resend}
              disabled={resendPending}
              className="text-xs underline-offset-2 hover:underline disabled:opacity-60"
            >
              {resendPending
                ? "ვაგზავნი…"
                : "ხელახლა გამოგვიგზავნე ვერიფიკაციის ლინკი"}
            </button>
          )}
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
