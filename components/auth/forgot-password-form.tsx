"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { requestPasswordReset } from "@/actions/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ForgotPasswordForm({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale === "en";
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submitDisabled =
    isPending || (TURNSTILE_ENABLED && !turnstileToken);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset({ email, turnstileToken });
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--vivida-cyan)]/15 ring-1 ring-[var(--vivida-cyan)]/40">
          <MailCheck className="size-6 text-[var(--vivida-cyan)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {en ? "Check your inbox" : "შეამოწმე საფოსტო ყუთი"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {en
              ? "If this email is in our system, we've sent a password reset link."
              : "თუ ეს ელფოსტა ჩვენი სისტემაშია, ახლა გამოგიგზავნეთ ლინკი პაროლის აღსადგენად."}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {en ? "← Back to sign in" : "← ანგარიშის შესვლა"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {en
          ? "Enter your email and we'll send you a link to choose a new password."
          : "შეიყვანე შენი ელფოსტა. გამოგიგზავნით ლინკს ახალი პაროლის დასაყენებლად."}
      </p>

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
        {isPending ? (en ? "Sending…" : "ვაგზავნი…") : en ? "Send reset link" : "ლინკის გამოგზავნა"}
      </Button>
    </form>
  );
}
