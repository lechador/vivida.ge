/**
 * Mobile overlay audit: consent sheet, header drawers, chat, notifications,
 * chart zoom. Opens each overlay at phone widths and reports any element that
 * escapes the viewport or is clipped internally.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const here = import.meta.dirname;
const BASE = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3100";
const shots = path.join(here, "shots");
fs.mkdirSync(shots, { recursive: true });

const nino = JSON.parse(
  fs.readFileSync(path.join(here, "cookies-nino.json"), "utf8"),
)[0];
const newbie = JSON.parse(
  fs.readFileSync(path.join(here, "cookies-newbie.json"), "utf8"),
)[0];

const scenarios = [];
for (const width of [320, 390]) {
  const height = width === 320 ? 568 : 844;
  scenarios.push(
    {
      name: `consent-${width}`,
      width,
      height,
      url: "/",
      cookies: [],
      wait: 1200,
    },
    {
      name: `drawer-${width}`,
      width,
      height,
      url: "/",
      cookies: [nino],
      click: 'button[aria-label="ყველა ინსტრუმენტი"]',
      wait: 900,
    },
    {
      name: `mobilemenu-${width}`,
      width,
      height,
      url: "/feed",
      cookies: [nino],
      click: 'button[aria-label="მენიუ"]',
      wait: 900,
    },
    {
      name: `chat-${width}`,
      width,
      height,
      url: "/feed",
      cookies: [nino],
      click: "[data-chat-launcher]",
      wait: 1200,
    },
    {
      name: `notifications-${width}`,
      width,
      height,
      url: "/feed",
      cookies: [nino],
      click: 'button[aria-label="შეტყობინებები"]',
      wait: 900,
    },
    {
      name: `chartzoom-${width}`,
      width,
      height,
      url: "/report",
      cookies: [nino],
      click: 'button[aria-label="გაადიდე რუკა"]',
      wait: 1400,
    },
    {
      name: `onboarding-${width}`,
      width,
      height,
      url: "/onboarding",
      cookies: [newbie],
      wait: 1200,
    },
  );
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const sc of scenarios) {
  const context = await browser.newContext({
    viewport: { width: sc.width, height: sc.height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    serviceWorkers: "block",
  });
  const cookies = [...sc.cookies];
  if (sc.name.startsWith("consent")) {
    // deliberately leave the consent decision unset
  } else {
    cookies.push({
      name: "vivida_tracking_consent",
      value: "denied",
      url: BASE,
    });
  }
  await context.addCookies(cookies);
  const page = await context.newPage();
  const entry = { name: sc.name, width: sc.width, error: null, overlays: [] };
  try {
    await page.goto(BASE + sc.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(sc.wait);
    if (sc.click) {
      await page.locator(sc.click).first().click({ timeout: 10_000 });
      await page.waitForTimeout(sc.wait);
    }
    const metrics = await page.evaluate(
      ({ vw, vh }) => {
        const visible = (el) => {
          const cs = getComputedStyle(el);
          if (
            cs.display === "none" ||
            cs.visibility === "hidden" ||
            Number(cs.opacity) === 0
          )
            return false;
          const r = el.getBoundingClientRect();
          return r.width > 2 && r.height > 2;
        };
        const overlays = [];
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (cs.position !== "fixed" || !visible(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 40 || r.height < 40) continue;
          // Keep only top-level-ish fixed surfaces, not their nested children.
          if (
            el.parentElement &&
            el.parentElement.closest("*") &&
            getComputedStyle(el.parentElement).position === "fixed"
          )
            continue;
          const out = [];
          for (const child of el.querySelectorAll("*")) {
            if (!visible(child)) continue;
            const cr = child.getBoundingClientRect();
            if (cr.right > vw + 1 || cr.left < -1 || cr.bottom > vh + 1) {
              out.push({
                tag: child.tagName,
                text: (child.textContent ?? "")
                  .trim()
                  .replace(/\s+/g, " ")
                  .slice(0, 50),
                right: Math.round(cr.right),
                left: Math.round(cr.left),
                bottom: Math.round(cr.bottom),
              });
              if (out.length >= 6) break;
            }
          }
          overlays.push({
            cls: (typeof el.className === "string" ? el.className : "").slice(
              0,
              60,
            ),
            left: Math.round(r.left),
            right: Math.round(r.right),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            width: Math.round(r.width),
            height: Math.round(r.height),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            text: (el.innerText ?? "").trim().replace(/\s+/g, " ").slice(0, 70),
            escaping: out,
          });
        }
        return {
          docWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          overlays: overlays.slice(0, 6),
        };
      },
      { vw: sc.width, vh: sc.height },
    );
    entry.metrics = metrics;
    entry.docOverflow = metrics.docWidth - sc.width;
    entry.overlays = metrics.overlays;
    const file = `overlay-${sc.name}.jpg`;
    await page.screenshot({
      path: path.join(shots, file),
      type: "jpeg",
      quality: 70,
    });
    entry.screenshot = `shots/${file}`;
  } catch (err) {
    entry.error = String(err).slice(0, 300);
  }
  await context.close();
  report.push(entry);
  const bad = entry.overlays.filter((o) => o.escaping.length > 0);
  console.log(
    `${sc.name}: docOverflow=${entry.docOverflow ?? "?"} overlays=${entry.overlays.length} escaping=${bad.length}${entry.error ? " ERROR " + entry.error.slice(0, 80) : ""}`,
  );
  for (const o of bad)
    console.log(
      `   ${o.cls} ${o.width}x${o.height} [${o.left},${o.right}] escape:`,
      o.escaping.map((e) => `${e.tag}:${e.text}:${e.right}`).join(" | "),
    );
}

fs.writeFileSync(
  path.join(here, "overlays.json"),
  JSON.stringify(report, null, 2),
);
await browser.close();
