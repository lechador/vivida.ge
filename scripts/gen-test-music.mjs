// Generate the calm/mystic background track for the personality test via the
// ElevenLabs Music API, then compress it to a small looping-friendly mp3 at
// public/audio/test-ambient.mp3.
//
// Needs ELEVENLABS_API_KEY in .env.local (copy the value from Vercel).
// Usage: node scripts/gen-test-music.mjs
//
// One-time asset generation — the file is committed and served static; the
// browser loops it while the user takes the test.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing in .env.local — add it (copy from Vercel) and re-run.");
  process.exit(1);
}

const PROMPT =
  "Calm, mystic, meditative ambient music for deep concentration. Soft ethereal " +
  "synth pads, gentle celestial textures, subtle cosmic shimmer and distant chimes, " +
  "slow, hypnotic and spacious. No drums, no beat, no strong melody or vocals — an " +
  "unobtrusive, dreamy, tranquil soundscape for quietly taking a personality test. " +
  "Warm and otherworldly, seamless and continuous.";

const LENGTH_MS = 120000; // 2 minutes, looped in the browser

async function main() {
  console.log("composing music via ElevenLabs (music_v1, 120s)…");
  const res = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: {
      "xi-api-key": KEY,
      "Content-Type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      prompt: PROMPT,
      music_length_ms: LENGTH_MS,
      model_id: "music_v1",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`ElevenLabs ${res.status}: ${body.slice(0, 500)}`);
    process.exit(1);
  }

  const raw = Buffer.from(await res.arrayBuffer());
  const outDir = new URL("../public/audio/", import.meta.url);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const tmp = new URL("../public/audio/_test-ambient-raw.mp3", import.meta.url);
  writeFileSync(tmp, raw);
  console.log(`raw: ${Math.round(raw.length / 1024)}kb`);

  const out = new URL("../public/audio/test-ambient.mp3", import.meta.url);
  try {
    // Compress to a small stereo 96kbps mp3, normalized, with tiny fades so the
    // loop seam is soft.
    execFileSync("ffmpeg", [
      "-y", "-i", tmp.pathname,
      "-af", "loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:st=0:d=1.2",
      "-b:a", "96k", "-ac", "2",
      out.pathname,
    ], { stdio: "ignore" });
    const size = readFileSync(out).length;
    console.log(`done → public/audio/test-ambient.mp3 (${Math.round(size / 1024)}kb)`);
  } catch {
    // ffmpeg unavailable — ship the raw file as-is.
    writeFileSync(out, raw);
    console.log("ffmpeg not available; wrote raw mp3 to public/audio/test-ambient.mp3");
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
