"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  lifePathFromDate,
  type LifePathNumber,
} from "@/lib/numerology";

/**
 * Life-path calculator for /numerologia — pure client-side math, no signup.
 * Result shows the number + archetype and deep-links to the number's page;
 * the natal-chart CTA is the acquisition hook (same funnel pattern as the
 * compatibility calculator).
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export function LifePathCalculator({
  archetypes,
  locale = "ka",
}: {
  /** number → archetype label, passed from the server page (content lives there). */
  archetypes: Record<string, string>;
  locale?: UserLocale;
}) {
  const en = locale === "en";
  const [date, setDate] = useState("");
  const [result, setResult] = useState<LifePathNumber | null>(null);

  function calc() {
    if (!date) return;
    const [y, m, d] = date.split("-").map(Number);
    if (!y || !m || !d) return;
    setResult(lifePathFromDate(y, m, d));
  }

  return (
    <div className="rounded-3xl border border-[var(--vivida-violet)]/35 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/10 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {en ? "Life path number calculator" : "ბედის რიცხვის კალკულატორი"}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {en
          ? "Enter your birth date. No signup required."
          : "შეიყვანე დაბადების თარიღი — რეგისტრაცია არ სჭირდება."}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setResult(null);
          }}
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--vivida-violet)]/60 sm:max-w-56"
          aria-label={en ? "Birth date" : "დაბადების თარიღი"}
        />
        <Button type="button" variant="mystic" onClick={calc} disabled={!date}>
          {en ? "Calculate" : "გამოთვლა"}
          <Sparkles className="size-4" />
        </Button>
      </div>

      {result && (
        <div className="mt-6 rounded-2xl border border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/8 p-5 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Your life path number" : "შენი ბედის რიცხვი"}
          </div>
          <div className="mt-1 bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-6xl font-bold tracking-tight text-transparent">
            {result}
          </div>
          {archetypes[result] && (
            <div className="mt-1 text-lg font-medium text-foreground/90">
              {archetypes[result]}
            </div>
          )}
          <Link
            href={`/numerologia/${result}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--vivida-cyan)] hover:underline"
          >
            {en ? `Read the full meaning of ${result}` : `სრული აღწერა — რას ნიშნავს ${result}`}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
