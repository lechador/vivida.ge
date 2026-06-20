/**
 * Central on/off switches for the density-dependent / higher-risk social
 * surfaces. These features only make sense at a healthy user density and
 * widen the safety surface (stranger discovery), so they ship OFF while the
 * user base is small. Flip a single env var per environment to re-enable —
 * no code change, nothing is deleted.
 *
 * Values are read from NEXT_PUBLIC_* env vars so both server components
 * (route guards) and client components (nav, dashboard rail, chat empty
 * state) see the same answer. Accepted "on" values: "1" or "true".
 *
 * NOTE: each env var is referenced as a *literal* `process.env.NEXT_PUBLIC_…`
 * — Next only inlines literal accesses into the client bundle, so a dynamic
 * `process.env[name]` lookup would silently read undefined on the client.
 */

function on(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

export const SOCIAL_FEATURES = {
  /** Tinder-style swipe/match deck at /discover. */
  swipeDeck: on(process.env.NEXT_PUBLIC_SOCIAL_SWIPE_DECK, false),
  /** Browsable public directory of all registered users at /people. */
  peopleDirectory: on(process.env.NEXT_PUBLIC_SOCIAL_PEOPLE_DIRECTORY, false),
  /** "Suggested people to add" rail on the dashboard. */
  suggestedPeopleRail: on(process.env.NEXT_PUBLIC_SOCIAL_SUGGESTED_PEOPLE, false),
} as const;

export type SocialFeature = keyof typeof SOCIAL_FEATURES;
