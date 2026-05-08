"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveProfile } from "@/actions/profile";
import { fbTrack } from "@/lib/fb-pixel";
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
      unknown: !profile.timeOfBirth,
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
    visibility: {
      username: profile.username ?? suggestUsername(defaultName),
    },
  };
}

export function OnboardingWizard({
  initialProfile,
  defaultName,
}: {
  initialProfile: Profile | null;
  defaultName: string | null;
}) {
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
  const [direction, setDirection] = useState<Direction>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = STEPS[step];

  const stepValid = useMemo(() => {
    if (currentStep === "date") return validateDate(data.date) !== null;
    if (currentStep === "time") return validateTime(data.time).ok;
    if (currentStep === "place") return data.place !== null;
    if (currentStep === "visibility") return validateVisibility(data.visibility);
    if (currentStep === "photos") return true; // photos are optional
    return false;
  }, [currentStep, data]);

  const goNext = () => {
    if (!stepValid) return;
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
      setError("გთხოვ, ყველა ველი შეავსო.");
      return;
    }
    startTransition(async () => {
      const result = await saveProfile({
        dateOfBirth: date,
        timeOfBirth: timeRes.time,
        cityName: data.place!.displayName,
        latitude: data.place!.latitude,
        longitude: data.place!.longitude,
        timezone: data.place!.timezone,
        username: data.visibility.username,
      });
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
          დაბადების თარიღი ფიქსირდება რეგისტრაციაზე და ვერ შეიცვლება.
          დროის და ადგილის შესწორება შესაძლებელია.
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
              />
            )}
            {currentStep === "time" && (
              <StepTime
                value={data.time}
                onChange={(time) => setData((d) => ({ ...d, time }))}
              />
            )}
            {currentStep === "place" && (
              <StepPlace
                value={data.place}
                onChange={(place) => setData((d) => ({ ...d, place }))}
              />
            )}
            {currentStep === "visibility" && (
              <StepVisibility
                value={data.visibility}
                onChange={(visibility) =>
                  setData((d) => ({ ...d, visibility }))
                }
                defaultName={defaultName}
              />
            )}
            {currentStep === "photos" && <StepPhotos />}
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
            უკან
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
                {isPending ? "ვხატავთ შენს რუკას…" : "მაჩვენე ჩემი რუკა"}
              </>
            ) : (
              <>
                გაგრძელება
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
