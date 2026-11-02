/**
 * Mobile responsiveness sweep for the Vivida app.
 *
 * Usage:
 *   node audit/2026-11-01/mobile/sweep.mjs --widths=390,320 --concurrency=3
 *   node audit/2026-11-01/mobile/sweep.mjs --filter=zodiac --widths=390 --limit=5
 *
 * Writes results-<width>.json and full-page JPEGs to shots/.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const here = import.meta.dirname;
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, ...rest] = arg.replace(/^--/, "").split("=");
    return [k, rest.join("=")];
  }),
);

const BASE = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3100";
const WIDTHS = (args.widths ?? "390").split(",").map(Number);
const HEIGHTS = {
  390: 844,
  360: 780,
  320: 568,
  414: 896,
  768: 1024,
  1024: 768,
  1280: 900,
};
const CONCURRENCY = Number(args.concurrency ?? 3);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const FILTER = args.filter ? new RegExp(args.filter) : null;
const SHOTS = args.shots !== "false";
const SETTLE = Number(args.settle ?? 900);

const ROUTES_FILE = path.resolve(here, args.routes ?? "routes.json");
const LABEL = args.label ? `-${args.label}` : "";
const COOKIES = args.cookies
  ? JSON.parse(fs.readFileSync(path.resolve(here, args.cookies), "utf8"))
  : [];
const FROM = args.from ? Number(args.from) : 0;
const TO = args.to ? Number(args.to) : Infinity;
const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"))
  .filter((r) => !FILTER || FILTER.test(r.url) || FILTER.test(r.pattern))
  .slice(FROM, TO)
  .slice(0, LIMIT);

const shotsDir = path.join(here, "shots");
fs.mkdirSync(shotsDir, { recursive: true });

function slugify(url) {
  if (url === "/") return "home";
  return url
    .replace(/^\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+$/, "");
}

const DEV_NOISE =
  /_next\/hmr|WebSocket|Download the React DevTools|Failed to load resource: the server responded with a status of 404 \(Not Found\)/i;

async function collectMetrics(page, vw, vh) {
  return page.evaluate(
    ({ vw, vh }) => {
      const de = document.documentElement;
      const body = document.body;
      const out = {
        viewportMeta:
          document
            .querySelector('meta[name="viewport"]')
            ?.getAttribute("content") ?? null,
        doc: {
          clientWidth: de.clientWidth,
          scrollWidth: de.scrollWidth,
          scrollHeight: de.scrollHeight,
          scrollX: window.scrollX,
          bodyPaddingBottom: getComputedStyle(body).paddingBottom,
        },
        horizontalScroll: 0,
        underlyingScrollWidth: 0,
        overflowOffenders: [],
        clippedText: [],
        smallTapTargets: [],
        mediumTapTargets: [],
        inputZoom: [],
        tinyText: [],
        wideImages: [],
        fixedOverlays: [],
        horizontalScrollers: [],
        coveredControls: [],
        tabBar: null,
      };

      function cssPath(el) {
        if (!el || el.nodeType !== 1) return "";
        if (el.id) return "#" + CSS.escape(el.id);
        const parts = [];
        let node = el;
        while (node && node.nodeType === 1 && parts.length < 5) {
          let sel = node.tagName.toLowerCase();
          const cls = [...node.classList]
            .filter((c) => !c.includes(":") && c.length < 40)
            .slice(0, 2);
          if (cls.length) sel += "." + cls.map((c) => CSS.escape(c)).join(".");
          const parent = node.parentElement;
          if (parent) {
            const siblings = [...parent.children].filter(
              (c) => c.tagName === node.tagName,
            );
            if (siblings.length > 1)
              sel += `:nth-of-type(${siblings.indexOf(node) + 1})`;
          }
          parts.unshift(sel);
          if (node.id) break;
          node = node.parentElement;
        }
        return parts.join(" > ");
      }

      function visible(el) {
        if (!el || el.nodeType !== 1) return false;
        const cs = getComputedStyle(el);
        if (
          cs.display === "none" ||
          cs.visibility === "hidden" ||
          Number(cs.opacity) === 0 ||
          cs.contentVisibility === "hidden"
        )
          return false;
        if (el.closest('[aria-hidden="true"]')) return false;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || r.width <= 1) return false;
        return true;
      }

      function clippingAncestors(el) {
        const clips = [];
        let node = el.parentElement;
        while (node && node !== de) {
          const cs = getComputedStyle(node);
          if (["hidden", "clip"].includes(cs.overflowX)) {
            const r = node.getBoundingClientRect();
            if (r.width > 2 && r.height > 2)
              clips.push({ rect: r, path: cssPath(node), scroll: false });
          } else if (["auto", "scroll"].includes(cs.overflowX)) {
            const r = node.getBoundingClientRect();
            if (r.width > 2 && r.height > 2)
              clips.push({ rect: r, path: cssPath(node), scroll: true });
          }
          node = node.parentElement;
        }
        return clips;
      }

      // 1. Real horizontal scrolling (body clips overflow, so try to scroll).
      const before = window.scrollX;
      window.scrollTo(99999, window.scrollY);
      out.horizontalScroll = Math.max(0, window.scrollX - before);
      window.scrollTo(before, window.scrollY);

      // 2. Underlying overflow with the body clip temporarily removed.
      const prevHtml = de.style.overflowX;
      const prevBody = body.style.overflowX;
      de.style.overflowX = "visible";
      body.style.overflowX = "visible";
      out.underlyingScrollWidth = Math.max(
        0,
        Math.max(de.scrollWidth, body.scrollWidth) - de.clientWidth,
      );

      const all = [...document.querySelectorAll("body *")];
      const rects = new Map();
      for (const el of all) {
        const r = el.getBoundingClientRect();
        rects.set(el, r);
        if (r.width <= 0 || r.height <= 0) continue;
        if (!visible(el)) continue;

        const beyond = Math.max(r.right - vw, -r.left);
        if (beyond <= 1) continue;

        const isFixed = getComputedStyle(el).position === "fixed";
        const inScroller = [...clippingAncestors(el)].some((c) => c.scroll);
        const text = (el.innerText ?? "").replace(/\s+/g, " ").trim();
        const tag = el.tagName;
        const meaningful =
          text ||
          ["IMG", "VIDEO", "CANVAS", "IFRAME", "TABLE", "PRE", "CODE"].includes(
            tag,
          ) ||
          el.querySelector("img,video,canvas,iframe");
        if (!meaningful) continue;
        if (text.length > 160) continue;

        out.overflowOffenders.push({
          selector: cssPath(el),
          tag,
          beyond: Math.round(beyond),
          width: Math.round(r.width),
          left: Math.round(r.left),
          right: Math.round(r.right),
          fixed: isFixed,
          inScroller,
          text: text.slice(0, 80),
        });
      }

      de.style.overflowX = prevHtml;
      body.style.overflowX = prevBody;

      out.overflowOffenders.sort((a, b) => b.beyond - a.beyond);
      out.overflowOffenders = out.overflowOffenders.slice(0, 15);

      // 3. Text nodes that are actually cut off by the viewport or a clip
      //    ancestor. Text inside a horizontal scroller is intentionally
      //    off-screen, so it is skipped.
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return 3;
          const p = node.parentElement;
          if (!p) return 3;
          if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION|TITLE)$/.test(p.tagName))
            return 3;
          if (p.closest('[aria-hidden="true"]')) return 3;
          return 1;
        },
      });
      const textSeen = new Set();
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (out.clippedText.length >= 15) break;
        const parent = textNode.parentElement;
        if (!visible(parent)) continue;
        const cs = getComputedStyle(parent);
        if (
          cs.textOverflow === "ellipsis" ||
          (cs.webkitLineClamp && cs.webkitLineClamp !== "none")
        )
          continue;
        const clips = clippingAncestors(parent);
        if (clips.some((c) => c.scroll)) continue;
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const rect = range.getBoundingClientRect();
        range.detach?.();
        if (rect.width <= 0 || rect.height <= 0) continue;
        // Skip visually hidden (sr-only) text.
        if (rect.width <= 2 || rect.height <= 2) continue;

        const outsideViewport = rect.right > vw + 1 || rect.left < -1;
        const outsideClip = clips.find(
          (c) => rect.right > c.rect.right + 1 || rect.left < c.rect.left - 1,
        );
        if (!outsideViewport && !outsideClip) continue;

        const snippet = (textNode.nodeValue ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80);
        const key = `${cssPath(parent)}|${snippet}`;
        if (textSeen.has(key)) continue;
        textSeen.add(key);
        out.clippedText.push({
          selector: cssPath(parent),
          tag: parent.tagName,
          text: snippet,
          right: Math.round(rect.right),
          left: Math.round(rect.left),
          clip: outsideClip?.path ?? "viewport",
          scrollableClip: Boolean(outsideClip?.scroll),
        });
      }

      // 4. Tap targets.
      const interactive = [
        ...document.querySelectorAll(
          'a[href], button, [role="button"], [role="link"], [role="tab"], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])',
        ),
      ];
      for (const el of interactive) {
        if (!visible(el)) continue;
        if (el.matches(':disabled, [aria-disabled="true"]')) continue;
        if (
          el.tagName === "INPUT" &&
          /^(checkbox|radio|range|file|color|hidden)$/.test(el.type)
        )
          continue;
        const r = el.getBoundingClientRect();
        // Inline text links inside running copy are exempt from target-size.
        const inProse = Boolean(el.closest("p, li, td, .prose, article"));
        const inlineTextLink =
          inProse &&
          el.tagName === "A" &&
          getComputedStyle(el).display.startsWith("inline");
        if (inlineTextLink) continue;
        const size = Math.round(Math.min(r.width, r.height));
        const label = (
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          el.innerText ||
          el.getAttribute("placeholder") ||
          el.getAttribute("name") ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60);
        const entry = {
          selector: cssPath(el),
          tag: el.tagName,
          w: Math.round(r.width),
          h: Math.round(r.height),
          size,
          label,
        };
        if (size < 24) out.smallTapTargets.push(entry);
        else if (size < 44) out.mediumTapTargets.push(entry);
      }
      out.smallTapTargets.sort((a, b) => a.size - b.size);
      out.mediumTapTargets.sort((a, b) => a.size - b.size);
      out.smallTapTargets = out.smallTapTargets.slice(0, 15);
      out.mediumTapTargets = out.mediumTapTargets.slice(0, 15);

      // 5. iOS focus zoom: text inputs below 16px.
      const fields = [
        ...document.querySelectorAll(
          'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"]):not([type="file"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="color"]), select, textarea',
        ),
      ];
      for (const el of fields) {
        if (!visible(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) {
          out.inputZoom.push({
            selector: cssPath(el),
            type: el.getAttribute("type") || el.tagName.toLowerCase(),
            fontSize: fs,
            placeholder:
              el.getAttribute("placeholder") || el.getAttribute("name") || "",
          });
        }
      }
      out.inputZoom = out.inputZoom.slice(0, 10);

      // 6. Very small text (readability).
      const textEls = [
        ...document.querySelectorAll(
          "p,span,div,li,a,button,label,small,h1,h2,h3,h4,h5,h6,td,th,time",
        ),
      ];
      const tinySeen = new Set();
      for (const el of textEls) {
        if (out.tinyText.length >= 10) break;
        if (!visible(el)) continue;
        if (!el.innerText || !el.innerText.trim()) continue;
        if (el.querySelector("p,div,li")) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs >= 12) continue;
        const key = cssPath(el);
        if (tinySeen.has(key)) continue;
        tinySeen.add(key);
        out.tinyText.push({
          selector: key,
          fontSize: fs,
          text: el.innerText.replace(/\s+/g, " ").trim().slice(0, 60),
        });
      }

      // 7. Images wider than the viewport.
      for (const img of document.querySelectorAll(
        "img, video, canvas, iframe",
      )) {
        if (!visible(img)) continue;
        const r = img.getBoundingClientRect();
        if (r.right > vw + 1 || r.width > vw + 1) {
          out.wideImages.push({
            selector: cssPath(img),
            tag: img.tagName,
            width: Math.round(r.width),
            right: Math.round(r.right),
            src: (img.getAttribute("src") ?? "").slice(0, 100),
          });
        }
      }
      out.wideImages = out.wideImages.slice(0, 10);

      // 8. Fixed overlays.
      const fixedEls = all.filter(
        (el) => visible(el) && getComputedStyle(el).position === "fixed",
      );
      for (const el of fixedEls.slice(0, 12)) {
        const r = el.getBoundingClientRect();
        out.fixedOverlays.push({
          selector: cssPath(el),
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          zIndex: getComputedStyle(el).zIndex,
          text: (el.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 50),
        });
      }

      // 9. Horizontal scrollers and whether the scroller itself fits.
      for (const el of all) {
        const cs = getComputedStyle(el);
        if (!["auto", "scroll"].includes(cs.overflowX)) continue;
        if (el.scrollWidth <= el.clientWidth + 2) continue;
        const r = el.getBoundingClientRect();
        out.horizontalScrollers.push({
          selector: cssPath(el),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          rectWidth: Math.round(r.width),
          overflowsViewport: r.width > vw + 1,
        });
      }
      out.horizontalScrollers = out.horizontalScrollers.slice(0, 10);

      // 10. Controls covered by a fixed overlay (tap swallowed).
      const center = interactive.filter((el) => visible(el)).slice(0, 120);
      for (const el of center) {
        if (out.coveredControls.length >= 10) break;
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > vw || y > vh) continue;
        const hit = document.elementFromPoint(x, y);
        if (!hit || hit === el || el.contains(hit) || hit.contains(el))
          continue;
        const fixedHit = hit.closest(
          '*[style*="position: fixed"], [class*="fixed"]',
        );
        // Resolve real position, class names are not enough.
        let node = hit;
        let covered = false;
        while (node && node !== de) {
          if (getComputedStyle(node).position === "fixed") {
            covered = true;
            break;
          }
          node = node.parentElement;
        }
        if (!covered && !fixedHit) continue;
        out.coveredControls.push({
          control: cssPath(el),
          controlLabel: (el.getAttribute("aria-label") || el.innerText || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 50),
          coveredBy: cssPath(node ?? hit),
        });
      }

      // 11. Mobile tab bar clearance.
      const bar = document.querySelector("[data-mobile-tab-bar]");
      if (bar) {
        const r = bar.getBoundingClientRect();
        const bodyPad = parseFloat(getComputedStyle(body).paddingBottom) || 0;
        out.tabBar = {
          height: Math.round(r.height),
          top: Math.round(r.top),
          bodyPaddingBottom: Math.round(bodyPad),
          sufficient: bodyPad + 1 >= r.height,
        };
      }

      return out;
    },
    { vw, vh },
  );
}

async function auditRoute(browser, route, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    colorScheme: "dark",
    reducedMotion: "no-preference",
    serviceWorkers: "block",
  });
  await context.addCookies([
    ...COOKIES,
    {
      name: "vivida_tracking_consent",
      value: "denied",
      url: BASE,
    },
  ]);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !DEV_NOISE.test(msg.text()))
      consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on("pageerror", (err) => pageErrors.push(err.message.slice(0, 300)));

  const result = {
    url: route.url,
    pattern: route.pattern,
    width,
    status: null,
    finalUrl: null,
    title: null,
    lang: null,
    screenshot: null,
    error: null,
    viewportMeta: null,
    doc: null,
    horizontalScroll: 0,
    underlyingScrollWidth: 0,
    overflowOffenders: [],
    clippedText: [],
    smallTapTargets: [],
    mediumTapTargets: [],
    inputZoom: [],
    tinyText: [],
    wideImages: [],
    fixedOverlays: [],
    horizontalScrollers: [],
    coveredControls: [],
    tabBar: null,
    consoleErrors: [],
    pageErrors: [],
  };

  try {
    const response = await page.goto(BASE + route.url, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    result.status = response?.status() ?? null;
    await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(SETTLE);

    // Scroll through the page once to trigger lazy content and reveals.
    await page
      .evaluate(async (vh) => {
        const max = Math.min(document.body.scrollHeight, vh * 12);
        for (let y = 0; y < max; y += vh) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 45));
        }
        window.scrollTo(0, 0);
      }, height)
      .catch(() => {});
    await page.waitForTimeout(350);

    // Freeze transitions/animations so screenshots and metrics are stable.
    await page
      .addStyleTag({
        content:
          "*,*::before,*::after{animation-duration:0.001ms!important;animation-iteration-count:1!important;transition-duration:0.001ms!important;scroll-behavior:auto!important}",
      })
      .catch(() => {});
    await page.waitForTimeout(250);

    result.finalUrl = page.url().replace(BASE, "") || "/";
    result.title = await page.title().catch(() => null);
    result.lang = await page
      .evaluate(() => document.documentElement.lang)
      .catch(() => null);

    const metrics = await collectMetrics(page, width, height);
    Object.assign(result, metrics);

    if (SHOTS) {
      const file = `${slugify(route.url)}__${width}${LABEL}.jpg`;
      try {
        await page.screenshot({
          path: path.join(shotsDir, file),
          fullPage: true,
          type: "jpeg",
          quality: 62,
          timeout: 30_000,
        });
        result.screenshot = `shots/${file}`;
      } catch (err) {
        result.screenshotError = String(err).slice(0, 200);
        // Fall back to a viewport shot.
        try {
          await page.screenshot({
            path: path.join(shotsDir, file),
            fullPage: false,
            type: "jpeg",
            quality: 62,
          });
          result.screenshot = `shots/${file}`;
        } catch {}
      }
    }
  } catch (err) {
    result.error = String(err).slice(0, 300);
  }

  result.consoleErrors = [...new Set(consoleErrors)].slice(0, 8);
  result.pageErrors = [...new Set(pageErrors)].slice(0, 8);
  await context.close();
  return result;
}

const browserArgs = process.env.AUDIT_CHROMIUM_ARGS
  ? process.env.AUDIT_CHROMIUM_ARGS.split(" ")
  : BASE.includes("vividaastro.com")
    ? ["--host-resolver-rules=MAP vividaastro.com 127.0.0.1"]
    : [];
const browser = await chromium.launch({ headless: true, args: browserArgs });
const summary = [];

for (const width of WIDTHS) {
  const height = HEIGHTS[width] ?? 844;
  console.log(
    `\n=== ${width}x${height}: ${routes.length} routes (concurrency ${CONCURRENCY}) ===`,
  );
  const results = [];
  const jsonlPath = path.join(here, `results-${width}${LABEL}.jsonl`);
  fs.writeFileSync(jsonlPath, "");
  const queue = [...routes];
  let done = 0;
  const started = Date.now();

  async function worker() {
    while (queue.length) {
      const route = queue.shift();
      const result = await auditRoute(browser, route, width, height);
      results.push(result);
      fs.appendFileSync(jsonlPath, JSON.stringify(result) + "\n");
      done++;
      const flags = [];
      if (result.horizontalScroll) flags.push("HSCROLL");
      if (result.underlyingScrollWidth > 2)
        flags.push(`under+${result.underlyingScrollWidth}`);
      const count = (value) => (Array.isArray(value) ? value.length : 0);
      if (count(result.clippedText))
        flags.push(`textx${count(result.clippedText)}`);
      if (count(result.smallTapTargets))
        flags.push(`tap<24 x${count(result.smallTapTargets)}`);
      if (count(result.inputZoom))
        flags.push(`zoom x${count(result.inputZoom)}`);
      if (count(result.coveredControls))
        flags.push(`covered x${count(result.coveredControls)}`);
      if ((result.status ?? 0) >= 400) flags.push(`HTTP${result.status}`);
      if (result.error) flags.push("ERR");
      console.log(
        `[${done}/${routes.length}] ${width} ${route.url} ${flags.join(" ") || "ok"} (${((Date.now() - started) / 1000).toFixed(0)}s)`,
      );
      if (result.error) console.log("   ", result.error);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, routes.length) }, () =>
      worker(),
    ),
  );

  results.sort((a, b) => a.url.localeCompare(b.url));
  fs.writeFileSync(
    path.join(here, `results-${width}${LABEL}.json`),
    JSON.stringify(results, null, 2),
  );
  summary.push({ width, height, count: results.length });
  console.log(
    `=== ${width} done: ${results.length} routes in ${((Date.now() - started) / 1000).toFixed(0)}s ===`,
  );
}

await browser.close();
console.log(JSON.stringify(summary, null, 2));
