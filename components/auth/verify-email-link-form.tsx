"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { verifyEmailFromLink } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function VerifyEmailLinkForm({
  hasToken,
  locale,
}: {
  hasToken: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!hasToken) {
    return (
      <div className="space-y-4 text-center text-sm">
        <p role="alert" className="text-destructive">
          {en
            ? "This verification link is invalid. Use password recovery to take control of this email address."
            : "დადასტურების ლინკი არასწორია. ამ ელფოსტის ანგარიშის დასაბრუნებლად პაროლის აღდგენა გამოიყენე."}
        </p>
        <Link
          href="/forgot-password"
          className="underline-offset-2 hover:underline"
        >
          {en ? "Recover account" : "ანგარიშის აღდგენა"}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-[var(--vivida-cyan)]" />
        <p className="text-sm text-muted-foreground">
          {en
            ? "Your email is verified and your password is ready."
            : "ელფოსტა დადასტურდა და პაროლი დაყენებულია."}
        </p>
        <Button asChild variant="mystic" className="w-full">
          <Link href="/login?verified=1">{en ? "Sign in" : "შესვლა"}</Link>
        </Button>
      </div>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(en ? "Passwords do not match" : "პაროლები არ ემთხვევა");
      return;
    }
    startTransition(async () => {
      try {
        const result = await verifyEmailFromLink({ password });
        if (result.ok) {
          setDone(true);
        } else {
          setError(result.error);
        }
      } catch {
        setError(
          en
            ? "Could not verify your email. Please try again."
            : "ელფოსტის დადასტურება ვერ მოხერხდა. სცადე ხელახლა.",
        );
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {en
          ? "Choose the password for this account to finish verifying your email."
          : "ელფოსტის დასადასტურებლად აირჩიე ამ ანგარიშის პაროლი."}
      </p>
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
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {en ? "At least 8 characters." : "მინიმუმ 8 სიმბოლო."}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">
          {en ? "Confirm password" : "გაიმეორე პაროლი"}
        </Label>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          disabled={isPending}
        />
      </div>
      {error && (
        <div className="space-y-1 text-sm">
          <p role="alert" className="text-destructive">
            {error}
          </p>
          <Link
            href="/forgot-password"
            className="underline-offset-2 hover:underline"
          >
            {en ? "Recover account" : "ანგარიშის აღდგენა"}
          </Link>
        </div>
      )}
      <Button
        type="submit"
        variant="mystic"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending
          ? en
            ? "Verifying…"
            : "მოწმდება…"
          : en
            ? "Verify email"
            : "ელფოსტის დადასტურება"}
      </Button>
    </form>
  );
}
