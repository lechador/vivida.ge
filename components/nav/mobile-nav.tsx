"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { VividaMark } from "@/components/brand/vivida-mark";
import type { PlanId } from "@/lib/pricing";
import { NAV_ITEMS, navLabel, type NavActiveKey } from "./nav-items";

/**
 * Mobile-only slide-in nav drawer. The desktop NavLinks is `hidden lg:flex`,
 * so phones/tablets need a hamburger entry point. Renders nothing above lg.
 */
export function MobileNav({
  active,
  plan,
}: {
  active?: NavActiveKey;
  plan: PlanId;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="მენიუ"
          className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/85 transition-colors hover:bg-card/60 hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
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
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-6 border-r border-border bg-card/95 p-6 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl"
              >
                {/* Header — logo + close */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/feed"
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
                    aria-label="დახურვა"
                    className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
                  >
                    <X className="size-5" />
                  </DialogPrimitive.Close>
                </div>

                {/* For accessibility — Radix requires DialogTitle inside content. */}
                <DialogPrimitive.Title className="sr-only">
                  ნავიგაცია
                </DialogPrimitive.Title>

                {/* Nav items */}
                <nav className="flex flex-col gap-1 mb-2">
                  {NAV_ITEMS.map((item) => {
                    const { Icon } = item;
                    const isActive = item.key === active;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
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
                        <Icon
                          className="relative z-10 size-5 transition-transform duration-200 group-hover:-rotate-6"
                          style={
                            isActive
                              ? {
                                  color: item.hue,
                                  filter: `drop-shadow(0 0 6px ${item.hue})`,
                                }
                              : undefined
                          }
                        />
                        <span className="relative z-10">{navLabel(item, plan)}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
