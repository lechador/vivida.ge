import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { VividaMark } from "@/components/brand/vivida-mark";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      (await getRequestLocale()) === "en"
        ? "Page not found"
        : "გვერდი ვერ მოიძებნა",
  };
}

export default async function NotFound() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return (
    <main lang={locale} className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.4),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} />

      <header className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <VividaMark size={36} id="not-found" />
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
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-2 sm:px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
            <Compass className="size-7 text-[var(--vivida-violet)]" />
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            404
          </div>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {en ? "This page is " : "ეს გვერდი "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "inside a black hole" : "შავ ხვრელშია"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-pretty text-base text-muted-foreground">
            {en
              ? "The link may be incorrect or the page may have moved. Let’s get you back on course."
              : "ან არასწორი ლინკი, ან გვერდი წაშლილია. დავაბრუნოთ შენი კოსმოსის გზაზე."}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="mystic" size="lg">
              <Link href="/">{en ? "Home" : "მთავარი"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              {SOCIAL_FEATURES.swipeDeck ? (
                <Link href="/discover">{en ? "Discover" : "აღმოაჩინე"}</Link>
              ) : (
                <Link href="/feed">{en ? "Feed" : "ფიდი"}</Link>
              )}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
