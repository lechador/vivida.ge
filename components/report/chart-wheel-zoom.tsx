"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";

import { ChartWheel } from "@/components/dashboard/chart-wheel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NatalChartJson } from "@/db/schema";

/**
 * The natal wheel, click-to-zoom. Tapping it opens a dialog with a much larger
 * version so the glyphs + aspect lines are actually legible.
 */
export function ChartWheelZoom({ chart }: { chart: NatalChartJson }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="გაადიდე რუკა"
        className="group relative block w-full cursor-zoom-in rounded-full transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vivida-violet)]/60"
      >
        <ChartWheel chart={chart} />
        <span className="pointer-events-none absolute bottom-2 right-2 grid size-8 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(92vw,640px)] border-border bg-card/95 p-4 backdrop-blur-xl sm:p-6">
          <DialogTitle className="sr-only">ნატალური რუკა</DialogTitle>
          <ChartWheel chart={chart} />
        </DialogContent>
      </Dialog>
    </>
  );
}
