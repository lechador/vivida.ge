export type SocialFeature =
  | "swipeDeck"
  | "peopleDirectory"
  | "suggestedPeopleRail";

export const SOCIAL_FEATURES: Record<SocialFeature, boolean> = {
  swipeDeck: false,
  peopleDirectory: false,
  suggestedPeopleRail: false,
};
