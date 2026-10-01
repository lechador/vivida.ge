"use client";

import { Input } from "@/components/ui/input";
import { georgianMobileInputDigits } from "@/lib/phone";
import type { UserLocale } from "@/lib/i18n/user-locale";

/** A non-editable Georgian prefix followed by the nine national digits. */
export function GeorgianMobileInput({
  id,
  value,
  onChange,
  disabled,
  locale,
}: {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  locale: UserLocale;
}) {
  return (
    <div className="flex min-w-0 flex-1">
      <span
        aria-hidden="true"
        className="flex h-12 shrink-0 items-center rounded-l-lg border border-border bg-card/70 px-3 text-sm text-foreground"
      >
        +995
      </span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        pattern="[0-9]*"
        placeholder="5XX XXX XXX"
        value={value}
        onChange={(event) =>
          onChange(georgianMobileInputDigits(event.target.value))
        }
        disabled={disabled}
        aria-label={
          locale === "ka"
            ? "ქართული მობილურის ნომერი, ქვეყნის კოდი +995"
            : "Georgian mobile number, country code +995"
        }
        className="min-w-0 rounded-l-none"
      />
    </div>
  );
}
