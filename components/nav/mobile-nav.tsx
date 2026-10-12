"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Ellipsis, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { VividaMark } from "@/components/brand/vivida-mark";
import { InstallAppButton } from "@/components/pwa/install-button";
import { AskTabBadge } from "./ask-tab-badge";
import { MessagesTabBadge } from "./messages-tab-badge";
import { NavItemLink } from "./nav-item-link";
import { navItems, navLabel, type NavActiveKey } from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Mobile-only slide-in nav drawer. The desktop NavLinks is `hidden lg:flex`,
 * so phones/tablets need a hamburger entry point. Renders nothing above lg.
 *
 * The `tab` variant renders a bottom-tab-bar-styled "More" trigger instead
 * of the header hamburger, so the fifth tab opens this same drawer, no
 * dead links, no parallel menu to drift.
 */
export function MobileNav({
  active,
  locale = "ka",
  variant = "menu",
  unreadMessages = 0,
  pendingAskNudges = 0,
}: {
  active?: NavActiveKey;
  locale?: UserLocale;
  variant?: "menu" | "tab";
  unreadMessages?: number;
  /** Unopened proactive astrologer nudges, dot on the ask row. */
  pendingAskNudges?: number;
}) {
  const [open, setOpen] = useState(false);
  const moreLabel = locale !== "ka" ? "More" : "მეტი";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        {variant === "tab" ? (
          <button
            type="button"
            aria-label={moreLabel}
            aria-expanded={open}
            className={cn(
              "group flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
              open
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "relative grid size-9 place-items-center rounded-xl transition-all",
                open
                  ? "bg-[var(--vivida-violet)]/25 ring-1 ring-[var(--vivida-violet)]/60 shadow-[0_0_18px_-4px_oklch(0.65_0.24_305/0.6)]"
                  : "group-active:scale-95",
              )}
              style={open ? { color: "oklch(0.78 0.18 305)" } : undefined}
            >
              <Ellipsis className="size-5" />
            </span>
            <span className="truncate">{moreLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={locale !== "ka" ? "Menu" : "მენიუ"}
            className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/85 transition-colors hover:bg-card/60 hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        )}
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild aria-describedby={undefined}>
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-6 border-r border-border bg-card/95 p-6 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl"
              >
                {/* Header, logo + close */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <VividaMark size={36} id="mobile-nav" />
                    <span
                      className="bg-clip-text text-transparent text-lg font-semibold tracking-tight"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
                      }}
                    >
                      vivida
                    </span>
                  </Link>
                  <DialogPrimitive.Close
                    aria-label={locale !== "ka" ? "Close" : "დახურვა"}
                    className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
                  >
                    <X className="size-5" />
                  </DialogPrimitive.Close>
                </div>

                {/* For accessibility, Radix requires DialogTitle inside content. */}
                <DialogPrimitive.Title className="sr-only">
                  {locale !== "ka" ? "Navigation" : "ნავიგაცია"}
                </DialogPrimitive.Title>

                {/* Nav items */}
                <nav className="mb-2 flex flex-col gap-1 overflow-y-auto">
                  {navItems(locale).map((item) => {
                    const { Icon } = item;
                    const isActive = item.key === active;
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
                          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        style={
                          {
                            ["--nav-hue" as string]: item.hue,
                          } as React.CSSProperties
                        }
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              background:
                                "linear-gradient(135deg, color-mix(in oklch, var(--nav-hue) 22%, transparent), color-mix(in oklch, var(--nav-hue) 10%, transparent))",
                              boxShadow:
                                "inset 0 0 0 1px color-mix(in oklch, var(--nav-hue) 30%, transparent)",
                            }}
                          />
                        )}
                        {!isActive && (
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-2xl bg-card/40 opacity-0 ring-1 ring-foreground/5 transition-opacity duration-150 group-hover:opacity-100"
                          />
                        )}
                        <span className="relative z-10 grid place-items-center">
                          <Icon
                            className="size-5 transition-transform duration-200 group-hover:-rotate-6"
                            style={
                              isActive
                                ? {
                                    color: item.hue,
                                    filter: `drop-shadow(0 0 6px ${item.hue})`,
                                  }
                                : undefined
                            }
                          />
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
                        <span className="relative z-10">
                          {navLabel(item, locale)}
                        </span>
                      </NavItemLink>
                    );
                  })}
                </nav>
                <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
                  <NavItemLink
                    href="/account"
                    itemKey="account"
                    surface="mobile_nav"
                    locale={locale}
                    onNavigate={() => setOpen(false)}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {locale === "en"
                      ? "Account & settings →"
                      : "ანგარიში და პარამეტრები →"}
                  </NavItemLink>
                  <InstallAppButton
                    locale={locale}
                    surface="mobile_nav"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground"
                  />
                </div>
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
