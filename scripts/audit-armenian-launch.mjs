#!/usr/bin/env node

import http from "node:http";
import https from "node:https";

/**
 * Runtime launch audit for the Armenian public site.
 *
 * Usage:
 *   npm run qa:armenian
 *   node scripts/audit-armenian-launch.mjs --origin=https://www.vividaastro.com
 *
 * The default targets the local app on port 3941 while sending the production
 * Host header, so proxy rewrites and host-aware metadata are exercised exactly
 * as they are in production. The audit is read-only.
 */

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=") || "true"];
  }),
);

const origin = args.get("origin") ?? "http://127.0.0.1:3941";
const concurrency = Math.max(1, Number(args.get("concurrency") ?? 10));
const localTarget = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(origin);
// Node's fetch implementation owns the HTTP Host header and may replace a
// caller-supplied value. The app intentionally prefers x-forwarded-host, so
// send both and make the local audit behave like Vercel's proxy chain.
const expectedSiteOrigin = "https://www.vividaastro.com";
const ARMENIAN_SCRIPT = /[\u0530-\u058f]/u;

const APP_PATH_PREFIXES = [
  "/account",
  "/admin",
  "/api/",
  "/ask",
  "/credits",
  "/dashboard",
  "/discover",
  "/feed",
  "/forgot-password",
  "/friends",
  "/library",
  "/login",
  "/messages",
  "/onboarding",
  "/people",
  "/report",
  "/reports",
  "/reset-password",
  "/signup",
  "/subscription",
  "/synastry",
  "/u/",
];

function fail(message) {
  failures.push(message);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)=(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = decodeXml(match[2] ?? match[3] ?? "");
  }
  return result;
}

function sitemapEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
    const block = match[1];
    const loc = decodeXml(block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "");
    const alternates = {};
    for (const tag of block.match(/<xhtml:link\b[^>]*>/g) ?? []) {
      const attrs = attributes(tag);
      if (attrs.hreflang && attrs.href) alternates[attrs.hreflang] = attrs.href;
    }
    return { loc, alternates };
  });
}

function htmlLinks(html) {
  const links = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    if (attrs.rel && attrs.href) links.push(attrs);
  }
  return links;
}

function htmlAnchors(html) {
  const hrefs = [];
  for (const tag of html.match(/<a\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    if (attrs.href) hrefs.push(attrs.href);
  }
  return [...new Set(hrefs)];
}

function normalizedUrl(value) {
  return value.endsWith("/") && value !== `${expectedSiteOrigin}/`
    ? value.slice(0, -1)
    : value;
}

function isAllowedArmenianHref(href) {
  if (
    !href.startsWith("/") ||
    href === "/am" ||
    href.startsWith("/am/") ||
    href.startsWith("/_next/")
  ) {
    return true;
  }
  return APP_PATH_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(prefix),
  );
}

function fetchPath(pathname, siteHost = "www.vividaastro.com") {
  const targetOrigin = localTarget
    ? origin
    : siteHost === "www.vivida.ge"
      ? "https://www.vivida.ge"
      : origin;
  const url = new URL(pathname, targetOrigin);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method: "GET",
      headers: localTarget
        ? { Host: siteHost, "x-forwarded-host": siteHost }
        : undefined,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve({
          ok: (response.statusCode ?? 500) >= 200 && (response.statusCode ?? 500) < 300,
          status: response.statusCode ?? 500,
          headers: {
            get(name) {
              const value = response.headers[name.toLowerCase()];
              return Array.isArray(value) ? value.join(", ") : value ?? null;
            },
          },
          async text() { return body; },
        });
      });
    });
    request.on("error", reject);
    request.end();
  });
}

async function mapConcurrent(items, worker) {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    async () => {
      while (next < items.length) {
        const index = next++;
        await worker(items[index], index);
      }
    },
  );
  await Promise.all(workers);
}

const failures = [];
const sitemapResponse = await fetchPath("/sitemap.xml");
if (!sitemapResponse.ok) {
  console.error(`FAIL sitemap returned ${sitemapResponse.status}`);
  process.exit(1);
}

const entries = sitemapEntries(await sitemapResponse.text());
const georgianSitemapResponse = await fetchPath("/sitemap.xml", "www.vivida.ge");
if (!georgianSitemapResponse.ok) {
  console.error(`FAIL Georgian sitemap returned ${georgianSitemapResponse.status}`);
  process.exit(1);
}
const georgianEntries = sitemapEntries(await georgianSitemapResponse.text());
const byLoc = new Map(
  [...entries, ...georgianEntries].map((entry) => [normalizedUrl(entry.loc), entry]),
);
const duplicates = entries
  .map((entry) => normalizedUrl(entry.loc))
  .filter((loc, index, all) => all.indexOf(loc) !== index);
for (const loc of new Set(duplicates)) fail(`duplicate sitemap URL: ${loc}`);

