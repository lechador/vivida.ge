"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveProfile } from "@/actions/profile";
import { fbTrack } from "@/lib/fb-pixel";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { ProgressDots } from "./progress-dots";
import { StepDate, validateDate } from "./step-date";
import { StepTime, validateTime } from "./step-time";
import { StepPlace } from "./step-place";
import { StepVisibility, validateVisibility } from "./step-visibility";
import { StepPhotos } from "./step-photos";
import type { Profile } from "@/db/schema";
import type { GeocodeResult } from "@/lib/geocoding";
import { suggestUsername } from "@/lib/profile-utils";
import type { WizardData } from "./types";
import type { UserLocale } from "@/lib/i18n/user-locale";
import {
  clearPendingNatalProfile,
  readPendingNatalProfile,
} from "@/lib/pending-natal-profile";

type StepName = "date" | "time" | "place" | "visibility" | "photos";
const FULL_STEPS: readonly StepName[] = [
  "date",
  "time",
  "place",
  "visibility",
  "photos",
] as const;

type Direction = 1 | -1;

function initialState(
  profile: Profile | null,
  defaultName: string | null
): WizardData {
  if (!profile) {
    // Seed the username from their name so they never hit an empty field
    // on the visibility step.
    return {
      date: { day: "", month: "", year: "" },
      time: { hour: "", minute: "", unknown: false },
      place: null,
      gender: null,
      visibility: { username: suggestUsername(defaultName) },
    };
  }
  const [y, m, d] = (profile.dateOfBirth ?? "").split("-");
  const [hh, mm] = (profile.timeOfBirth ?? "").split(":");
  return {
    date: { day: d ?? "", month: m ?? "", year: y ?? "" },
    time: {
      hour: hh ?? "",
      minute: mm ?? "",
      // A profile row exists from signup with every birth field null, so a
      // missing time only means "unknown" once they've actually filled the
      // wizard in. Brand-new users must start with the toggle OFF.
      unknown: !!profile.dateOfBirth && !profile.timeOfBirth,
    },
    place:
      profile.latitude !== null &&
      profile.longitude !== null &&
      profile.cityName
        ? ({
            id: 0,
            name: profile.cityName,
            displayName: profile.cityName,
            country: "",
            countryCode: "",
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone ?? "UTC",
          } satisfies GeocodeResult)
        : null,
    gender:
      profile.gender === "male" || profile.gender === "female"
        ? profile.gender
        : null,
    visibility: {
      username: profile.username ?? suggestUsername(defaultName),
    },
  };
}

