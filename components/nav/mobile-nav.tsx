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
 * Editorial Celestial Mobile Slide-In Navigation Drawer.
 * Flat matte charcoal surface with crisp 1px hairline rows.
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
              "group flex w-full flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors",
              open
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "relative grid size-8 place-items-center rounded-md transition-colors",
                open
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              <Ellipsis className="size-4.5" />
            </span>
            <span className="truncate">{moreLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            aria-label={locale !== "ka" ? "Menu" : "მენიუ"}
            className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card text-foreground/85 transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="size-4.5" />
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
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild aria-describedby={undefined}>
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r border-border bg-card p-5"
              >
                {/* Header: Brand Lockup + Close */}
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <VividaMark size={30} id="mobile-nav" />
                    <span className="font-display text-2xl font-medium tracking-tight text-foreground">
                      Vivida
                    </span>
                  </Link>
                  <DialogPrimitive.Close
                    aria-label={locale !== "ka" ? "Close" : "დახურვა"}
                    className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                </div>

                <DialogPrimitive.Title className="sr-only">
                  {locale !== "ka" ? "Navigation" : "ნავიგაცია"}
                </DialogPrimitive.Title>

                {/* Nav items */}
                <nav className="my-4 flex flex-col gap-0.5 overflow-y-auto">
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
                          "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute inset-y-1.5 left-0 w-0.5 bg-primary"
                          />
                        )}
                        <span
                          className={cn(
                            "relative grid size-5 place-items-center",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4.5" />
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
                        <span>{navLabel(item, locale)}</span>
                      </NavItemLink>
                    );
                  })}
                </nav>

                <div className="mt-auto space-y-3 border-t border-border/80 pt-4">
                  <NavItemLink
                    href="/account"
                    itemKey="account"
                    surface="mobile_nav"
                    locale={locale}
                    onNavigate={() => setOpen(false)}
                    className="block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {locale === "en"
                      ? "Account & settings →"
                      : "ანგარიში და პარამეტრები →"}
                  </NavItemLink>
                  <InstallAppButton
                    locale={locale}
                    surface="mobile_nav"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
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
