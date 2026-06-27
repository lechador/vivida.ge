/**
 * Audio-horoscope voice registry — pure data, safe to import from client
 * components (no fetch / Buffer / env). The ElevenLabs synthesis lives in
 * lib/elevenlabs.ts (server-only).
 *
 * Georgian renders acceptably only on eleven_v3; these voices were chosen for
 * that. The `slug` is what's persisted (users.horoscopeVoice + R2 key).
 */

export type HoroscopeVoice = {
  slug: string;
  labelKa: string;
  descKa: string;
  /** ElevenLabs voice id (not secret). */
  voiceId: string;
};

export const HOROSCOPE_VOICES: HoroscopeVoice[] = [
  { slug: "jessica", labelKa: "ჯესიკა", descKa: "თბილი, ნათელი ქალის ხმა", voiceId: "cgSgspJ2msm6clMCkdW9" },
  { slug: "sarah", labelKa: "სარა", descKa: "მშვიდი, დამამშვიდებელი ქალის ხმა", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  { slug: "george", labelKa: "ჯორჯი", descKa: "თბილი მამრობითი, მთხრობელი", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
];

export const DEFAULT_VOICE_SLUG = "jessica";

export function voiceBySlug(slug: string | null | undefined): HoroscopeVoice {
  return (
    HOROSCOPE_VOICES.find((v) => v.slug === slug) ??
    HOROSCOPE_VOICES.find((v) => v.slug === DEFAULT_VOICE_SLUG) ??
    HOROSCOPE_VOICES[0]
  );
}

export function isValidVoiceSlug(slug: string): boolean {
  return HOROSCOPE_VOICES.some((v) => v.slug === slug);
}
