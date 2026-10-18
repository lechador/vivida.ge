"use client";

import { useEffect, useState } from "react";
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
    <article className="min-h-[220px] rounded-md border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-primary">
        <span>
          {en
            ? "Calculating Ephemeris"
            : "მიმდინარეობს ეფემერიდის გამოთვლა"}
        </span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      <p className="mt-6 h-5 text-base font-medium text-foreground transition-opacity">
        {messages[stage]}
      </p>

      <div className="mt-4 h-1 w-full overflow-hidden bg-border">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {en
          ? "Chart calculations usually take a few seconds."
          : "ცის რუკის გაანგარიშებას ჩვეულებრივ რამდენიმე წამი სჭირდება."}
      </p>
    </article>
  );
}
