"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { UserLocale } from "@/lib/i18n/user-locale";

const MESSAGES = [
  "ვადგენ დღევანდელ ცის ფონს…",
  "ვითვლი პლანეტების ტრანზიტებს…",
  "ვადარებ შენს ნატალურ რუკას…",
  "ვწერ შენს პერსონალურ ჰოროსკოპს…",
];
const MESSAGES_EN = [
  "Reading today's sky…",
  "Calculating planetary transits…",
  "Comparing them with your natal chart…",
  "Writing your personal horoscope…",
];

/**
 * Live "your horoscope is being written" loader — an eased progress crawl with
 * rotating status messages. Replaces the pulsing skeleton so the wait feels
 * like something is actually happening. Generation is opaque (AI), so the bar
 * eases toward ~92% and the parent swaps in the real card when ready.
 */
export function HoroscopeLoading({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const messages = en ? MESSAGES_EN : MESSAGES;
  const [progress, setProgress] = useState(8);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const bar = setInterval(() => {
      setProgress((p) => (p >= 94 ? 94 : p + (94 - p) * 0.045));
    }, 280);
    const msg = setInterval(() => {
      setStage((s) => (s + 1) % messages.length);
    }, 2400);
    return () => {
      clearInterval(bar);
      clearInterval(msg);
    };
  }, [messages.length]);

  return (
    <article className="relative min-h-[220px] overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-7 backdrop-blur-xl sm:p-9">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
      />
      <div className="relative flex items-center gap-2.5 text-sm font-medium text-[var(--vivida-violet)]">
        <Sparkles className="size-4 animate-pulse" />
        {en ? "Creating your horoscope for today" : "ვქმნით შენს დღევანდელ ჰოროსკოპს"}
      </div>

      <p className="relative mt-6 h-5 text-base text-foreground/85 transition-opacity">
        {messages[stage]}
      </p>

      <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="relative mt-3 text-xs text-muted-foreground">
        {en ? "Chart calculations usually take a few seconds." : "ცის რუკის გაანგარიშებას ჩვეულებრივ რამდენიმე წამი სჭირდება."}
      </p>
    </article>
  );
}
