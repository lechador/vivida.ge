import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Hero } from "@/components/landing/hero";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { VividaMark } from "@/components/brand/vivida-mark";

export default async function Home() {
  // If you're already signed in there's nothing for you on the marketing
  // page — straight to the app. Keeps the back-button from leaving authed
  // users staring at a "Sign in" CTA.
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <>
      <main className="relative isolate flex-1 overflow-hidden">
        {/* Cosmic backdrop layers */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_0%,oklch(0.28_0.12_300/0.55),transparent_70%),radial-gradient(40%_30%_at_85%_70%,oklch(0.32_0.13_200/0.4),transparent_70%),radial-gradient(35%_25%_at_15%_85%,oklch(0.35_0.15_350/0.35),transparent_70%)]"
        />
        <Starfield />

        {/* Top nav */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
          <Link href="/" className="flex items-center gap-2">
            <VividaMark size={40} id="landing" />
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
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-foreground"
            >
              როგორ მუშაობს
            </Link>
            <Link
              href="/features"
              className="transition-colors hover:text-foreground"
            >
              ფუნქციები
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground"
            >
              ფასები
            </Link>
          </nav>
        </header>

        <Hero />

        {/* Bottom fade into the dark background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent"
        />
      </main>
      <SiteFooter />
    </>
  );
}