export function OnboardingWizard({
  initialProfile,
  defaultName,
  next,
  locale = "ka",
}: {
  initialProfile: Profile | null;
  defaultName: string | null;
  /** Where to send the user after saving (relative path). */
  next?: string;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  // Birth date is locked after first registration (the server enforces this
  // — see actions/profile.ts). When the user comes back to edit, hide the
  // date step entirely so they don't waste time on a read-only field, and
  // surface a one-line lock notice on the first remaining step instead.
  // The photos step is also first-run only — returning users manage photos
  // from /account, not from this wizard.
  const dateLocked = !!initialProfile?.dateOfBirth;
  const STEPS = useMemo<readonly StepName[]>(
    () =>
      dateLocked
        ? FULL_STEPS.filter((s) => s !== "date" && s !== "photos")
        : FULL_STEPS,
    [dateLocked]
  );

  const [data, setData] = useState<WizardData>(() =>
    initialState(initialProfile, defaultName)
  );
  const [step, setStep] = useState(0);
  const flow = dateLocked ? "edit" : "new";

  // Fire FB Pixel CompleteRegistration the first time a brand-new user
  // arrives at onboarding — they've just completed Google OAuth or email
  // verification, which is the conversion FB ads should be optimised for.
  // localStorage flag prevents re-fires on hard reloads or back-navigation.
  useEffect(() => {
    if (initialProfile) return;
    if (typeof window === "undefined") return;
    const FLAG = "vivida_fb_registration_fired";
    if (localStorage.getItem(FLAG)) return;
    fbTrack("CompleteRegistration");
    localStorage.setItem(FLAG, "1");
  }, [initialProfile]);

  useEffect(() => {
    if (initialProfile) {
      clearPendingNatalProfile();
      return;
    }
    const pending = readPendingNatalProfile();
    if (!pending) return;

    const [year, month, day] = pending.dateOfBirth.split("-");
    const [hour = "", minute = ""] = pending.timeOfBirth?.split(":") ?? [];
    const frame = window.requestAnimationFrame(() => {
      setData((current) => ({
        ...current,
        date: { day, month, year },
        time: {
          hour,
          minute,
          unknown: pending.timeOfBirth === null,
        },
        place: pending.place,
      }));
      trackEvent(ANALYTICS_EVENT.onboardingPrefilled, {
        origin: "natal_calculator",
        exact_time: pending.timeOfBirth ? 1 : 0,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialProfile]);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.onboardingStarted, {
      flow,
      total_steps: STEPS.length,
    });
    // A new wizard mount is the funnel start. Step changes are tracked by the
    // separate effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENT.onboardingStepViewed, {
      flow,
      step_name: STEPS[step],
      step_number: step + 1,
      total_steps: STEPS.length,
    });
  }, [flow, step, STEPS]);
  const [direction, setDirection] = useState<Direction>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = STEPS[step];

  const stepValid = useMemo(() => {
    if (currentStep === "date")
      return validateDate(data.date) !== null && data.gender !== null;
    if (currentStep === "time") return validateTime(data.time).ok;
    if (currentStep === "place") return data.place !== null;
    if (currentStep === "visibility") return validateVisibility(data.visibility);
    if (currentStep === "photos") return true; // photos are optional
    return false;
  }, [currentStep, data]);

  const goNext = () => {
    if (!stepValid) return;
    trackEvent(ANALYTICS_EVENT.onboardingStepCompleted, {
      flow,
      step_name: currentStep,
      step_number: step + 1,
      total_steps: STEPS.length,
    });
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      submit();
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const submit = () => {
    setError(null);
    // When the date step was skipped (locked), the existing date in `data`
    // is whatever we initialized from the profile. The server still re-
    // validates it AND ignores the input in favour of the stored value, so
    // even a tampered client cannot change the date.
    const date = validateDate(data.date);
    const timeRes = validateTime(data.time);
    if (!date || !timeRes.ok || !data.place) {
      setError(am ? "Խնդրում ենք լրացնել բոլոր դաշտերը:" : en ? "Please complete every field." : "გთხოვ, ყველა ველი შეავსო.");
      return;
    }
    trackEvent(ANALYTICS_EVENT.onboardingSubmitted, {
      flow,
      total_steps: STEPS.length,
      exact_time: timeRes.time ? 1 : 0,
    });
    startTransition(async () => {
      const result = await saveProfile(
        {
          dateOfBirth: date,
          timeOfBirth: timeRes.time,
          cityName: data.place!.displayName,
          latitude: data.place!.latitude,
          longitude: data.place!.longitude,
          timezone: data.place!.timezone,
          gender: data.gender,
          username: data.visibility.username,
        },
        next,
        !dateLocked
      );
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-10">
        <ProgressDots total={STEPS.length} current={step} />
      </div>

      {dateLocked && (
        <p className="mb-6 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-center text-sm text-muted-foreground">
          {en
            ? "Your birth date is fixed when you register and cannot be changed. You can still update the time and place."
            : "დაბადების თარიღი ფიქსირდება რეგისტრაციაზე და ვერ შეიცვლება. დროის და ადგილის შესწორება შესაძლებელია."}
        </p>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 shadow-[0_30px_120px_-40px_oklch(0.65_0.24_305/0.5)] backdrop-blur-xl sm:p-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentStep === "date" && (
              <StepDate
                value={data.date}
                onChange={(date) => setData((d) => ({ ...d, date }))}
                gender={data.gender}
                onGenderChange={(gender) => setData((d) => ({ ...d, gender }))}
                locale={locale}
              />
            )}
            {currentStep === "time" && (
              <StepTime
                value={data.time}
                onChange={(time) => setData((d) => ({ ...d, time }))}
                locale={locale}
              />
            )}
            {currentStep === "place" && (
              <StepPlace
                value={data.place}
                onChange={(place) => setData((d) => ({ ...d, place }))}
                locale={locale}
              />
            )}
            {currentStep === "visibility" && (
              <StepVisibility
                value={data.visibility}
                onChange={(visibility) =>
                  setData((d) => ({ ...d, visibility }))
                }
                defaultName={defaultName}
                locale={locale}
              />
            )}
            {currentStep === "photos" && <StepPhotos locale={locale} />}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mt-6 text-center text-sm text-destructive">{error}</p>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0 || isPending}
            className={step === 0 ? "invisible" : ""}
          >
            <ArrowLeft />
            {am ? "Ետ" : en ? "Back" : "უკან"}
          </Button>

          <Button
            type="button"
            variant={isLast ? "mystic" : "default"}
            size="lg"
            onClick={goNext}
            disabled={!stepValid || isPending}
          >
            {isLast ? (
              <>
                <Sparkles />
                {isPending
                  ? en
                    ? "Drawing your chart…"
                    : "ვხატავთ შენს რუკას…"
                  : en
                    ? "Show me my chart"
                    : "მაჩვენე ჩემი რუკა"}
              </>
            ) : (
              <>
                {am ? "Շարունակել" : en ? "Continue" : "გაგრძელება"}
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
