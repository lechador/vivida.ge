import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Read a TTF as an ArrayBuffer for next/og.
 *
 * Vercel's Node runtime supports `fetch()` over HTTP(S) but not over
 * `file://`, so the next/og-suggested `fetch(new URL(..., import.meta.url))`
 * pattern fails in production with `Error: not implemented`. Reading
 * from disk via fs.readFile sidesteps that.
 *
 * IMPORTANT: callers must construct the URL inline with a STATIC
 * relative path (`new URL("./literal.ttf", import.meta.url)`) so
 * Webpack can trace the reference at build time and copy the asset
 * into the function bundle. Passing a dynamic path through this
 * helper would silently fail to bundle the .ttf.
 */
export async function readFontBuffer(url: URL): Promise<ArrayBuffer> {
  const filePath = fileURLToPath(url);
  const buf = await readFile(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
