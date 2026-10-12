import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-helpers";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { partnerCreationsThisMonth } from "@/lib/partners-core";
import { PARTNER_CAP_PER_MONTH } from "@/lib/partners-config";
import { PartnerForm } from "@/components/synastry/partner-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  return { title: en ? "Add a partner" : "ახალი პარტნიორი" };
}

export default async function NewPartnerPage() {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const user = await requireUser();
  // Server-side cap check, keeps unauthorised users from bypassing the
  // client-side disabled CTA.
  const used = await partnerCreationsThisMonth(user.id);
  const cap = PARTNER_CAP_PER_MONTH;
  if (used >= cap) {
    redirect("/synastry");
  }

  return (
    <main
      lang={locale}
      className="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.18_350/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />

      <AppHeader authed active="synastry" />

      <section className="relative z-10 mx-auto w-full max-w-xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <Link
          href="/synastry"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {en ? "Back" : "უკან"}
        </Link>

        <h1 className="mb-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {en
            ? "Whose chart would you like to compare?"
            : "ვისთან გინდა შეადარო ცა?"}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {en
            ? "Enter their birth details. This can be a romantic partner, family member, old friend, or anyone you're curious about."
            : "ჩაწერე პარტნიორის დაბადების მონაცემები. პარტნიორი ვინც არ უნდა იყოს, საყვარელი, ოჯახის წევრი, ძველი მეგობარი ან ვინც გაინტერესებს."}
        </p>

        <PartnerForm locale={locale} />
      </section>
    </main>
  );
}
