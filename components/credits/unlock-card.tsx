"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * "Unlock the deep result" gate. Spends `cost` credits once (idempotent on the
 * server); if the balance is short it flips to an invite-or-buy prompt. Shown
 * in place of the gated content on the test-result pages.
 */
export function UnlockCard({
  kind,
  resultId,
  cost,
  balance,
  title,
  blurb,
  locale = "ka",
}: {
  kind: "iq" | "eq" | "big-five" | "mbti" | "synastry";
  resultId: string;
  cost: number;
  balance: number;
  title?: string;
  blurb?: string;
  locale?: "ka" | "en";
}) {
  const en = locale === "en";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [short, setShort] = useState(balance < cost);

  async function unlock() {
    setPending(true);
    try {
      const r = await fetch("/api/credits/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, resultId }),
      });
      if (r.ok) {
        router.refresh(); // server re-renders with the content revealed
        return;
      }
      if (r.status === 402) setShort(true);
    } catch {
      /* ignore */
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/12 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
        <Lock className="size-7 text-[var(--vivida-violet)]" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">
        {title ?? (en ? "Unlock the full result" : "სრული შედეგის გახსნა")}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-foreground/80">
        {blurb ??
          (en
            ? "Unlock the complete analysis with a one-time payment. This result remains yours."
            : "გახსენი სრული, ღრმა ანალიზი. გადაიხდი ერთხელ — შემდეგ ეს შედეგი სამუდამოდ შენია.")}
      </p>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-sm">
        <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
        <span className="font-semibold">{cost} {en ? "credits" : "კრედიტი"}</span>
        <span className="text-muted-foreground">· {en ? "balance" : "ბალანსი"} {balance}</span>
      </div>

      {!short ? (
        <div className="mt-5">
          <Button
            type="button"
            variant="mystic"
            size="lg"
            disabled={pending}
            onClick={unlock}
            className="gap-1.5"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            {en ? `Unlock for ${cost} credits` : `გახსნა ${cost} კრედიტით`}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-[var(--vivida-pink)]">
            {en
              ? "You do not have enough credits. Invite a friend or top up your balance."
              : "ბალანსი არ არის საკმარისი. მოიწვიე მეგობარი ან შეავსე ბალანსი."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="mystic">
              <Link href="/credits">
                <Users className="size-4" />
                {en ? "Invite / top up" : "მოიწვიე / შეავსე"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
