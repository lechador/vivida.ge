import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Wide accessibility + layout sweep over the public SEO surface.
 *
 * e2e/accessibility.spec.ts covers four pages; this covers the content
 * templates behind the ~600 indexed URLs, one representative page per
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
    test(`${path}, a11y + layout`, async ({ page }) => {
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

      // Horizontal overflow, the classic mobile break. Georgian words are
      // long and do not hyphenate, so this catches real regressions.
      // Ground truth for "does this page scroll sideways" is whether it can
      // actually be scrolled, NOT `scrollWidth - clientWidth`. That delta
      // reports several harmless things as overflow: decorative glows placed
      // past the edge and clipped by an `overflow-hidden` ancestor, and text
      // overhanging its column by a pixel or two once webfonts swap in (a long
      // Georgian word in the footer did exactly that, intermittently, because
      // it depends on font-load timing). Try to scroll and see if it moves.
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        const startX = window.scrollX;
        window.scrollTo(99999, window.scrollY);
        const scrolledTo = window.scrollX;
        window.scrollTo(startX, window.scrollY);
        if (scrolledTo <= startX) return { scrolledBy: 0, offenders: [] as string[] };
        return {
          scrolledBy: scrolledTo - startX,
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
        overflow.scrolledBy,
        `${path} scrolls horizontally by ${overflow.scrolledBy}px; widest elements: ${overflow.offenders.join(", ")}`,
      ).toBe(0);

      expect(consoleErrors, `${path} console errors`).toEqual([]);
    });
  }
});
