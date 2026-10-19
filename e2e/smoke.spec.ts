import { expect, test } from "@playwright/test";

test.describe("public smoke flows", () => {
  test("anonymous Auth.js session endpoint stays healthy", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/session");

    expect(response.ok()).toBe(true);
    expect(await response.json()).toBeNull();
  });

  test("landing page opens and the email CTA reaches sign-up", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(/ნატალური რუკა.*Vivida/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /გაიგე, ვინ ხარ/i }),
    ).toBeVisible();

    const signUpLink = page.getByRole("link", { name: "ან ელფოსტით" });
    await expect(signUpLink).toHaveAttribute("href", "/signup");
    await signUpLink.click();
    await page.waitForURL("**/signup");
    await expect(
      page.getByRole("heading", { level: 1, name: "შექმენი შენი ანგარიში" }),
    ).toBeVisible();
    await expect(page.getByLabel("სახელი")).toBeVisible();
    await expect(page.getByLabel("ელფოსტა")).toBeVisible();
    await expect(page.getByLabel("პაროლი")).toBeVisible();
  });

  test("login keeps a safe next destination when navigating to sign-up", async ({
    page,
  }) => {
    await page.goto("/login?next=/timing");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "კეთილი იყოს შენი დაბრუნება",
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "დარეგისტრირდი" }).click();
    await expect(page).toHaveURL(/\/signup\?next=%2Ftiming$/);
  });

  test("anonymous dashboard requests return to the landing page", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/\?from=%2Fdashboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /გაიგე, ვინ ხარ/i }),
    ).toBeVisible();
  });

  test("English guide hub renders and links to the natal-chart guide", async ({
    page,
  }) => {
    const response = await page.goto("/en");

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Birth data in/i,
      }),
    ).toBeVisible();
    // Since vividaastro.com launched, the public English URL is the clean
    // /natal-chart; next.config.ts rewrites it onto the internal /en tree on
    // the English hosts. Asserting the clean href is what guards the contract,
    // a regression to an internal /en/* link would ship the wrong URL into
    // every English page's markup.
    const natalGuideLink = page.getByRole("link", {
      name: /Calculate my chart, free/i,
    });
    await expect(natalGuideLink).toHaveAttribute("href", "/natal-chart");

    // The link can't be *followed* here: that rewrite is host-scoped, and the
    // suite runs against 127.0.0.1, where /natal-chart has no route at all.
    // Visit the internal path the rewrite targets to prove the page it
    // resolves to actually renders.
    await page.goto("/en/natal-chart");
    await expect(
      page.getByRole("heading", { level: 1, name: /birth chart/i }),
    ).toBeVisible();
  });
});
