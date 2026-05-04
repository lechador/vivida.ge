import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";

import { db } from "@/db";
import { profiles, profilePhotos } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { asc } from "drizzle-orm";
import { getCurrentPlan, getSubscription } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { SubscriptionStatusCard } from "@/components/account/sub-status-card";
import { DangerZone } from "@/components/account/danger-zone";
import { VisibilityCard } from "@/components/account/visibility-card";
import { PhotoUploader } from "@/components/account/photo-uploader";

export const metadata = { title: "ანგარიში" };

export default async function AccountPage() {
  const user = await requireUser();

  const [[profile], subscription, plan, photos] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1),
    getSubscription(user.id),
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
  ]);

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
          {user.image && (
            <Image
              src={user.image}
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

        {/* Subscription */}
        <div className="mb-6">
          <SubscriptionStatusCard subscription={subscription} />
        </div>

        {/* Public profile visibility */}
        <div className="mb-6">
          <VisibilityCard
            initial={{
              isPublic: profile?.isPublic ?? false,
              username: profile?.username ?? null,
              displayName: profile?.displayName ?? null,
              bio: profile?.bio ?? null,
            }}
            defaultName={user.name ?? null}
          />
        </div>

        {/* Profile photos */}
        <div className="mb-6">
          <PhotoUploader
            initial={photos.filter((p) => p.ready).map((p) => ({
              id: p.id,
              url: p.url,
              ready: p.ready,
            }))}
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
