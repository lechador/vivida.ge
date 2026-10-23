import type { ComponentProps, ReactNode } from "react";

import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { AstroGate } from "@/components/astro/astro-gate";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function AstroLockedMain({
  active,
  title,
  description,
  next,
  locale = "ka",
  topBanner,
}: {
  active?: ComponentProps<typeof AppHeader>["active"];
  title?: string;
  description?: string;
  next?: string;
  locale?: UserLocale;
  topBanner?: ReactNode;
}) {
  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />

      <AppHeader authed active={active} />

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 pb-20 pt-10 sm:px-6">
        {topBanner && <div className="w-full">{topBanner}</div>}
        <AstroGate
          title={title}
          description={description}
          next={next}
          locale={locale}
        />
      </section>
    </main>
  );
}
