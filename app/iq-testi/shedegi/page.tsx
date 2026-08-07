import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { IqResultClient } from "@/components/iq/iq-result";

export const metadata: Metadata = {
  title: "შენი IQ შედეგი",
  description: "შენი ინტელექტის ტესტის შედეგი — IQ ქულა, პროცენტილი და აზროვნების ანალიზი.",
  robots: { index: false, follow: false }, // per-session result, nothing to index
};

/**
 * IQ result page. The result is computed client-side from the answers stashed
 * by the test (localStorage) — so this page renders for anyone; the client
 * component gates the deep breakdown behind login.
 */
export default async function IqResultPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_265/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_190/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <IqResultClient />
      </section>
    </main>
  );
}
