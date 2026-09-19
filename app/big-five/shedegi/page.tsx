import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { BigFiveResultClient } from "@/components/big-five/big-five-result";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return {
    title: en ? "Your Big Five Result" : "შენი Big Five შედეგი",
    description: en
      ? "Your five-trait Big Five personality profile."
      : "შენი Big Five (დიდი ხუთეული) ტესტის შედეგი — ხუთ თვისებაზე დაფუძნებული პიროვნების პროფილი.",
    robots: { index: false, follow: false },
  };
}

/**
 * Big Five result page. The profile is computed client-side from the answers
 * stashed by the test (localStorage), so this renders for anyone; the client
 * component gates the per-trait analysis behind login.
 */
export default async function BigFiveResultPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const locale = await getRequestLocale();

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_265/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? (
        <AppHeader authed active="tests" />
      ) : (
        <SmartHeader
          active="tests"
          locale={locale}
          georgianPath="/big-five/shedegi"
        />
      )}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <BigFiveResultClient locale={locale} />
      </section>
    </main>
  );
}
