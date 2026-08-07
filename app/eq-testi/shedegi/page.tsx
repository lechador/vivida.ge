import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { EqResultClient } from "@/components/eq/eq-result";

export const metadata: Metadata = {
  title: "შენი EQ შედეგი",
  description:
    "შენი ემოციური ინტელექტის ტესტის შედეგი — EQ ქულა და ემოციური რუკა ხუთ სფეროში.",
  robots: { index: false, follow: false },
};

/**
 * EQ result page. The result is computed client-side from the answers stashed
 * by the test (localStorage), so this renders for anyone; the client component
 * gates the deep 5-domain profile behind login.
 */
export default async function EqResultPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />

      {authed ? <AppHeader authed active="tests" /> : <SmartHeader />}

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <EqResultClient />
      </section>
    </main>
  );
}
