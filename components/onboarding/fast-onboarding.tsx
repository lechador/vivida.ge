"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { saveProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { fbTrack } from "@/lib/fb-pixel";
import { readPendingNatalProfile } from "@/lib/pending-natal-profile";

export function FastOnboarding({ next, locale }: { next?: string; locale: "ka" | "en" }) {
  const en = locale === "en";
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const pending = readPendingNatalProfile();
      if (!pending) {
        setMissing(true);
        return;
      }
      const flag = "vivida_fb_registration_fired";
      if (!localStorage.getItem(flag)) {
        fbTrack("CompleteRegistration");
        localStorage.setItem(flag, "1");
      }
      trackEvent(ANALYTICS_EVENT.onboardingPrefilled, { origin: "uk_landing", exact_time: pending.timeOfBirth ? 1 : 0 });
      trackEvent(ANALYTICS_EVENT.onboardingSubmitted, { flow: "fast", total_steps: 0, exact_time: pending.timeOfBirth ? 1 : 0 });
      startTransition(async () => {
        const result = await saveProfile({
          dateOfBirth: pending.dateOfBirth,
          timeOfBirth: pending.timeOfBirth,
          cityName: pending.place.displayName,
          latitude: pending.place.latitude,
          longitude: pending.place.longitude,
          timezone: pending.place.timezone,
          gender: null,
        }, next);
        if (result && !result.ok) setError(result.error);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [next]);

  if (missing || error) {
    return (
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card/65 p-8 text-center backdrop-blur-xl">
        <Sparkles className="mx-auto size-8 text-[var(--vivida-violet)]" />
        <h1 className="mt-4 text-2xl font-semibold">{en ? "One quick step" : "ერთი მოკლე ნაბიჯი"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error ?? (en ? "Your saved chart details expired. Add them once more to continue." : "შენახული მონაცემების ვადა გავიდა. გასაგრძელებლად კიდევ ერთხელ მიუთითე.")}</p>
        <Button asChild variant="mystic" className="mt-5"><Link href={`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}`}>{en ? "Continue" : "გაგრძელება"}</Link></Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="mx-auto size-9 animate-spin text-[var(--vivida-violet)]" />
      <h1 className="mt-5 text-2xl font-semibold">{en ? "Preparing your personal chart…" : "შენი პირადი რუკა მზადდება…"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{en ? "Your birth details are already saved — no need to enter them twice." : "დაბადების მონაცემები უკვე შენახულია — მეორედ შეყვანა აღარ დაგჭირდება."}</p>
    </div>
  );
}
