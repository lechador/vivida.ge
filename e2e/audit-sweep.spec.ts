import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Wide accessibility + layout sweep over the public SEO surface.
 *
 * e2e/accessibility.spec.ts covers four pages; this covers the content
 * templates behind the ~600 indexed URLs — one representative page per
 * template, since every URL in a cluster renders the same component tree.
 *
 * It caught the IQ test's figure answers shipping as buttons with no
 * accessible name (screen-reader users could not tell the options apart),
 * which the four-page suite never touched.
 */
const PAGES = [
  "/",
  "/horoskopi",
  "/horoskopi/kvireuli",
  "/zodiac",
  "/zodiac/gemini",
  "/zodiac/tavsebadoba",
  "/zodiac/tavsebadoba/gemini-pisces",
  "/zodiac/reitingebi",
  "/nataluri-ruka",
  "/tavsebadoba",
  "/taro",
  "/taro/the-fool",
  "/mkitxaoba",
  "/sizmris-akhsna",
  "/angeluri-ricxvebi",
  "/numerologia",
  "/planetebi",
  "/astrologiuri-kalendari",
  "/mtvaris-kalendari",
  "/chinuri-horoskopi",
  "/chinuri-horoskopi/dragon",
  "/mbti",
  "/pirovnebis-testi",
  "/iq-testi",
  "/eq-testi",
  "/big-five",
  "/tests",
  "/features",
  "/how-it-works",
  "/credits",
];

// `next dev` injects an HMR websocket and dev-only probe requests; they are
// harness noise rather than application defects.
const DEV_NOISE =
  /_next\/hmr|WebSocket|403 \(Forbidden\)|Download the React DevTools/;

test.describe("public surface sweep", () => {
  for (const path of PAGES) {
    test(`${path} — a11y + layout`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && !DEV_NOISE.test(msg.text())) {
          consoleErrors.push(msg.text());
        }
      });
      page.on("pageerror", (err) =>
        consoleErrors.push(`pageerror: ${err.message}`),
      );

      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.status(), `${path} should not error`).toBeLessThan(400);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          example: v.nodes[0]?.html?.slice(0, 160),
        })),
        `${path} WCAG A/AA violations`,
      ).toEqual([]);

      // Horizontal overflow — the classic mobile break. Georgian words are
      // long and do not hyphenate, so this catches real regressions.
      // Horizontal overflow is measured on the document, not per element:
      // decorative glows are routinely positioned past the viewport edge and
      // clipped by an `overflow-hidden` ancestor, which is not a defect. The
      // per-element list is collected only to name a culprit when it is.
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        // Negative when a vertical scrollbar is present — only a positive
        // delta means the page actually scrolls sideways.
        const overflowPx = Math.max(0, de.scrollWidth - de.clientWidth);
        if (overflowPx === 0) return { overflowPx, offenders: [] as string[] };
        return {
          overflowPx,
          offenders: [...document.querySelectorAll("body *")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.right > de.clientWidth + 2;
            })
            .slice(0, 5)
            .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`),
        };
      });
      expect(
        overflow.overflowPx,
        `${path} scrolls horizontally; widest elements: ${overflow.offenders.join(", ")}`,
      ).toBe(0);

      expect(consoleErrors, `${path} console errors`).toEqual([]);
    });
  }
});
