import { and, asc as orderAsc, eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil, Sparkles } from "lucide-react";

import { db } from "@/db";
import { profiles, profilePhotos, users } from "@/db/schema";
import { auth } from "@/auth";
import { ensureChartFor } from "@/actions/chart";
import { getCurrentPlan } from "@/lib/plan";
import { computeElementBalance } from "@/lib/elements";
import { computeSynastry } from "@/lib/synastry";
import { signByIndex } from "@/lib/zodiac";
import { getFriendshipStatus } from "@/lib/friendship";
import { ageFromDob } from "@/lib/profile-utils";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { FriendButton } from "@/components/profile/friend-button";
import { MessageButton } from "@/components/chat/message-button";
import { PhotoCarousel } from "@/components/profile/photo-carousel";
import { SynastryDisplayLazy } from "@/components/profile/synastry-display-lazy";

const ELEMENT_GLYPH: Record<string, string> = {
  ცეცხლი: "△",
  მიწა: "▽",
  ჰაერი: "△",
  წყალი: "▽",
};

const ELEMENT_COLOR: Record<string, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile] = await db
    .select({
      isPublic: profiles.isPublic,
      displayName: profiles.displayName,
      bio: profiles.bio,
      username: profiles.username,
    })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  if (!profile?.isPublic) {
    return { title: "პროფილი ვერ მოიძებნა" };
  }

  const name = profile.displayName ?? profile.username ?? "vivida user";
  return {
    title: name,
    description:
      profile.bio ?? `ნახე ${name}-ის ნატალური რუკა და თქვენი თავსებადობა.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Lookup profile + owner user
  const [row] = await db
    .select({
      profile: profiles,
      user: users,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.username, username))
    .limit(1);

  if (!row || !row.profile.isPublic) {
    notFound();
  }
  const { profile, user: owner } = row;

  const ownerPlan = await getCurrentPlan(owner.id);
  const ownerChart = await ensureChartFor(owner.id, ownerPlan);

  // Viewer (may be anonymous, may be the owner, may be a logged-in stranger)
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const viewerPlan = viewerId ? await getCurrentPlan(viewerId) : "free";
  const isOwner = viewerId === owner.id;

  let synastry = null;
  let viewerName: string | null = null;
  if (viewerId && !isOwner && ownerChart) {
    const viewerChart = await ensureChartFor(viewerId, viewerPlan);
    if (viewerChart) {
      synastry = computeSynastry(viewerChart.data, ownerChart.data);
      viewerName = session?.user?.name?.split(" ")[0] ?? "შენ";
    }
  }

  const friendshipStatus =
    viewerId && !isOwner
      ? await getFriendshipStatus(viewerId, owner.id)
      : "none";

  const photos = await db
    .select({ id: profilePhotos.id, url: profilePhotos.url })
    .from(profilePhotos)
    .where(
      and(
        eq(profilePhotos.userId, owner.id),
        eq(profilePhotos.ready, true)
      )
    )
    .orderBy(orderAsc(profilePhotos.sortOrder));

  const data = ownerChart?.data;
  const sun = data?.bodies.sun ? signByIndex(data.bodies.sun.signIndex) : null;
  const moon = data?.bodies.moon
    ? signByIndex(data.bodies.moon.signIndex)
    : null;
  const asc = data ? signByIndex(data.ascendant.signIndex) : null;
  const balance = data ? computeElementBalance(data) : null;

  const displayName =
    profile.displayName ?? owner.name?.split(" ")[0] ?? username;
  const age = ageFromDob(profile.dateOfBirth);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />

      <AppHeader authed={!!viewerId} plan={viewerPlan} />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {/* Profile hero */}
        <article className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative mx-auto w-full max-w-[260px] shrink-0 sm:mx-0 sm:max-w-none sm:w-72">
              {photos.length > 0 ? (
                <PhotoCarousel photos={photos} />
              ) : owner.image ? (
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-70 blur-md"
                  />
                  <Image
                    src={owner.image}
                    alt=""
                    width={144}
                    height={144}
                    className="relative mx-auto size-32 rounded-full border-2 border-background object-cover sm:size-36"
                  />
                </div>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                @{profile.username}
              </div>
              <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {displayName}
                {age != null && (
                  <span className="font-normal text-foreground/70">
                    , {age}
                  </span>
                )}
              </h1>
              {profile.bio && (
                <p className="mt-2 max-w-md text-pretty text-sm text-foreground/85">
                  {profile.bio}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {sun && (
                  <Pill
                    label="მზე"
                    value={sun.labelKa}
                    glyph={sun.symbol}
                    accent="oklch(0.85 0.16 85)"
                  />
                )}
                {moon && (
                  <Pill
                    label="მთვარე"
                    value={moon.labelKa}
                    glyph={moon.symbol}
                    accent="oklch(0.78 0.18 200)"
                  />
                )}
                {asc && (
                  <Pill
                    label="ამომავალი"
                    value={asc.labelKa}
                    glyph={asc.symbol}
                    accent="oklch(0.78 0.18 305)"
                  />
                )}
                {balance && (
                  <Pill
                    label="დომინანტი"
                    value={balance.dominant}
                    glyph={ELEMENT_GLYPH[balance.dominant]}
                    accent={ELEMENT_COLOR[balance.dominant]}
                  />
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-start">
              {isOwner ? (
                <Button asChild variant="outline">
                  <Link href="/account">
                    <Pencil className="size-4" />
                    რედაქტირება
                  </Link>
                </Button>
              ) : viewerId ? (
                <>
                  {friendshipStatus === "friends" && (
                    <MessageButton partnerId={owner.id} />
                  )}
                  <FriendButton
                    targetUserId={owner.id}
                    targetUsername={profile.username}
                    initialStatus={friendshipStatus}
                  />
                </>
              ) : (
                <Button asChild variant="mystic">
                  <Link href="/signup">
                    <Sparkles className="size-4" />
                    შემოდი თავსებადობისთვის
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </article>

        {/* Synastry — visible when a logged-in visitor (not owner) has a chart */}
        {synastry && viewerName && (
          <section className="mt-10">
            <header className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                თქვენი თავსებადობა
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {viewerName} <span className="text-muted-foreground">×</span>{" "}
                {displayName}
              </h2>
            </header>
            <SynastryDisplayLazy
              result={synastry}
              partnerName={displayName}
            />
          </section>
        )}

        {/* Soft CTA when viewer is anonymous */}
        {!viewerId && (
          <section className="mt-10 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/12 p-6 text-center backdrop-blur-xl ring-1 ring-foreground/5">
            <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
            <h2 className="text-xl font-semibold tracking-tight">
              ნახე თქვენი თავსებადობა
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              დარეგისტრირდი — სანამ {displayName}-ის ცის რუკა შენთან ხვდება,
              ჩვენ შენთვისაც ვითვლით თავსებადობას ხუთ სფეროში.
            </p>
            <Button asChild variant="mystic" size="lg" className="mt-5">
              <Link href="/signup">დაიწყე უფასოდ</Link>
            </Button>
          </section>
        )}

        {/* Logged-in visitor without a chart (no profile yet) */}
        {viewerId && !synastry && !isOwner && (
          <section className="mt-10 rounded-2xl border border-border bg-card/65 p-6 text-center backdrop-blur-xl ring-1 ring-foreground/5">
            <h2 className="text-xl font-semibold tracking-tight">
              თქვენი თავსებადობის სანახავად
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ჯერ შეავსე დაბადების მონაცემები.
            </p>
            <Button asChild variant="mystic" className="mt-4">
              <Link href="/onboarding">შეავსე ახლავე</Link>
            </Button>
          </section>
        )}
      </section>
    </main>
  );
}

function Pill({
  label,
  value,
  glyph,
  accent,
}: {
  label: string;
  value: string;
  glyph: string;
  accent: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-sm">
      <span className="text-base" style={{ color: accent }}>
        {glyph}
      </span>
      <span className="text-foreground">{value}</span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
