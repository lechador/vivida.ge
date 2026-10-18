// Generate the 16 Astro-MBTI type characters, original Vivida-style low-poly
// avatars (NOT copies of 16Personalities' art) via Nano Banana 2 Lite on
// Vertex (Google credits). Each is resized to a compact webp in public/mbti/.
//
// Usage:
//   node --import tsx scripts/gen-mbti-characters.mjs                → all missing
//   node --import tsx scripts/gen-mbti-characters.mjs --force        → regenerate all
//   node --import tsx scripts/gen-mbti-characters.mjs --only=INFP,INTJ

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const MODEL = "gemini-3.1-flash-lite-image";
const OUT = new URL("../public/mbti/", import.meta.url);
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg
  ? onlyArg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.toUpperCase())
  : null;

const STYLE =
  "Original low-poly geometric flat-vector character illustration, faceted " +
  "polygonal shading, a single full-body stylized character centered in frame, " +
  "plain soft lavender background with a subtle radial glow, dark violet and " +
  "muted mauve color palette with a bright cyan accent light, modern, minimal, " +
  "friendly, clean, no text, no words, no logos, no border. Subject: ";

// Original, personality-appropriate poses/props for each type (no real people).
const SUBJECTS = {
  // Analysts
  INTJ: "a calm, confident strategist standing tall, holding a glowing blueprint scroll.",
  INTP: "a curious thinker, hand on chin, surrounded by floating holographic geometric shapes and equations.",
  ENTJ: "a decisive commander standing at a podium, one arm raised mid-gesture, bold and authoritative.",
  ENTP: "an animated debater mid-argument, gesturing with a spark of a glowing idea above the hand, playful smirk.",
  // Diplomats
  INFJ: "a serene visionary holding a softly glowing lantern, gentle and thoughtful.",
  INFP: "a gentle dreamer holding a single glowing flower, peaceful, eyes softly closed.",
  ENFJ: "a warm, inspiring mentor with open, welcoming arms, guiding and uplifting.",
  ENFP: "a joyful, energetic person leaping with a burst of glowing sparkles around them.",
  // Sentinels
  ISTJ: "a meticulous, upright figure holding a clipboard with a checklist, composed and dependable.",
  ISFJ: "a caring protector holding a glowing shield close, gentle and steady.",
  ESTJ: "an authoritative organizer standing with hands on hips beside a briefcase, in charge.",
  ESFJ: "a warm host offering a small glowing gift on an open palm, welcoming and social.",
  // Explorers
  ISTP: "a hands-on maker crouching, holding a glowing wrench, focused and practical.",
  ISFP: "an expressive artist holding a glowing paintbrush and a palette, gentle and creative.",
  ESTP: "a bold, dynamic person mid-stride in a confident action pose, adventurous.",
  ESFP: "a lively entertainer on a small stage, arms thrown up under a warm spotlight, holding a microphone.",
};

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  // Nano Banana 2 Lite is available through Vertex's global endpoint.
  location: "global",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function genOne(type) {
  // The image model has a tight per-minute quota, retry 429s with backoff.
  let lastErr;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: STYLE + SUBJECTS[type],
        config: { responseModalities: ["IMAGE"] },
      });
      const part = (res?.candidates?.[0]?.content?.parts || []).find(
        (p) => p.inlineData?.data,
      );
      if (!part) throw new Error("no image returned");
      const png = Buffer.from(part.inlineData.data, "base64");
      const webp = await sharp(png)
        .resize(640, 640, { fit: "inside" })
        .webp({ quality: 82 })
        .toBuffer();
      writeFileSync(new URL(`${type.toLowerCase()}.webp`, OUT), webp);
      return webp.length;
    } catch (e) {
      lastErr = e;
      if (!/429|exhausted|quota|RESOURCE/i.test(e.message)) throw e;
      await sleep(30_000);
    }
  }
  throw lastErr;
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT)
    throw new Error("GOOGLE_CLOUD_PROJECT missing");
  let types = Object.keys(SUBJECTS);
  if (only) types = types.filter((t) => only.includes(t));
  if (!force)
    types = types.filter(
      (t) => !existsSync(new URL(`${t.toLowerCase()}.webp`, OUT)),
    );

  console.log(`generating ${types.length}: ${types.join(", ") || "(none)"}`);
  let ok = 0,
    fail = 0;
  // Sequential + spacing to respect the image model's per-minute quota.
  for (const t of types) {
    try {
      const bytes = await genOne(t);
      ok++;
      console.log(`  ✓ ${t} (${Math.round(bytes / 1024)}kb)`);
    } catch (e) {
      fail++;
      console.log(`  ✗ ${t}: ${e.message.slice(0, 120)}`);
    }
    await sleep(8_000);
  }
  console.log(`done: ${ok} generated, ${fail} failed`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
