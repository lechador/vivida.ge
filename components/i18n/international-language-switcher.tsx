"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { updateInterfaceLanguage } from "@/actions/interface-language";
import { resolveInternationalLanguageSwitchHrefs } from "@/lib/seo/locales";
import type { UserLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function setLanguageCookie(locale: "en" | "pl") {
  if (typeof document === "undefined") return;
  document.cookie = `vivida_lang=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Prominent EN | PL segmented language switcher for public pages on vividaastro.com.
 * Resolves the exact counterpart URL in the other language for the current page.
 */
export function PublicLanguageSwitcher({
  currentLocale,
  georgianPath = "/",
  onEnglishHost = true,
  className,
}: {
  currentLocale: "en" | "pl";
  georgianPath?: string;
  onEnglishHost?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const { enHref, plHref } = resolveInternationalLanguageSwitchHrefs(
    pathname,
    georgianPath,
    onEnglishHost,
  );

  return (
    <div
      role="group"
      aria-label={currentLocale === "pl" ? "Wybierz język" : "Select language"}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-md border border-border bg-secondary/60 p-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        className,
      )}
    >
      <a
        href={enHref}
        hrefLang="en"
        aria-current={currentLocale === "en" ? "true" : undefined}
        onClick={() => setLanguageCookie("en")}
        className={cn(
          "inline-flex h-full items-center rounded-[5px] px-2 transition-colors",
          currentLocale === "en"
            ? "bg-primary/20 text-foreground shadow-2xs ring-1 ring-primary/45"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </a>
      <a
        href={plHref}
        hrefLang="pl-PL"
        aria-current={currentLocale === "pl" ? "true" : undefined}
        onClick={() => setLanguageCookie("pl")}
        className={cn(
          "inline-flex h-full items-center rounded-[5px] px-2 transition-colors",
          currentLocale === "pl"
            ? "bg-primary/20 text-foreground shadow-2xs ring-1 ring-primary/45"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        PL
      </a>
    </div>
  );
}

/**
 * EN | PL segmented language switcher for shared auth and authenticated app
 * routes on vividaastro.com (/login, /signup, /onboarding, /dashboard, /report, etc.).
 * Never renders on vivida.ge (locale === "ka").
 */
export function AppLanguageSwitcher({
  locale,
  authed = false,
  className,
}: {
  locale: UserLocale;
  authed?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [optimisticLocale, setOptimisticLocale] = useState<"en" | "pl">(
    locale === "pl" ? "pl" : "en",
  );
  const [isPending, startTransition] = useTransition();

  if (locale === "ka") return null;

  const activeLocale = isPending
    ? optimisticLocale
    : locale === "pl"
      ? "pl"
      : "en";

  function handleSelect(next: "en" | "pl") {
    if (next === activeLocale || isPending) return;
    setOptimisticLocale(next);
    setLanguageCookie(next);
    startTransition(async () => {
      if (authed) {
        try {
          await updateInterfaceLanguage(next);
        } catch {
          // Cookie is already set; router.refresh() will still apply the change.
        }
      }
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={activeLocale === "pl" ? "Wybierz język" : "Select language"}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-md border border-border bg-secondary/60 p-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        isPending && "opacity-75",
        className,
      )}
    >
      <button
        type="button"
        disabled={isPending}
        aria-pressed={activeLocale === "en"}
        onClick={() => handleSelect("en")}
        className={cn(
          "inline-flex h-full items-center rounded-[5px] px-2 transition-colors",
          activeLocale === "en"
            ? "bg-primary/20 text-foreground shadow-2xs ring-1 ring-primary/45"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        aria-pressed={activeLocale === "pl"}
        onClick={() => handleSelect("pl")}
        className={cn(
          "inline-flex h-full items-center rounded-[5px] px-2 transition-colors",
          activeLocale === "pl"
            ? "bg-primary/20 text-foreground shadow-2xs ring-1 ring-primary/45"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        PL
      </button>
    </div>
  );
}
