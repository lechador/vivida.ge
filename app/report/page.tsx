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
  const cryptoPay = (await requestIsEnglishHost()) && isCryptoPayConfigured();
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
        className="relative isolate flex flex-1 flex-col overflow-hidden bg-background"
      >
        <ClearPendingNatalProfile />
        <Starfield count={48} />

        <AppHeader authed active="report" />

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
          <header className="mb-8 border-b border-border pb-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              NATAL EPHEMERIS RECORD · ნატალური რუკა
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
              <h1
                className={
                  en
                    ? "text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl"
                    : "text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
                }
              >
                {en
                  ? firstName
                    ? `${firstName}'s `
                    : "Your "
                  : `${firstName ?? "ვარსკვლავო"}-ის `}
                <span className="text-primary">
                  {en ? "natal chart" : "კოსმიური რუკა"}
                </span>
              </h1>
              <a
                href="#pdf-report"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {en ? "PDF dossier & downloads ↓" : "PDF ანგარიში და ჩამოტვირთვა ↓"}
              </a>
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              {en
                ? "The sky at your birth moment, calculated and interpreted layer by layer."
                : "ცა შენი დაბადების წამში, დეტალურად გათვლილი და ახსნილი."}
            </p>
          </header>

          <div className="mb-8">
            <PopularTools locale={locale} placement="report_top" />
          </div>

          <Suspense
            fallback={
              <div className="flex min-h-[65vh] items-center justify-center">
                <CosmicLoader embedded locale={locale} />
              </div>
            }
          >
            <ChartSection userId={user.id} locale={locale} />
          </Suspense>

          <section id="pdf-report" className="mt-12 scroll-mt-24">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              ARCHIVE & PRINT · PDF DOSSIER
            </div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
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
              <div className="mb-3 rounded-md border border-primary/30 bg-primary/8 px-5 py-4 text-sm text-foreground/85">
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

          <div className="mt-12 rounded-md border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  OBSERVATORY COORDINATES
                </div>
                <h2 className="mt-0.5 text-lg font-semibold text-foreground">
                  {en ? "Your birth details" : "შენი დაბადების მონაცემები"}
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/onboarding">
                  <Pencil className="size-3.5" />
                  {en ? "Edit" : "რედაქტირება"}
                </Link>
              </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={en ? "Date of birth" : "დაბადების თარიღი"}
                value={profile.dateOfBirth}
                mono
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
                mono
              />
              <Field
                label={en ? "Place of birth" : "დაბადების ადგილი"}
                value={profile.cityName}
              />
              <Field
                label={en ? "Time zone" : "დროის სარტყელი"}
                value={profile.timezone}
                mono
              />
            </dl>
            {(profile.latitude != null || profile.longitude != null) && (
              <details className="group mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none font-mono uppercase tracking-wider transition-colors hover:text-foreground">
                  {en ? "Geodetic coordinates" : "ტექნიკური კოორდინატები"}
                </summary>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono tabular-nums">
                  {profile.latitude != null && (
                    <span>
                      {en ? "LAT" : "განედი"}: {profile.latitude.toFixed(4)}°
                    </span>
                  )}
                  {profile.longitude != null && (
                    <span>
                      {en ? "LON" : "გრძედი"}: {profile.longitude.toFixed(4)}°
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
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-foreground ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
