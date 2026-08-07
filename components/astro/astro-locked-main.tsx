import type { ComponentProps } from "react";

import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { AstroGate } from "@/components/astro/astro-gate";

/**
 * Full-page "this feature needs an astro profile" shell — keeps the header and
 * cosmic background so the page stays navigable, and centers the AstroGate CTA.
 * Rendered in place of a birth-data-gated page for accounts without birth data.
 */
export function AstroLockedMain({
  active,
  title,
  description,
  next,
}: {
  active?: ComponentProps<typeof AppHeader>["active"];
  title?: string;
  description?: string;
  next?: string;
}) {
  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      <AppHeader authed active={active} />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 pb-20 pt-10 sm:px-6">
        <AstroGate title={title} description={description} next={next} />
      </section>
    </main>
  );
}
