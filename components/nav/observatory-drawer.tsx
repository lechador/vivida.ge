"use client";

import { startTransition, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, Compass, X } from "lucide-react";

import { VividaMark } from "@/components/brand/vivida-mark";
import type { NavActiveKey } from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ObservatoryAuthedSection = dynamic(
  () =>
    import("./observatory-authed-section").then(
      (mod) => mod.ObservatoryAuthedSection,
    ),
  { ssr: false },
);

const PUBLIC_ALMANAC_LINKS_KA = [
  { href: "/horoskopi", label: "დღის ჰოროსკოპი", code: "01" },
  { href: "/nataluri-ruka", label: "ნატალური რუკა", code: "02" },
  { href: "/taro", label: "ტაროს 3-კარტიანი გაშლა", code: "03" },
  { href: "/mtvaris-kalendari", label: "მთვარის კალენდარი", code: "04" },
  { href: "/numerologia", label: "ნუმეროლოგია · ბედის რიცხვი", code: "05" },
  { href: "/zodiac/tavsebadoba", label: "ზოდიაქოს თავსებადობა", code: "06" },
  { href: "/tests", label: "ფსიქოლოგიური ტესტები", code: "07" },
  { href: "/articles", label: "ასტროლოგიური ჟურნალი", code: "08" },
];

const PUBLIC_ALMANAC_LINKS_EN = [
  { href: "/daily-horoscope", label: "Daily Horoscope", code: "01" },
  { href: "/natal-chart", label: "Natal Chart Calculator", code: "02" },
  { href: "/tarot", label: "Three-Card Tarot Studio", code: "03" },
  { href: "/moon-calendar", label: "Lunar Ephemeris Calendar", code: "04" },
  { href: "/numerology", label: "Numerology & Life Path", code: "05" },
  { href: "/compatibility", label: "Synastry & Compatibility", code: "06" },
  { href: "/tests", label: "Psychometric Assessments", code: "07" },
  { href: "/articles", label: "Editorial Archive", code: "08" },
];

/**
 * Slide-Over Architectural Observatory Drawer.
 * Triggered from the Persistent Celestial Context Strip on both desktop and mobile,
 * giving instant access to all authenticated workspace views and public almanac hubs.
 */
export function ObservatoryDrawer({
  authed,
  active,
  locale = "ka",
  unreadMessages = 0,
  pendingAskNudges = 0,
  triggerLabel,
}: {
  authed: boolean;
  active?: NavActiveKey | "account";
  locale?: UserLocale;
  unreadMessages?: number;
  pendingAskNudges?: number;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const en = locale !== "ka";
  const almanacLinks = en ? PUBLIC_ALMANAC_LINKS_EN : PUBLIC_ALMANAC_LINKS_KA;

  function closeDrawer() {
    startTransition(() => {
      setOpen(false);
    });
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-secondary/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground shadow-2xs transition-colors hover:border-primary/60 hover:bg-secondary hover:text-primary"
        >
          <Compass className="size-3.5 text-primary" />
          <span>
            {triggerLabel ?? (en ? "All Instruments" : "ყველა ინსტრუმენტი")}
          </span>
        </button>
      </DialogPrimitive.Trigger>

      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay
            data-radix-dialog-overlay
            className="vivida-drawer-overlay fixed inset-0 z-50 bg-black/75 backdrop-blur-xs"
          />

          <DialogPrimitive.Content asChild aria-describedby={undefined}>
            <aside className="vivida-drawer-right fixed inset-y-0 right-0 z-50 flex w-[min(24rem,92vw)] flex-col border-l border-border bg-card shadow-2xl">
              {/* Top Architectural Header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/60 px-5">
                <Link
                  href={authed ? "/dashboard" : "/"}
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2.5"
                >
                  <VividaMark size={28} id="drawer-mark" />
                  <span className="font-display text-xl font-medium tracking-tight text-foreground">
                    Vivida
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    · {en ? "Index" : "ინდექსი"}
                  </span>
                </Link>
                <DialogPrimitive.Close
                  aria-label={en ? "Close drawer" : "დახურვა"}
                  className="grid size-8 place-items-center rounded-md border border-border bg-secondary/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>

              <DialogPrimitive.Title className="sr-only">
                {en ? "Observatory Navigation" : "ობსერვატორიის ნავიგაცია"}
              </DialogPrimitive.Title>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {/* Section 1: Authenticated Personal Observatory */}
                {authed && (
                  <ObservatoryAuthedSection
                    active={active}
                    locale={locale}
                    unreadMessages={unreadMessages}
                    pendingAskNudges={pendingAskNudges}
                    onNavigate={closeDrawer}
                  />
                )}

                {/* Section 2: Public Astronomical Almanac & Ephemeris Directory */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
                    <span>
                      {en
                        ? `${authed ? "02" : "01"} · Celestial Almanac`
                        : `${authed ? "02" : "01"} · ასტრონომიული ალმანახი`}
                    </span>
                    <span>{almanacLinks.length}</span>
                  </div>
                  <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/70">
                    {almanacLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeDrawer}
                        className="group flex items-center justify-between px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="font-mono text-[11px] tabular-nums text-[var(--vivida-cyan)]">
                            {link.code}
                          </span>
                          <span className="truncate font-medium text-foreground/90">
                            {link.label}
                          </span>
                        </div>
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--vivida-cyan)]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="shrink-0 border-t border-border bg-background/60 px-5 py-4">
                {authed ? (
                  <div className="flex items-center justify-between text-xs">
                    <Link
                      href="/account"
                      onClick={closeDrawer}
                      className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {en
                        ? "Account & settings →"
                        : "ანგარიში და პარამეტრები →"}
                    </Link>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      41°43′N · 44°47′E
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href="/login"
                      onClick={closeDrawer}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {en ? "Sign in" : "შესვლა"}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeDrawer}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <span>
                        {en ? "Create Free Chart" : "შექმენი რუკა უფასოდ"}
                      </span>
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </DialogPrimitive.Root>
  );
}
