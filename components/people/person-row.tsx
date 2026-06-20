import Link from "next/link";

import type { PersonRow } from "@/lib/people";
import { FriendButton } from "@/components/profile/friend-button";

/**
 * Thin Facebook-style directory row: avatar, name + handle (+ short
 * bio), friend action on the right. Tap the row to open the profile;
 * the friend button stops propagation so the action doesn't leak into
 * a navigation.
 */
export function PersonRowCard({ person }: { person: PersonRow }) {
  const display =
    person.displayName ?? person.username ?? "ვარსკვლავო";
  const initial = display[0]?.toUpperCase() ?? "?";
  const profileHref = person.username ? `/u/${person.username}` : "#";

  return (
    <li className="rounded-2xl border border-foreground/10 bg-[oklch(0.21_0.04_285/0.85)] ring-1 ring-inset ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20 hover:bg-[oklch(0.24_0.04_285/0.9)]">
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <Link
          href={profileHref}
          className="shrink-0"
          aria-label={`${display}-ის პროფილი`}
        >
          {person.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.image}
              alt=""
              className="size-12 rounded-full border border-border/80 object-cover sm:size-14"
            />
          ) : (
            <div className="grid size-12 place-items-center rounded-full border border-border bg-card/60 text-sm text-muted-foreground sm:size-14">
              {initial}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-semibold text-foreground transition-colors hover:text-[var(--vivida-violet)]"
          >
            {display}
          </Link>
          <div className="truncate text-xs text-muted-foreground">
            @{person.username}
          </div>
          {person.bio && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-foreground/70">
              {person.bio}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <FriendButton
            targetUserId={person.id}
            targetUsername={person.username}
            initialStatus={person.friendship}
          />
        </div>
      </div>
    </li>
  );
}
