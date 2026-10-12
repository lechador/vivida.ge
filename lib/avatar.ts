/**
 * Default profile picture for users who haven't set one. A Vivida-style
 * cosmic star emblem, deliberately not a face or figure, so it reads as
 * neutral for everyone. Served as a static asset (one cached request no
 * matter how many photo-less users are on screen).
 *
 * Use `avatarSrc(user.image)` at every avatar render site instead of
 * branching on a null image; it guarantees we never fall back to a bare
 * initial again.
 */
export const DEFAULT_AVATAR = "/avatars/default.webp";

/** The user's picture, or the cosmic default when they have none. */
export function avatarSrc(image?: string | null): string {
  return image || DEFAULT_AVATAR;
}
