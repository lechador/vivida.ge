import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "public", "pwa");

function iconSvg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="55%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" fill="#0d0a1a"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)">
    <circle cx="32" cy="32" r="28" fill="url(#halo)"/>
    <path d="M 32 6 L 36 28 L 58 32 L 36 36 L 32 58 L 28 36 L 6 32 L 28 28 Z" fill="url(#g)"/>
    <circle cx="32" cy="32" r="3" fill="#ffffff" fill-opacity="0.85"/>
    <path d="M 50 12 L 51 16 L 55 17 L 51 18 L 50 22 L 49 18 L 45 17 L 49 16 Z" fill="#22d3ee" fill-opacity="0.9"/>
  </g>
</svg>`;
}

await mkdir(output, { recursive: true });
for (const size of [192, 512]) {
  await sharp(Buffer.from(iconSvg(0.88)))
    .resize(size, size)
    .png()
    .toFile(path.join(output, `icon-${size}.png`));
  await sharp(Buffer.from(iconSvg(0.72)))
    .resize(size, size)
    .png()
    .toFile(path.join(output, `icon-maskable-${size}.png`));
}
await sharp(Buffer.from(iconSvg(0.88)))
  .resize(180, 180)
  .png()
  .toFile(path.join(root, "app", "apple-icon.png"));
await writeFile(
  path.join(output, "SOURCE.md"),
  "Generated from the existing Vivida star mark. Run `node scripts/generate-pwa-icons.mjs` after changing the SVG geometry in that script. The maskable mark is scaled to the central safe zone and every PNG has an opaque dark background.\n",
);
