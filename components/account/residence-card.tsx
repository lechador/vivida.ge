"use client";

import { useMemo, useState, useTransition } from "react";
import { MapPin } from "lucide-react";

import { updateResidence } from "@/actions/residence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { countryFlagEmoji, countryOptions } from "@/lib/countries";

export function ResidenceCard({
  initialCountryCode,
  initialCity,
  locale,
}: {
  initialCountryCode: string | null;
  initialCity: string | null;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const options = useMemo(() => countryOptions(locale), [locale]);
  const [countryCode, setCountryCode] = useState(initialCountryCode ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateResidence(countryCode, city);
      if (!result.ok) {
        setError(
          result.error === "invalid_country"
            ? en
              ? "Choose a valid country."
              : "აირჩიე სწორი ქვეყანა."
            : en
              ? "City is too long."
              : "ქალაქის დასახელება ძალიან გრძელია.",
        );
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--vivida-violet)]/12 text-[var(--vivida-violet)]">
          <MapPin className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{en ? "Residence" : "საცხოვრებელი ადგილი"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "Your country was detected at registration. You can update it and your current city here."
              : "ქვეყანა რეგისტრაციისას განისაზღვრა. აქ შეგიძლია შეცვალო ქვეყანა და მიმდინარე ქალაქი."}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="residence-country">{en ? "Country" : "ქვეყანა"}</Label>
          <select
            id="residence-country"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background/35 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--vivida-violet)] focus:ring-2 focus:ring-[var(--vivida-violet)]/20"
          >
            <option value="" disabled>
              {en ? "Choose country" : "აირჩიე ქვეყანა"}
            </option>
            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {countryFlagEmoji(option.code)} {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="residence-city">{en ? "City" : "ქალაქი"}</Label>
          <Input
            id="residence-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={100}
            placeholder={en ? "e.g. London" : "მაგ. თბილისი"}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {error ?? (saved ? (en ? "Saved ✓" : "შენახულია ✓") : "")}
        </p>
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? (en ? "Saving…" : "ინახება…") : (en ? "Save residence" : "საცხოვრებელი ადგილის შენახვა")}
        </Button>
      </div>
    </section>
  );
}
