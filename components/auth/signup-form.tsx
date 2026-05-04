"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { signUpWithEmail } from "@/actions/auth";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

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
            შემოწმე საფოსტო ყუთი
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            გამოგიგზავნეთ ვერიფიკაციის ლინკი{" "}
            <span className="text-foreground">{email}</span>-ზე. დააჭირე
            ლინკს და შემდეგ შემოდი.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-left text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
          ვერ ნახავ წერილს? ნახე spam-ში ან{" "}
          <Link href="/login" className="underline-offset-2 hover:underline">
            შესვლის გვერდიდან
          </Link>{" "}
          მოითხოვე ხელახლა.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">სახელი</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="given-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          placeholder="მაგ. გიორგი"
        />
      </div>
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
        <Label htmlFor="password">პაროლი</Label>
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
          მინიმუმ 8 სიმბოლო.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
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
        {isPending ? "ანგარიშის შექმნა…" : "ანგარიშის შექმნა"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        რეგისტრაციით ეთანხმები{" "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          წესებსა და პირობებს
        </Link>{" "}
        და{" "}
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          კონფიდენციალურობის პოლიტიკას
        </Link>
        .
      </p>
    </form>
  );
}
