export type VerifiedBadgeEntitlement = {
  isPremium: boolean;
  premiumUntil: Date | null;
  verifiedBadgeGrantedAt: Date | null;
};

/**
 * Identity badge entitlement shared by profiles, feed, comments and discovery.
 * A manual admin gift never grants paid product access; it only adds the badge.
 */
export function hasVerifiedBadge(
  user: VerifiedBadgeEntitlement,
  now: number = Date.now(),
): boolean {
  return Boolean(
    user.verifiedBadgeGrantedAt ||
      (user.isPremium &&
        user.premiumUntil &&
        user.premiumUntil.getTime() > now),
  );
}
