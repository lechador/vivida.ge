"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/actions/auth";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function ResetPasswordForm({
  token,
  locale = "ka",
}: {
  token: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(am ? "Գաղտնաբառերը չեն համընկնում" : en ? "Passwords do not match" : "პაროლები არ ემთხვევა");
      return;
    }
    startTransition(async () => {
      const result = await resetPassword({ token, password });
      if (result.ok) {
        setDone(true);
        // Auto-redirect after a beat so the user sees the confirmation.
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1800);
      } else {
        setError(result.error);
      }
    });
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--vivida-cyan)]/15 ring-1 ring-[var(--vivida-cyan)]/40">
          <CheckCircle2 className="size-6 text-[var(--vivida-cyan)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {am ? "Գաղտնաբառը թարմացված է" : en ? "Password updated" : "პაროლი შეიცვალა"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {am ? "Ձեզ տեղափոխում ենք մուտքի էջ…" : en ? "Taking you to the sign-in page…" : "ახლავე გადაგამისამართებთ შესვლის გვერდზე…"}
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-destructive">
          {am ? "Այս հղումն անվավեր է կամ ժամկետանց։" : en ? "This link is invalid or has expired." : "ლინკი არასწორია ან ვადაგასულია."}
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {am ? "Հայցել նոր հղում" : en ? "Request a new link" : "მოითხოვე ახალი ლინკი"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">{am ? "Նոր գաղտնաբառ" : en ? "New password" : "ახალი პაროლი"}</Label>
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
          {am ? "Առնվազն 8 նիշ։" : en ? "At least 8 characters." : "მინიმუმ 8 სიმბოლო."}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">{am ? "Հաստատել գաղտնաբառը" : en ? "Confirm password" : "გაიმეორე პაროლი"}</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={isPending}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
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
        {isPending ? (am ? "Պահպանվում է…" : en ? "Saving…" : "ინახება…") : am ? "Սահմանել գաղտնաբառ" : en ? "Set password" : "პაროლის დაყენება"}
      </Button>
    </form>
  );
}
