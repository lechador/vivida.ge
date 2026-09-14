import { expect, test } from "@playwright/test";

/**
 * Money and activation continuity without Stripe or an account.
 *
 * A full paid loop cannot run in this harness (no Stripe test clock, no
 * mailbox), so these specs guard the seams instead: the reconciliation
 * endpoint rejects anonymous callers before touching Stripe, checkout query
 * params cannot smuggle an external destination through the login gate, and
 * the public calculator preserves its birth inputs into the signup chain.
 */

test.describe("checkout return hardening", () => {
  test("anonymous billing session lookup is rejected, not executed", async ({
    request,
  }) => {
    for (const query of ["", "?session_id=cs_test_bogus"]) {
      const res = await request.get(`/api/billing/session${query}`);

      expect(res.status()).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    }
  });

  test("checkout params cannot smuggle an external next through login", async ({
    request,
  }) => {
    const res = await request.get(
      "/credits?status=success&session_id=cs_test_bogus&next=https://evil.com",
      { maxRedirects: 0 },
    );

    expect(res.status()).toBe(307);
    const location = res.headers()["location"] ?? "";
    expect(location).toContain("/login");
    expect(location).not.toContain("evil.com");
    // status/session_id are tracker-only params: they must not leak into the
    // preserved destination either.
    expect(location).not.toContain("session_id");
  });
});

test.describe("calculator to signup continuity", () => {
  test("computed chart is saved as a draft and signup keeps onboarding", async ({
    page,
  }) => {
    // Deterministic birthplace: the real endpoint proxies Open-Meteo, which
    // is correct in production but flaky by definition in a test.
    await page.route("**/api/public/geocode**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: 611717,
              name: "Tbilisi",
              displayName: "Tbilisi, Georgia",
              country: "Georgia",
              countryCode: "GE",
              latitude: 41.6938,
              longitude: 44.8015,
              timezone: "Asia/Tbilisi",
            },
          ],
        }),
      }),
    );

    await page.goto("/nataluri-ruka");
    await page.getByPlaceholder("დღე").fill("14");
    await page.getByPlaceholder("თვე").fill("05");
    await page.getByPlaceholder("წელი").fill("1990");
    await page.getByPlaceholder("საათი").fill("12");
    await page.getByPlaceholder("წუთი").fill("30");
    await page.locator("#calc-place").fill("თბ");
    await page.getByRole("button", { name: "Tbilisi" }).click();
    await page.getByRole("button", { name: "გამოთვალე ჩემი რუკა" }).click();

    await expect(
      page.getByRole("heading", { name: "პლანეტების პოზიციები" }),
    ).toBeVisible();

    const draft = await page.evaluate(() => {
      const raw = sessionStorage.getItem("vivida_pending_natal_profile_v1");
      return raw ? (JSON.parse(raw) as unknown) : null;
    });
    expect(draft).toMatchObject({
      dateOfBirth: "1990-05-14",
      timeOfBirth: "12:30",
      place: { name: "Tbilisi", timezone: "Asia/Tbilisi" },
    });

    await expect(
      page.getByRole("link", { name: "უფასო რეგისტრაცია" }),
    ).toHaveAttribute("href", "/signup?next=%2Fonboarding%3Fnext%3D%2Freport");
  });
});
