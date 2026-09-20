/**
 * AI zodiac avatar generator. Uses OpenRouter's Gemini 3.1 Flash Lite Image
 * ("Nano Banana 2 Lite") to render a brand-styled cosmic emblem for the user's
 * sun sign. Returns PNG bytes the caller stores in R2 and sets as the
 * user's main profile photo. Returns null when OPENROUTER_API_KEY is unset.
 */

import sharp from "sharp";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Nano Banana 2 Lite returns a base64 image data URL at
// choices[0].message.images[0].image_url.url
// when modalities includes "image".
const AVATAR_MODEL = "google/gemini-3.1-flash-lite-image";

/** Per-sign visual motif, in English, fed into the image prompt. */
const SIGN_MOTIF: Record<string, string> = {
  aries: "a ram with bold curved horns",
  taurus: "a powerful bull's head",
  gemini: "two mirrored celestial silhouettes evoking the twins",
  cancer: "a crab shell paired with a crescent moon",
  leo: "a majestic lion with a radiant sun-ray mane",
  virgo: "a graceful maiden holding a sheaf of wheat",
  libra: "a pair of perfectly balanced scales",
  scorpio: "a scorpion with a curved stinger tail",
  sagittarius: "an archer's bow with an arrow aimed skyward",
  capricorn: "a sea-goat — a goat with a flowing fish tail",
  aquarius: "a water-bearer pouring cosmic waves",
  pisces: "two fish circling each other",
};

export function isAvatarGenConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

interface ImageResponse {
  choices?: Array<{
    message?: { images?: Array<{ image_url?: { url?: string } }> };
  }>;
  error?: { message: string };
}

/**
 * Generate a square PNG cosmic emblem for the given sun-sign key
 * (e.g. "leo"). Throws on API/transport errors; returns null only when
 * the API key is missing.
 */
export async function generateZodiacAvatar(
  signKey: string,
): Promise<Buffer | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const motif = SIGN_MOTIF[signKey] ?? "an abstract zodiac constellation";
  const prompt =
    `Square 1:1 profile-picture avatar. A minimalist, elegant abstract emblem ` +
    `evoking the ${signKey} zodiac sign: ${motif}, formed from flowing ` +
    `celestial linework with a subtle constellation of stars, centered and ` +
    `symmetrical. Color palette STRICTLY limited to a luminous gradient of ` +
    `violet (#a78bfa), magenta-pink (#f472b6) and cyan (#22d3ee) glowing ` +
    `against a near-black deep indigo background (#0b0814). Soft luminous ` +
    `glow, modern, premium, dreamy cosmic mood. No text, no letters, no ` +
    `numbers, no human face, no watermark. Composition balanced for a ` +
    `circular crop — keep the emblem within the central circle.`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida avatar",
    },
    body: JSON.stringify({
      model: AVATAR_MODEL,
      modalities: ["image", "text"],
      image_config: { aspect_ratio: "1:1" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as ImageResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url || !url.startsWith("data:image")) {
    throw new Error("OpenRouter returned no image");
  }
  const b64 = url.split(",")[1] ?? "";
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length === 0) throw new Error("OpenRouter returned empty image");
  // Providers can return JPEG; the upload route stores avatars as image/png.
  return sharp(bytes).png().toBuffer();
}
