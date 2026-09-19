"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserLocale } from "@/lib/i18n/user-locale";

const LANGUAGES = {
  en: { flag: "🇬🇧", name: "English", nativeName: "English", hrefLang: "en" },
  ka: {
    flag: "🇬🇪",
    name: "Georgian",
    nativeName: "ქართული",
    hrefLang: "ka-GE",
  },
} as const;

const ORDER: readonly UserLocale[] = ["en", "ka"];

export function LanguageSelector({
  currentLocale,
  englishHref,
  georgianHref,
}: {
  currentLocale: UserLocale;
  englishHref: string;
  georgianHref: string;
}) {
  const current = LANGUAGES[currentLocale];
  const hrefs: Record<UserLocale, string> = {
    en: englishHref,
    ka: georgianHref,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Select language. Current language: ${current.name}`}
          className="group inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background/35 px-2.5 text-sm font-medium text-foreground/90 shadow-sm transition-all hover:border-[var(--vivida-violet)]/50 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vivida-violet)]/55"
        >
          <span className="text-lg leading-none" aria-hidden>
            {current.flag}
          </span>
          <span className="hidden sm:inline">{current.name}</span>
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border-border/70 bg-popover/95 p-1.5 shadow-[0_18px_55px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 pb-2 pt-2 text-[10px] tracking-[0.18em]">
          Language
        </DropdownMenuLabel>
        {ORDER.map((locale) => {
          const language = LANGUAGES[locale];
          const selected = locale === currentLocale;

          if (selected) {
            return (
              <DropdownMenuItem
                key={locale}
                disabled
                className="rounded-xl bg-[var(--vivida-violet)]/12 px-3 py-2.5 opacity-100"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {language.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {language.nativeName}
                  </span>
                  {language.nativeName !== language.name && (
                    <span className="block text-[11px] text-muted-foreground">
                      {language.name}
                    </span>
                  )}
                </span>
                <Check className="size-4 text-[var(--vivida-cyan)]" />
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={locale}
              asChild
              className="group rounded-xl px-3 py-2.5"
            >
              <Link href={hrefs[locale]} hrefLang={language.hrefLang}>
                <span
                  className="text-xl leading-none transition-transform group-hover:scale-105"
                  aria-hidden
                >
                  {language.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {language.nativeName}
                  </span>
                  {language.nativeName !== language.name && (
                    <span className="block text-[11px] text-muted-foreground">
                      {language.name}
                    </span>
                  )}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
