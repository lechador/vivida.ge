import type { Metadata } from "next";

import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { BigFiveResultClient } from "@/components/big-five/big-five-result";

export const metadata: Metadata = {
  title: "შენი Big Five შედეგი",
  description:
    "შენი Big Five (დიდი ხუთეული) ტესტის შედეგი — ხუთ თვისებაზე დაფუძნებული პიროვნების პროფილი.",
  robots: { index: false, follow: false },
};

/**
 * Big Five result page. The profile is computed client-side from the answers
 * stashed by the test (localStorage), so this renders for anyone; the client
 * component gates the per-trait analysis behind login.
 */
export default async function BigFiveResultPage() {
  const session = await auth();
  const authed = !!session?.user?.id;
  const plan = authed ? await getCurrentPlan(session!.user!.id) : "free";

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_265/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? <AppHeader authed plan={plan} active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <BigFiveResultClient />
      </section>
    </main>
  );
}
