"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="mx-auto flex w-fit items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <motion.span
            key={i}
            layout
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "h-1.5 rounded-full transition-colors",
              done && "bg-[var(--vivida-cyan)]/70 w-3",
              active &&
                "bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink))] w-10",
              !active && !done && "bg-border w-3"
            )}
          />
        );
      })}
    </div>
  );
}
