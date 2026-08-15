import { and, asc as orderAsc, eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, Users } from "lucide-react";

import { db } from "@/db";
import { profiles, profilePhotos, users } from "@/db/schema";
import { auth } from "@/auth";
import { ensureChartFor } from "@/actions/chart";
import {
  countPostsByUser,
  listRecentPostsByUser,
} from "@/actions/feed";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { isAdminEmail } from "@/lib/admin-auth";
import { computeElementBalance } from "@/lib/elements";
import { computeSynastry, overallVerdict } from "@/lib/synastry";
import { overallVerdictEn } from "@/lib/synastry-en";
import { getSynastryInterpretationsFor } from "@/lib/synastry-library";
import { signByIndex } from "@/lib/zodiac";
import {
  countFriends,
  countMutualFriends,
  getFriendshipStatus,
  listMutualFriendsPreview,
} from "@/lib/friendship";
import { ageFromDob } from "@/lib/profile-utils";
import {
  getLatestEqResult,
  getLatestIqResult,
  getLatestMbtiResult,
} from "@/lib/test-results";
import { EQ_BAND_META, type EqBand } from "@/lib/eq/scoring";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { CountryBadge } from "@/components/profile/country-badge";
import { isPremiumUser } from "@/lib/premium";
import { countryDisplayName } from "@/lib/residence";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { FriendButton } from "@/components/profile/friend-button";
import { MessageButton } from "@/components/chat/message-button";
import { SafetyMenu } from "@/components/safety/safety-menu";
import { isBlockedEitherWay } from "@/lib/block";
import { PhotoCarousel } from "@/components/profile/photo-carousel";
import { AiAvatarButton } from "@/components/profile/ai-avatar-button";
import { SynastryDisplayLazy } from "@/components/profile/synastry-display-lazy";
import { SynastryDisplayEn } from "@/components/synastry/synastry-display-en";
import { FeedList } from "@/components/feed/feed-list";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";

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

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const locale = await getRequestLocale();
  const en = locale === "en";
  const [profile] = await db
    .select({
      displayName: profiles.displayName,
      bio: profiles.bio,
      username: profiles.username,
    })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  if (!profile) {
    return { title: en ? "Profile not found" : "პროფილი ვერ მოიძებნა" };
  }

  const name = profile.displayName ?? profile.username ?? "vivida user";
  return {
    title: name,
    description:
      profile.bio ??
      (en
        ? `View ${name}'s natal chart and explore your compatibility.`
        : `ნახე ${name}-ის ნატალური რუკა და თქვენი თავსებადობა.`),
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

  if (!row) {
    notFound();
  }
  const { profile, user: owner } = row;

  const ownerChart = await ensureChartFor(owner.id);

  // Viewer (may be anonymous, may be the owner, may be a logged-in stranger).
  // Anonymous visitors still inherit the request host language.
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const locale = viewerId
    ? await getUserLocale(viewerId)
    : await getRequestLocale();
  const en = locale === "en";

  // Public test results the owner has opted to display.
  const testBadges: { label: string; value: string; glyph: string }[] = [];
  if (profile.showMbtiResult) {
    const m = await getLatestMbtiResult(owner.id);
    if (m) {
      testBadges.push({
        label: en ? "Type" : "ტიპი",
        value: m.mbtiType,
        glyph: "🧠",
      });
    }
  }
  if (profile.showIqResult) {
    const iq = await getLatestIqResult(owner.id);
    if (iq) testBadges.push({ label: "IQ", value: String(iq.iq), glyph: "🎯" });
  }
  if (profile.showEqResult) {
    const result = await getLatestEqResult(owner.id);
    if (result) {
      const bandMeta = EQ_BAND_META[result.band as EqBand];
      const band = en ? bandMeta?.labelEn : bandMeta?.labelKa;
      testBadges.push({
        label: "EQ",
        value: band ? `${result.overall} · ${band}` : String(result.overall),
        glyph: "💗",
      });
    }
  }

  const isOwner = viewerId === owner.id;
  const viewerIsAdmin = viewerId ? isAdminEmail(session?.user?.email) : false;

  // Block guard: if either party has blocked the other, the profile is hidden
  // (404) so a blocked user can't view or act on the blocker, and vice versa.
  if (viewerId && !isOwner && (await isBlockedEitherWay(viewerId, owner.id))) {
    notFound();
  }

  // Profile stats — friends + posts, both public.
  const [ownerFriendsCount, ownerPostsCount] = await Promise.all([
    countFriends(owner.id),
    countPostsByUser(owner.id),
  ]);

  let synastry = null;
  let synastryTexts: Record<string, string> = {};
  let viewerName: string | null = null;
  let viewerSunSign = null;
  if (viewerId && !isOwner && ownerChart) {
    const viewerChart = await ensureChartFor(viewerId);
    if (viewerChart) {
      synastry = computeSynastry(viewerChart.data, ownerChart.data);
      if (!en) {
        synastryTexts = await getSynastryInterpretationsFor(synastry);
      }
      viewerName = session?.user?.name?.split(" ")[0] ?? (en ? "You" : "შენ");
      const viewerSunIdx = viewerChart.data?.bodies?.sun?.signIndex;
      if (typeof viewerSunIdx === "number") {
        viewerSunSign = signByIndex(viewerSunIdx);
      }
    }
  }

  const friendshipStatus =
    viewerId && !isOwner
      ? await getFriendshipStatus(viewerId, owner.id)
      : "none";

  // Mutual friends — only meaningful for a logged-in non-owner viewer.
  const mutualCount =
    viewerId && !isOwner ? await countMutualFriends(viewerId, owner.id) : 0;
  const mutualPreview =
    mutualCount > 0 && viewerId
      ? await listMutualFriendsPreview(viewerId, owner.id, 4)
      : [];

  // Recent posts visible only to signed-in viewers — the read path calls
  // requireUser() so we can't run it for anonymous visitors. The empty-
  // state branch hides the section when there's nothing to show.
  const recentPosts =
    viewerId && ownerPostsCount > 0
      ? await listRecentPostsByUser(owner.id, 5)
      : [];

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
  const ownerVerified = await isPremiumUser(owner.id);
  const age = ageFromDob(profile.dateOfBirth);

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />

      <AppHeader authed={!!viewerId} />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        {/* Profile hero */}
        <article className="relative overflow-hidden rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-25 blur-3xl"
          />
          <div className="relative grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
            <div className="relative mx-auto w-full max-w-[260px] sm:mx-0 sm:w-64">
              {photos.length > 0 ? (
                <PhotoCarousel photos={photos} locale={locale} />
              ) : (
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-70 blur-md"
                  />
                  <Image
                    src={owner.image || DEFAULT_AVATAR}
                    alt=""
                    width={160}
                    height={160}
                    className="relative mx-auto size-32 rounded-full border-2 border-background object-cover sm:size-40"
                  />
                </div>
              )}

              {/* Owner-only: regenerate a brand-styled AI avatar in place */}
              {isOwner && (
                <AiAvatarButton locale={locale} />
              )}
            </div>

            <div className="min-w-0">
              {/* Identity row: @handle + actions on the same line so the
                  name underneath gets the full width and never wraps awkwardly. */}
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  @{profile.username}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isOwner ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/account">
                        <Pencil className="size-4" />
                        {en ? "Edit" : "რედაქტირება"}
                      </Link>
                    </Button>
                  ) : viewerId ? (
                    <>
                      {friendshipStatus === "friends" && (
                        <MessageButton partnerId={owner.id} locale={locale} />
                      )}
                      <FriendButton
                        targetUserId={owner.id}
                        targetUsername={profile.username}
                        initialStatus={friendshipStatus}
                        locale={locale}
                      />
                      <SafetyMenu targetUserId={owner.id} locale={locale} />
                    </>
                  ) : (
                    <Button asChild variant="mystic" size="sm">
                      <Link href="/signup">
                        <Sparkles className="size-4" />
                        {en ? "Join" : "შემოდი"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  {displayName}
                  {ownerVerified && (
                    <VerifiedBadge className="ml-2 inline-flex align-middle" />
                  )}
                  {age != null && (
                    <span className="ml-1 font-normal text-foreground/70">
                      , {age}
                    </span>
                  )}
                </h1>
                <CountryBadge
                  countryCode={owner.residenceCountryCode}
                  countryName={countryDisplayName(owner.residenceCountryCode, locale)}
                />
              </div>

              {profile.bio && (
                <p className="mt-2 max-w-md text-pretty text-sm text-foreground/85">
                  {profile.bio}
                </p>
              )}

              <ProfileStats
                friends={ownerFriendsCount}
                posts={ownerPostsCount}
                locale={locale}
              />

              {mutualCount > 0 && (
                <div className="mt-3">
                  <MutualFriendsPill
                    count={mutualCount}
                    preview={mutualPreview}
                    locale={locale}
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {sun && (
                  <Pill
                    label={en ? "Sun" : "მზე"}
                    value={en ? sun.labelEn : sun.labelKa}
                    glyph={sun.symbol}
                    accent="oklch(0.85 0.16 85)"
                  />
                )}
                {moon && (
                  <Pill
                    label={en ? "Moon" : "მთვარე"}
                    value={en ? moon.labelEn : moon.labelKa}
                    glyph={moon.symbol}
                    accent="oklch(0.78 0.18 200)"
                  />
                )}
                {asc && (
                  <Pill
                    label={en ? "Rising" : "ამომავალი"}
                    value={en ? asc.labelEn : asc.labelKa}
                    glyph={asc.symbol}
                    accent="oklch(0.78 0.18 305)"
                  />
                )}
                {balance && (
                  <Pill
                    label={en ? "Dominant" : "დომინანტი"}
                    value={en ? ELEMENT_EN[balance.dominant] ?? balance.dominant : balance.dominant}
                    glyph={ELEMENT_GLYPH[balance.dominant]}
                    accent={ELEMENT_COLOR[balance.dominant]}
                  />
                )}
                {testBadges.map((tb) => (
                  <Pill
                    key={tb.label}
                    label={tb.label}
                    value={tb.value}
                    glyph={tb.glyph}
                    accent="oklch(0.78 0.18 305)"
                  />
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Synastry — visible when a logged-in visitor (not owner) has a chart */}
        {synastry && viewerName && (
          <section className="mt-10">
            <header className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                {en ? "Your compatibility" : "თქვენი თავსებადობა"}
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {viewerName} <span className="text-muted-foreground">×</span>{" "}
                {displayName}
              </h2>
            </header>
            {en ? (
              <SynastryDisplayEn
                result={synastry}
                partnerName={displayName}
                shareCardProps={
                  viewerName && viewerSunSign && sun
                    ? {
                        viewerName,
                        viewerSignLabel: viewerSunSign.labelEn,
                        viewerSignSymbol: viewerSunSign.symbol,
                        partnerName: displayName,
                        partnerSignLabel: sun.labelEn,
                        partnerSignSymbol: sun.symbol,
                        result: synastry,
                        verdict: overallVerdictEn(synastry.overall),
                        locale,
                      }
                    : undefined
                }
              />
            ) : (
              <SynastryDisplayLazy
                result={synastry}
                partnerName={displayName}
                interpretations={synastryTexts}
                locale={locale}
                shareCardProps={
                viewerName && viewerSunSign && sun
                  ? {
                      viewerName,
                      viewerSignLabel: en
                        ? viewerSunSign.labelEn
                        : viewerSunSign.labelKa,
                      viewerSignSymbol: viewerSunSign.symbol,
                      partnerName: displayName,
                      partnerSignLabel: en ? sun.labelEn : sun.labelKa,
                      partnerSignSymbol: sun.symbol,
                      result: synastry,
                      verdict: en
                        ? overallVerdictEn(synastry.overall)
                        : overallVerdict(synastry.overall),
                      locale,
                    }
                  : undefined
                }
              />
            )}
          </section>
        )}

        {/* Recent activity — viewer-only since the feed list assumes a session */}
        {viewerId && recentPosts.length > 0 && (
          <section className="mt-10">
            <header className="mb-5 flex items-baseline justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  {en ? "Recent posts" : "ბოლო პოსტები"}
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {en ? `${displayName}'s feed` : `${displayName}-ის ფიდი`}
                </h2>
              </div>
              {ownerPostsCount > recentPosts.length && (
                <Link
                  href="/feed"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {en ? "View all in feed →" : "ფიდზე ნახე ყველა →"}
                </Link>
              )}
            </header>
            <FeedList
              initial={recentPosts}
              viewerId={viewerId}
              viewerIsAdmin={viewerIsAdmin}
              viewerSunSign={null}
              disablePagination
              locale={locale}
            />
          </section>
        )}

        {/* Soft CTA when viewer is anonymous */}
        {!viewerId && (
          <section className="mt-10 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/12 p-6 text-center backdrop-blur-xl ring-1 ring-foreground/5">
            <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
            <h2 className="text-xl font-semibold tracking-tight">
              {en ? "See your compatibility" : "ნახე თქვენი თავსებადობა"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {en
                ? `Create an account and compare your natal chart with ${displayName} across five areas.`
                : `დარეგისტრირდი — სანამ ${displayName}-ის ცის რუკა შენთან ხვდება, ჩვენ შენთვისაც ვითვლით თავსებადობას ხუთ სფეროში.`}
            </p>
            <Button asChild variant="mystic" size="lg" className="mt-5">
              <Link href="/signup">{en ? "Start free" : "დაიწყე უფასოდ"}</Link>
            </Button>
          </section>
        )}

        {/* Logged-in visitor without a chart (no profile yet) */}
        {viewerId && !synastry && !isOwner && (
          <section className="mt-10 rounded-2xl border border-border bg-card/65 p-6 text-center backdrop-blur-xl ring-1 ring-foreground/5">
            <h2 className="text-xl font-semibold tracking-tight">
              {en ? "To see your compatibility" : "თქვენი თავსებადობის სანახავად"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {en ? "Add your birth details first." : "ჯერ შეავსე დაბადების მონაცემები."}
            </p>
            <Button asChild variant="mystic" className="mt-4">
              <Link href="/onboarding">{en ? "Add details now" : "შეავსე ახლავე"}</Link>
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
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-2.5 py-1 text-xs">
      <span className="text-sm leading-none" style={{ color: accent }}>
        {glyph}
      </span>
      <span className="text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/**
 * Three-cell stat row (friends · posts · reputation). Numbers are
 * the headline — stacked above the label like Instagram / Threads —
 * with thin dividers between cells so the row reads as a single unit
 * rather than three loose words. Sits between the bio and the social
 * pills.
 */
function ProfileStats({
  friends,
  posts,
  locale,
}: {
  friends: number;
  posts: number;
  locale: "ka" | "en";
}) {
  return (
    <dl className="mt-5 inline-flex items-stretch divide-x divide-border/60 rounded-2xl border border-border/60 bg-card/35 px-1 backdrop-blur-xl">
      <Stat label={locale === "en" ? "Friends" : "მეგობრები"} value={friends} locale={locale} />
      <Stat label={locale === "en" ? "Posts" : "პოსტი"} value={posts} locale={locale} />
    </dl>
  );
}

function Stat({ label, value, locale }: { label: string; value: number; locale: "ka" | "en" }) {
  return (
    <div className="flex min-w-[68px] flex-col items-center gap-0.5 px-3 py-2 sm:min-w-[88px] sm:px-4">
      <dd className="text-base font-semibold tabular-nums leading-none text-foreground sm:text-lg">
        {Intl.NumberFormat(locale === "en" ? "en" : "ka-GE").format(value)}
      </dd>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}

/**
 * "X საერთო მეგობარი" pill with up to 4 overlapping avatar circles.
 * Only rendered when the count is > 0; positioned right under the
 * stats row so it reads as a social-proof signal.
 */
function MutualFriendsPill({
  count,
  preview,
  locale,
}: {
  count: number;
  preview: Array<{
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  }>;
  locale: "ka" | "en";
}) {
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
      {preview.length > 0 ? (
        <div className="flex -space-x-2">
          {preview.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.image || DEFAULT_AVATAR}
              alt=""
              className="size-5 rounded-full border border-background object-cover"
            />
          ))}
        </div>
      ) : (
        <Users className="size-3.5" />
      )}
      <span className="text-foreground/90">
        <span className="font-medium">{count}</span>{" "}
        {locale === "en" ? (count === 1 ? "mutual friend" : "mutual friends") : "საერთო მეგობარი"}
      </span>
    </div>
  );
}
