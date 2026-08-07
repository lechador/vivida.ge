import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/signup", "/login", "/en"] as const;
const wcagTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

test("keyboard users can skip repeated navigation", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", {
    name: "მთავარ კონტენტზე გადასვლა",
  });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

for (const route of publicRoutes) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

    if (results.violations.length > 0) {
      await testInfo.attach("axe-accessibility-results", {
        body: JSON.stringify(results, null, 2),
        contentType: "application/json",
      });
    }

    expect(
      results.violations.map((violation) => ({
        rule: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}
