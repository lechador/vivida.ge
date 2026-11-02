/**
 * Build the mobile-audit route inventory.
 *
 * - Every static App Router page is included.
 * - Every dynamic template gets up to 3 sample URLs harvested from
 *   /sitemap.xml, assigned to the MOST SPECIFIC matching template, plus
 *   manual fallbacks for authed / non-indexed routes.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../..");
const sitemap = fs.readFileSync("/tmp/sitemap.xml", "utf8");

const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace("https://www.vivida.ge", ""))
  .map((p) => (p === "" ? "/" : p));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "page.tsx") out.push(full);
  }
  return out;
}

const patterns = walk(path.join(root, "app"))
  .map((file) => {
    const rel = path.relative(path.join(root, "app"), path.dirname(file));
    let url =
      "/" +
      rel
        .split(path.sep)
        .filter((s) => !s.startsWith("("))
        .join("/");
    if (url === "/." || url === "/") url = "/";
    return url;
  })
  .filter((p) => !p.startsWith("/api") && !p.includes("_fonts"))
  .sort();

function staticSegments(pattern) {
  return pattern.split("/").filter((s) => s && !s.startsWith("[")).length;
}

function compile(pattern) {
  const regex = new RegExp(
    "^" +
      pattern
        .split("/")
        .map((seg) => {
          if (!seg) return "";
          if (seg.startsWith("[")) return "([^/]+)";
          return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/") +
      "/?$",
  );
  return { regex, specificity: staticSegments(pattern) };
}

const compiled = patterns.map((pattern) => ({ pattern, ...compile(pattern) }));

// Representative manual samples for dynamic templates the sitemap does not
// cover (authed surfaces) or where we want a guaranteed param set.
const MANUAL_SAMPLES = {
  "/zodiac/[sign]": ["aries", "gemini"],
  "/zodiac/[sign]/[slug]": ["aries/2026", "aries/dghes"],
  "/zodiac/amomavali/[sign]": ["aries"],
  "/zodiac/mtvare/[sign]": ["aries"],
  "/zodiac/elementebi/[element]": ["fire"],
  "/zodiac/reitingebi/[topic]": ["tavsebadi"],
  "/zodiac/tavsebadoba/[pair]": ["aries-aries", "aries-gemini"],
  "/taro/[card]": ["the-fool"],
  "/mbti/[type]": ["intj"],
  "/planetebi/[planet]": ["mze"],
  "/astrologiuri-saxlebi/[number]": ["1"],
  "/angeluri-ricxvebi/[number]": ["111"],
  "/numerologia/[number]": ["7"],
  "/chinuri-horoskopi/[animal]": ["dragon"],
  "/sizmris-akhsna/[symbol]": ["gveli"],
  "/dabnelebebi/[slug]": ["2026-08-12-mzis-sruli-dabneleba"],
  "/emociuri-inteleqti/[slug]": ["ra-aris-emociuri-inteleqti"],
  "/articles/[slug]": ["piradi-sivrce-urtiertobashi"],
  "/astrologiuri-kalendari/[date]": ["2026-11-01"],
  "/savse-mtvare/[date]": ["2026-11-24"],
  "/akhali-mtvare/[date]": ["2026-11-09"],
  "/finansuri-horoskopi/[sign]": ["aries"],
  "/karieris-horoskopi/[sign]": ["aries"],
  "/siyvarulis-horoskopi/[sign]": ["aries"],
  // Authed / non-indexed detail routes, hit while signed out on purpose:
  // verifies the redirect + login gate renders correctly on mobile.
  "/r/[id]": ["sample"],
  "/test-results/[id]": ["sample"],
  "/u/[username]": ["vivida"],
  "/relationship/invite/[token]": ["sample"],
  "/big-five/shedegi/[id]": ["sample"],
  "/eq-testi/shedegi/[id]": ["sample"],
  "/iq-testi/shedegi/[id]": ["sample"],
  "/library/[id]": ["sample"],
  "/reports/[id]": ["sample"],
  "/feed/[postId]": ["sample"],
  "/synastry/[id]": ["sample"],
};

function substitute(pattern, value) {
  const values = value.split("/");
  let i = 0;
  return pattern
    .replace(/^\//, "")
    .split("/")
    .map((seg) => (seg.startsWith("[") ? values[i++] : seg))
    .join("/");
}

/** Assign each sitemap URL to the most specific template that matches it. */
const byPattern = new Map();
for (const url of sitemapPaths) {
  let best = null;
  for (const item of compiled) {
    if (!item.regex.test(url)) continue;
    if (
      !best ||
      item.specificity > best.specificity ||
      (item.specificity === best.specificity &&
        item.pattern.split("[").length < best.pattern.split("[").length)
    ) {
      best = item;
    }
  }
  if (!best) continue;
  const list = byPattern.get(best.pattern) ?? [];
  list.push(url);
  byPattern.set(best.pattern, list);
}

const inventory = [];
const seen = new Set();
function add(url, pattern, dynamic) {
  if (seen.has(url)) return;
  seen.add(url);
  inventory.push({ url, pattern, dynamic });
}

for (const pattern of patterns) {
  if (pattern.startsWith("/en/") && pattern.split("/").length === 3) continue;
  const isDynamic = pattern.includes("[");
  const sitemapSamples = byPattern.get(pattern) ?? [];
  const manual = MANUAL_SAMPLES[pattern];
  let samples = [];

  if (!isDynamic) {
    samples = [pattern];
  } else {
    // Prefer hands-picked params where we have them (deterministic detail
    // pages), then fill from the sitemap.
    const manualUrls = (manual ?? []).map((v) => "/" + substitute(pattern, v));
    samples = [...manualUrls, ...sitemapSamples].slice(0, 3);
    if (samples.length === 0) {
      console.warn("NO SAMPLE:", pattern);
      continue;
    }
  }

  for (const url of samples) add(url, pattern, isDynamic);
}

// English tree pages (served from app/en in this shared tree).
for (const page of walk(path.join(root, "app", "en"))) {
  const rel = path.relative(path.join(root, "app", "en"), path.dirname(page));
  const url = rel ? `/en/${rel.split(path.sep).join("/")}` : "/en";
  add(url, url, false);
}

inventory.sort((a, b) => a.url.localeCompare(b.url));
fs.writeFileSync(
  path.join(import.meta.dirname, "routes.json"),
  JSON.stringify(inventory, null, 2),
);
console.log(`wrote ${inventory.length} routes`);
