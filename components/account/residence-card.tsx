"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";

import { updateResidenceCity } from "@/actions/residence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function ResidenceCard({
  country,
  initialCity,
  locale,
}: {
  country: string;
  initialCity: string | null;
  locale: UserLocale;
}) {
  const en = locale === "en";
  const [city, setCity] = useState(initialCity ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateResidenceCity(city);
      if (!result.ok) {
        setError(en ? "City is too long." : "ქალაქის დასახელება ძალიან გრძელია.");
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
              ? "Your country was determined securely when you registered. Add your current city."
              : "ქვეყანა რეგისტრაციისას უსაფრთხოდ განისაზღვრა. მიუთითე მიმდინარე ქალაქი."}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{en ? "Country" : "ქვეყანა"}</Label>
          <div className="flex h-10 items-center rounded-lg border border-border bg-background/35 px-3 text-sm text-foreground/85">
            {country}
          </div>
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
          {pending ? (en ? "Saving…" : "ინახება…") : (en ? "Save city" : "ქალაქის შენახვა")}
        </Button>
      </div>
    </section>
  );
}
