import { Suspense } from "react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PopularTools } from "@/components/nav/popular-tools";
import { AstroLockedMain } from "@/components/astro/astro-locked-main";
import { ChartSection } from "@/components/dashboard/chart-section";
import { CosmicLoader } from "@/components/dashboard/cosmic-loader";
import { ReportPdfPanel } from "@/components/report/report-pdf-panel";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import {
  getRequestLocale,
  requestIsEnglishHost,
} from "@/lib/i18n/request-locale";
import { ClearPendingNatalProfile } from "@/components/onboarding/clear-pending-natal-profile";
import type { Metadata } from "next";
import { PremiumPlanCard } from "@/components/subscription/premium-plan-card";
import {
  premiumPlanForCountry,
  shouldShowPurchasePromotion,
} from "@/lib/billing-config";
import { getBalance } from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";
import { CryptoPayHost } from "@/components/crypto/crypto-pay";
import { isCryptoPayConfigured } from "@/lib/crypto-pay";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale !== "ka" ? "My natal chart" : "ჩემი რუკა" };
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const user = await requireUser();
  const { offer } = await searchParams;

  const [[profile], [userPrefs], premium] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select({
        locale: users.interfaceLanguage,
        countryCode: users.residenceCountryCode,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    isPremiumUser(user.id),
  ]);
  const locale = await getRequestLocale(normalizeUserLocale(userPrefs?.locale));
  const en = locale !== "ka";
  // English host pays by card (Stripe checkout is off there); the Georgian
  // site keeps its Stripe surfaces untouched.
  const cryptoPay = (await requestIsEnglishHost()) && isCryptoPayConfigured();
  // Only pay the balance-query cost on the explicit campaign landing path.
  const offerBalance =
    offer === "uk" && !premium ? await getBalance(user.id) : null;
  const showUkOffer =
    offerBalance != null &&
    shouldShowPurchasePromotion({
      isPremium: premium,
      balance: offerBalance,
    });

  if (!profile?.dateOfBirth) {
    return (
      <AstroLockedMain
        active="report"
        title={
          en
            ? "A natal chart needs your birth details"
            : "ნატალური რუკა დაბადების მონაცემებს საჭიროებს"
        }
        description={
          en
            ? "Add your birth date, time and place to calculate your personal cosmic map."
            : "შეავსე დაბადების თარიღი, დრო და ადგილი, რომ შედგეს შენი პერსონალური კოსმიური რუკა."
        }
        next="/report"
        locale={locale}
      />
    );
  }

  const firstName = user.name?.split(" ")[0] ?? null;

  return (
    <CryptoPayHost>
      <main
        lang={locale}
        className="relative isolate flex flex-1 flex-col overflow-hidden"
      >
        <ClearPendingNatalProfile />
        {/* Layered nebula glows, three radial gradients at different points,
          one slowly drifting for life. Together they lift the page out of
          a flat dark, evoking deep cosmos rather than a black screen. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%),radial-gradient(35%_25%_at_70%_85%,oklch(0.30_0.18_280/0.4),transparent_70%)]"
        />
        <div
          aria-hidden
          className="vivida-nebula-drift absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%),radial-gradient(40%_35%_at_75%_60%,oklch(0.42_0.16_200/0.18),transparent_70%)]"
        />
        <Starfield count={160} shooting={3} />

        <AppHeader authed active="report" />

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
          <h1 className="mb-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            {en
              ? firstName
                ? `${firstName}'s `
                : "Your "
              : `${firstName ?? "ვარსკვლავო"}-ის `}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "cosmic chart" : "კოსმიური რუკა"}
            </span>
          </h1>
          <p className="mb-6 max-w-xl text-sm text-foreground/75 sm:text-base">
            {en
              ? "The sky at your birth moment, explored one layer at a time."
              : "ცა შენი დაბადების წამში, ნელ-ნელა, ერთი ნაბიჯი მერე მეორე."}
          </p>

          <div className="mb-6">
            <PopularTools locale={locale} placement="report_top" />
          </div>

          <a
            href="#pdf-report"
            className="mb-6 inline-flex text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {en ? "PDF report and downloads" : "PDF ანგარიში და ჩამოტვირთვა"}
          </a>

          <Suspense
            fallback={
              <div className="flex min-h-[65vh] items-center justify-center">
                <CosmicLoader embedded locale={locale} />
              </div>
            }
          >
            <ChartSection userId={user.id} locale={locale} />
          </Suspense>

          <section id="pdf-report" className="mt-10 scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold">
              {en ? "Your PDF report" : "შენი PDF ანგარიში"}
            </h2>
            <Suspense fallback={null}>
              <ReportPdfPanel
                userId={user.id}
                locale={locale}
                countryCode={userPrefs?.countryCode}
                premium={premium}
                crypto={cryptoPay}
              />
            </Suspense>
          </section>

          {showUkOffer && (
            <div className="mt-6">
              <div className="mb-3 rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 px-5 py-4 text-sm text-foreground/80">
                <strong className="text-foreground">
                  Explore more with PRO.
                </strong>{" "}
                See the plan below for additional features and included access.
              </div>
              <PremiumPlanCard
                plan={premiumPlanForCountry("GB")!}
                locale="en"
                crypto={cryptoPay}
              />
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {en ? "Your birth details" : "შენი დაბადების მონაცემები"}
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/onboarding">
                  <Pencil className="size-3.5" />
                  {en ? "Edit" : "რედაქტირება"}
                </Link>
              </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Field
                label={en ? "Date of birth" : "დაბადების თარიღი"}
                value={profile.dateOfBirth}
              />
              <Field
                label={en ? "Time of birth" : "დაბადების დრო"}
                value={
                  profile.timeOfBirth
                    ? profile.timeOfBirth.slice(0, 5)
                    : en
                      ? "Unknown (12:00 used)"
                      : "უცნობია (გამოყენებულია 12:00)"
                }
              />
              <Field
                label={en ? "Place of birth" : "დაბადების ადგილი"}
                value={profile.cityName}
              />
              <Field
                label={en ? "Time zone" : "დროის სარტყელი"}
                value={profile.timezone}
              />
            </dl>
            {(profile.latitude != null || profile.longitude != null) && (
              <details className="group mt-4 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none transition-colors hover:text-foreground">
                  {en ? "Technical details" : "ტექნიკური დეტალები"}
                </summary>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
                  {profile.latitude != null && (
                    <span>
                      {en ? "Latitude" : "განედი"}:{" "}
                      {profile.latitude.toFixed(4)}
                    </span>
                  )}
                  {profile.longitude != null && (
                    <span>
                      {en ? "Longitude" : "გრძედი"}:{" "}
                      {profile.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </details>
            )}
          </div>
        </section>
      </main>
    </CryptoPayHost>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
