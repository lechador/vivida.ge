"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Compass,
  Layers,
  Moon,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { VividaMark } from "@/components/brand/vivida-mark";
import { AskTabBadge } from "./ask-tab-badge";
import { MessagesTabBadge } from "./messages-tab-badge";
import { NavItemLink } from "./nav-item-link";
import { navItems, navLabel, type NavActiveKey } from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  { href: "/horoskopi", label: "Daily Horoscope", code: "01" },
  { href: "/natal-chart", label: "Natal Chart Calculator", code: "02" },
  { href: "/taro", label: "Three-Card Tarot Studio", code: "03" },
  { href: "/mtvaris-kalendari", label: "Lunar Ephemeris Calendar", code: "04" },
  { href: "/numerologia", label: "Numerology & Life Path", code: "05" },
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
  const items = navItems(locale);
  const almanacLinks = en ? PUBLIC_ALMANAC_LINKS_EN : PUBLIC_ALMANAC_LINKS_KA;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border border-border bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary/60 hover:text-primary"
        >
          <Compass className="size-3.5 text-primary" />
          <span>
            {triggerLabel ??
              (en ? "All Instruments" : "ყველა ინსტრუმენტი")}
          </span>
        </button>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild aria-describedby={undefined}>
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 36 }}
                className="fixed inset-y-0 right-0 z-50 flex w-[min(24rem,92vw)] flex-col border-l border-border bg-card"
              >
                {/* Top Architectural Header */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
                  <Link
                    href={authed ? "/dashboard" : "/"}
                    onClick={() => setOpen(false)}
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
                    className="grid size-8 place-items-center rounded-sm border border-border bg-background/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
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
                    <div className="mb-6">
                      <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        <span>
                          {en ? "01 · Personal Workspace" : "01 · პირადი სივრცე"}
                        </span>
                        <span>{items.length}</span>
                      </div>
                      <div className="divide-y divide-border border border-border bg-background/40">
                        {items.map((item, idx) => {
                          const isActive = item.key === active;
                          const Icon = item.Icon;
                          return (
                            <NavItemLink
                              key={item.key}
                              href={item.href}
                              itemKey={item.key}
                              surface="mobile_nav"
                              locale={locale}
                              onNavigate={() => setOpen(false)}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "group relative flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors",
                                isActive
                                  ? "bg-secondary text-foreground"
                                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                              )}
                            >
                              {isActive && (
                                <span
                                  aria-hidden
                                  className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                                />
                              )}
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span
                                  className={cn(
                                    "relative grid size-5 shrink-0 place-items-center",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-foreground",
                                  )}
                                >
                                  <Icon className="size-4" />
                                  {item.key === "messages" && (
                                    <MessagesTabBadge
                                      initial={unreadMessages}
                                      locale={locale}
                                    />
                                  )}
                                  {item.key === "ask" && (
                                    <AskTabBadge
                                      pending={pendingAskNudges}
                                      locale={locale}
                                    />
                                  )}
                                </span>
                                <span className="truncate font-medium">
                                  {navLabel(item, locale)}
                                </span>
                              </div>
                              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                            </NavItemLink>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Public Astronomical Almanac & Ephemeris Directory */}
                  <div>
                    <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      <span>
                        {en
                          ? `${authed ? "02" : "01"} · Celestial Almanac`
                          : `${authed ? "02" : "01"} · ასტრონომიული ალმანახი`}
                      </span>
                      <span>{almanacLinks.length}</span>
                    </div>
                    <div className="divide-y divide-border border border-border bg-background/40">
                      {almanacLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="font-mono text-[11px] tabular-nums text-primary/80">
                              {link.code}
                            </span>
                            <span className="truncate font-medium text-foreground/90">
                              {link.label}
                            </span>
                          </div>
                          <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
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
                        onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {en ? "Sign in" : "შესვლა"}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setOpen(false)}
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
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
