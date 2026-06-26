/**
 * ElevenLabs text-to-speech for audio horoscopes (server-only).
 *
 * Georgian is only supported by the `eleven_v3` model (multilingual_v2 etc.
 * don't list `ka` and sound broken), so we pin v3. Generation is relatively
 * slow + costly, so callers cache the resulting MP3 in R2 and reuse it.
 *
 * Voice data lives in lib/horoscope-voices.ts (client-safe) and is re-exported
 * here for server callers' convenience.
 */

export {
  HOROSCOPE_VOICES,
  DEFAULT_VOICE_SLUG,
  voiceBySlug,
  isValidVoiceSlug,
  type HoroscopeVoice,
} from "./horoscope-voices";

const TTS_MODEL = "eleven_v3";
const API_BASE = "https://api.elevenlabs.io/v1";

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Synthesize Georgian speech for `text` with the given ElevenLabs voice id.
 * Returns the MP3 bytes. Throws on API error. ~5-20s on eleven_v3.
 */
export async function generateSpeech(
  text: string,
  voiceId: string
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not configured");

  const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: TTS_MODEL,
      voice_settings: { stability: 0.5, use_speaker_boost: true },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
