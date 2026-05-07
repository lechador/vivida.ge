/**
 * Client-safe types + constants for the dashboard "ცის ბანქო" card.
 *
 * The actual builder (`buildCosmicCard`) lives in
 * `lib/cosmic-cards-server.ts` because it touches the DB. Keeping the
 * shared types here means the client component can import them without
 * dragging the server bundle along.
 */

export type CosmicCardTilt = "harmonic" | "challenging" | "balanced";

export type CosmicCard = {
  /** Tone label that drives accent color in the UI. */
  tilt: CosmicCardTilt;
  emoji: string;
  /** Small caption above the body — e.g. "მთვარე სასწორში · ჰარმონიული დღე". */
  caption: string;
  /** Main message — 1-2 sentences. */
  body: string;
  /** Where the message came from, for telemetry / debug. */
  source: "ai" | "compute" | "fallback";
  /** Optional one-line advice on top of the body (AI path only). */
  advice?: string;
  /** Moon sign in Georgian if known. */
  moonSignKa: string | null;
};

export const COSMIC_TILT_COLOR: Record<CosmicCardTilt, string> = {
  harmonic: "oklch(0.78 0.18 200)", // cyan
  challenging: "oklch(0.72 0.22 350)", // pink
  balanced: "oklch(0.65 0.24 305)", // violet
};
