import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";

import { db } from "@/db";
import { profiles, profilePhotos, users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { asc } from "drizzle-orm";
import { getHeaderData } from "@/lib/header-cache";
import { getCurrentPlan } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { DangerZone } from "@/components/account/danger-zone";
import { VisibilityCard } from "@/components/account/visibility-card";
import { PhotoUploader } from "@/components/account/photo-uploader";
import { AiAvatarGenerator } from "@/components/account/ai-avatar-generator";
import { PushOptIn } from "@/components/push/push-opt-in";
import { ProUpsell } from "@/components/paywall/pro-upsell";
import { canUseFeature } from "@/lib/features";
import { EmailPreferencesCard } from "@/components/account/email-preferences-card";
import { HoroscopeVoiceCard } from "@/components/account/horoscope-voice-card";

export const metadata = { title: "ანგარიში" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();

  const [[profile], plan, photos, [emailPrefs], headerData] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1),
    getCurrentPlan(user.id),
    db
      .select({
        id: profilePhotos.id,
        url: profilePhotos.url,
        ready: profilePhotos.ready,
      })
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, user.id))
      .orderBy(asc(profilePhotos.sortOrder)),
    db
      .select({
        daily: users.emailDailyHoroscope,
        marketing: users.emailMarketing,
        nudges: users.emailNudges,
        voice: users.horoscopeVoice,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    getHeaderData(user.id),
  ]);
  // Same avatar resolution as the navbar so they never disagree.
  const accountAvatar = headerData.avatarUrl ?? user.image ?? null;

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,oklch(0.28_0.12_300/0.4),transparent_70%)]"
      />
      <Starfield count={70} />

      <AppHeader authed plan={plan} active="account" />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ანგარიში
        </div>
        <h1 className="mb-8 text-balance text-3xl font-semibold tracking-tight sm:mb-10 sm:text-5xl">
          {user.name?.split(" ")[0] ?? "შენი"}-ის ანგარიში
        </h1>

        {/* Profile */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
          {accountAvatar && (
            <Image
              src={accountAvatar}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full border border-border"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-medium text-foreground">
              {user.name ?? "ვარსკვლავო"}
            </div>
            <div className="truncate text-sm text-foreground/65">
              {user.email}
            </div>
          </div>
          <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/75">
            Google
          </span>
        </div>

        {/* Profile photos — surfaced near the top so it's easy to find */}
        <div className="mb-6">
          <PhotoUploader
            initial={photos.filter((p) => p.ready).map((p) => ({
              id: p.id,
              url: p.url,
              ready: p.ready,
            }))}
          />
        </div>

        {/* AI zodiac avatar — Pro (trial counts as pro); free users see an upsell */}
        <div className="mb-6">
          {canUseFeature("aiAvatar", plan) ? (
            <AiAvatarGenerator initialAvatar={accountAvatar} />
          ) : (
            <ProUpsell
              title="AI ავატარი"
              description="შექმენი შენი ზოდიაქოს ნიშნის პერსონალური ავატარი Vivida-ს სტილში — Vivida Pro-ით."
            />
          )}
        </div>

        {/* Subscription */}
        <div className="mb-6">
          <Link
            href="/subscription"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 via-card/60 to-[var(--vivida-cyan)]/8 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5"
          >
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">
                გამოწერა და Pro
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ნახე გეგმის სტატუსი, განაახლე ბარათი ან გადადი Pro-ზე.
              </p>
            </div>
            <span aria-hidden className="text-2xl text-muted-foreground transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Push notifications */}
        <div className="mb-6">
          <PushOptIn />
        </div>

        {/* Email preferences */}
        <div className="mb-6">
          <EmailPreferencesCard
            initial={
              emailPrefs ?? { daily: true, marketing: true, nudges: true }
            }
          />
        </div>

        {/* Audio horoscope voice */}
        <div className="mb-6">
          <HoroscopeVoiceCard initial={emailPrefs?.voice ?? null} />
        </div>

        {/* Public profile fields */}
        <div className="mb-6">
          <VisibilityCard
            initial={{
              username: profile?.username ?? null,
              displayName: profile?.displayName ?? null,
              bio: profile?.bio ?? null,
              discoverable: profile?.discoverable ?? true,
            }}
            defaultName={user.name ?? null}
          />
        </div>

        {/* Birth data */}
        <div className="mb-6 rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">დაბადების მონაცემები</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/onboarding">
                <Pencil className="size-3.5" />
                რედაქტირება
              </Link>
            </Button>
          </div>
          {profile ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Field label="დაბადების თარიღი" value={profile.dateOfBirth} />
              <Field
                label="დაბადების დრო"
                value={
                  profile.timeOfBirth
                    ? profile.timeOfBirth.slice(0, 5)
                    : "უცნობია (გამოყენებულია 12:00)"
                }
              />
              <Field label="დაბადების ადგილი" value={profile.cityName} />
              <Field label="დროის სარტყელი" value={profile.timezone} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              შენი მონაცემები ჯერ შენახული არ არის.{" "}
              <Link href="/onboarding" className="underline">
                შეავსე ახლავე
              </Link>
              .
            </p>
          )}
        </div>

        <DangerZone />
      </section>
    </main>
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
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