const armenianEntries = entries.filter((entry) =>
  normalizedUrl(entry.loc).startsWith(`${expectedSiteOrigin}/am`),
);

for (const entry of armenianEntries) {
  const self = normalizedUrl(entry.loc);
  if (normalizedUrl(entry.alternates["hy-AM"] ?? "") !== self) {
    fail(`${self}: sitemap hy-AM is not self-referential`);
  }
  for (const locale of ["en", "ka-GE"]) {
    const alternate = entry.alternates[locale];
    if (!alternate) continue;
    const reciprocal = byLoc.get(normalizedUrl(alternate));
    if (!reciprocal) {
      fail(`${self}: ${locale} alternate missing from sitemap: ${alternate}`);
      continue;
    }
    if (normalizedUrl(reciprocal.alternates["hy-AM"] ?? "") !== self) {
      fail(`${self}: ${locale} sitemap alternate is not reciprocal`);
    }
  }
}

let checkedPages = 0;
await mapConcurrent(armenianEntries, async (entry) => {
  const expectedUrl = normalizedUrl(entry.loc);
  const pathname = new URL(expectedUrl).pathname;
  let response;
  try {
    response = await fetchPath(pathname);
  } catch (error) {
    fail(`${pathname}: request failed (${error.message})`);
    return;
  }
  checkedPages += 1;
  if (response.status !== 200) {
    fail(`${pathname}: expected 200, received ${response.status}`);
    return;
  }
  if (response.headers.get("content-language") !== "hy") {
    fail(`${pathname}: Content-Language is not hy`);
  }

  const html = await response.text();
  if (!/<html\b[^>]*\blang=["']hy["']/i.test(html)) {
    fail(`${pathname}: <html lang="hy"> missing`);
  }
  if (!ARMENIAN_SCRIPT.test(html)) {
    fail(`${pathname}: no Armenian script found in rendered HTML`);
  }

  const links = htmlLinks(html);
  const canonical = links.find((link) => link.rel.toLowerCase() === "canonical")?.href;
  if (normalizedUrl(canonical ?? "") !== expectedUrl) {
    fail(`${pathname}: canonical mismatch (${canonical ?? "missing"})`);
  }
  const alternates = Object.fromEntries(
    links
      .filter((link) => link.rel.toLowerCase() === "alternate" && link.hreflang)
      .map((link) => [link.hreflang, link.href]),
  );
  if (normalizedUrl(alternates["hy-AM"] ?? "") !== expectedUrl) {
    fail(`${pathname}: HTML hy-AM hreflang mismatch`);
  }

  for (const href of htmlAnchors(html)) {
    if (!isAllowedArmenianHref(href)) {
      fail(`${pathname}: Armenian link escapes locale (${href})`);
    }
  }
});

const missingPath = "/am/__armenian_launch_qa_missing__";
const missingResponse = await fetchPath(missingPath);
const missingHtml = await missingResponse.text();
if (missingResponse.status !== 404) {
  fail(`${missingPath}: expected 404, received ${missingResponse.status}`);
}
if (missingResponse.headers.get("content-language") !== "hy") {
  fail(`${missingPath}: 404 Content-Language is not hy`);
}
if (!/<html\b[^>]*\blang=["']hy["']/i.test(missingHtml)) {
  fail(`${missingPath}: Armenian 404 lang is not hy`);
}
if (!ARMENIAN_SCRIPT.test(missingHtml)) {
  fail(`${missingPath}: Armenian 404 copy is missing`);
}
if (!/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(missingHtml)) {
  fail(`${missingPath}: 404 noindex metadata is missing`);
}
for (const href of htmlAnchors(missingHtml)) {
  if (!isAllowedArmenianHref(href)) {
    fail(`${missingPath}: Armenian 404 link escapes locale (${href})`);
  }
}

const wrongHostPath = "/am/zodiac/aries";
const wrongHostResponse = await fetchPath(wrongHostPath, "www.vivida.ge");
const expectedRedirect = `${expectedSiteOrigin}${wrongHostPath}`;
if (wrongHostResponse.status !== 308) {
  fail(`vivida.ge${wrongHostPath}: expected 308, received ${wrongHostResponse.status}`);
}
if (normalizedUrl(wrongHostResponse.headers.get("location") ?? "") !== expectedRedirect) {
  fail(
    `vivida.ge${wrongHostPath}: redirect mismatch (${wrongHostResponse.headers.get("location") ?? "missing"})`,
  );
}

console.log(`Armenian sitemap URLs: ${armenianEntries.length}`);
console.log(`Armenian pages checked: ${checkedPages}`);
console.log(`Total sitemap URLs: ${entries.length}`);
console.log(`Georgian sitemap URLs: ${georgianEntries.length}`);

if (failures.length) {
  console.error(`\nFAIL (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("PASS Armenian launch audit");
