"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A collapsible report section. Header is always visible; clicking it
 * (or the chevron) toggles the body. Auto-expands when a URL hash matches
 * its id, so clicking a ReportNav pill or any deep-link expands the
 * destination section instead of dropping the user on a closed accordion.
 */
export function CollapsibleSection({
  id,
  /** Pre-rendered icon JSX, e.g. <Sparkles className="size-5" />. We accept
   *  rendered JSX rather than a component so this client component can be
   *  used from RSC parents, components-as-props don't cross the boundary. */
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Auto-expand when this section is the URL hash target
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkHash = () => {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [id]);

  return (
    <motion.section
      id={id}
      className="scroll-mt-16 sm:scroll-mt-24"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      // "some" = reveal as soon as any part enters the viewport. A ratio
      // threshold (amount: 0.15) breaks on tall sections: houses/aspects can
      // exceed viewport_height / 0.15, so 15% of them is never on-screen at
      // once, whileInView never fires, and the section stays invisible while
      // still occupying layout space, a giant blank gap in the report.
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        className="group flex w-full items-center gap-4 rounded-2xl border border-transparent p-2 text-left transition-colors hover:border-border/60 hover:bg-card/40"
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border/80 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/15 text-foreground/85 ring-1 ring-foreground/10 transition-transform group-hover:scale-105">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-content`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
