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
      page.getByRole("heading", { level: 1, name: /გაიგე, ვინ ხარ/i })
    ).toBeVisible();

    const signUpLink = page.getByRole("link", { name: "ან ელფოსტით" });
    await expect(signUpLink).toHaveAttribute("href", "/signup");
    await signUpLink.click();
    await page.waitForURL("**/signup");
    await expect(
      page.getByRole("heading", { level: 1, name: "შექმენი შენი ანგარიში" })
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
      page.getByRole("heading", { level: 1, name: "კეთილი იყოს შენი დაბრუნება" })
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
      page.getByRole("heading", { level: 1, name: /გაიგე, ვინ ხარ/i })
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
        name: /Your birth chart, made more understandable/i,
      })
    ).toBeVisible();
    const natalGuideLink = page.getByRole("link", {
      name: /Start with your natal chart/i,
    });
    await expect(natalGuideLink).toHaveAttribute("href", "/en/natal-chart");
    await natalGuideLink.click();
    await page.waitForURL("**/en/natal-chart");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
