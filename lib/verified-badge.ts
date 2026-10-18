export function hasVerifiedBadge(user?: {
  emailVerified?: Date | string | null;
  phoneVerifiedAt?: Date | string | null;
  isVerified?: boolean | null;
} | null): boolean {
  if (!user) return false;
  return Boolean(user.isVerified || user.phoneVerifiedAt || user.emailVerified);
}
