/**
 * Turn tall full-page mobile screenshots into reviewable contact sheets.
 * Splits vertically into up to 4 columns and lays them side by side.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const here = import.meta.dirname;
const dir = path.join(here, "shots");
const outDir = path.join(dir, "review");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg"));

const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const MAX_H = 7800;
const GAP = 10;

for (const file of files) {
  if (only && !only.test(file)) continue;
  const input = path.join(dir, file);
  const output = path.join(outDir, file);
  if (fs.existsSync(output)) {
    const a = fs.statSync(input).mtimeMs;
    const b = fs.statSync(output).mtimeMs;
    if (b > a) continue;
  }
  const img = sharp(input);
  const meta = await img.metadata();
  const w = meta.width ?? 390;
  const h = meta.height ?? 800;
  if (h <= MAX_H) {
    await sharp(input)
      .resize({ width: Math.min(w, 900) })
      .jpeg({ quality: 70 })
      .toFile(output);
    continue;
  }
  const cols = Math.min(5, Math.ceil(h / MAX_H));
  const colH = Math.ceil(h / cols);
  const composites = [];
  for (let i = 0; i < cols; i++) {
    const top = i * colH;
    const height = Math.min(colH, h - top);
    if (height <= 0) break;
    const buf = await sharp(input)
      .extract({ left: 0, top, width: w, height })
      .toBuffer();
    composites.push({ input: buf, left: i * (w + GAP), top: 0 });
  }
  const totalW = cols * w + (cols - 1) * GAP;
  const page = sharp({
    create: {
      width: totalW,
      height: colH,
      channels: 3,
      background: { r: 12, g: 8, b: 20 },
    },
  }).composite(composites);
  await page.jpeg({ quality: 68 }).toFile(output);
  console.log(`${file}: ${w}x${h} -> ${cols} cols ${totalW}x${colH}`);
}
