import { expect, test } from "@playwright/test";

// Vercel's preview deployments may have Deployment Protection enabled. Send the
// optional bypass secret only to the exact deployment origin under test; never
// forward it to external assets or redirects.
test.beforeEach(async ({ page }) => {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!bypassSecret) return;

  const baseUrl = process.env.DYAD_TEST_BASE_URL || "http://localhost:32100";
  const deploymentOrigin = new URL(baseUrl).origin;

  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin !== deploymentOrigin) {
      await route.continue();
      return;
    }

    await route.continue({
      headers: {
        ...route.request().headers(),
        "x-vercel-protection-bypass": bypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      },
    });
  });
});

test("deployed home page responds and renders the SL.STUDIO overview", async ({ page }) => {
  const response = await page.goto("/");

  expect(response, "the home page should return an HTTP response").not.toBeNull();
  expect(response!.status(), "the home page should not return an error").toBeLessThan(400);
  await expect(page).toHaveTitle(/SL\.STUDIO/);
  await expect(page.getByRole("heading", { name: "Studio Overview" })).toBeVisible();
  await expect(page.getByTestId("feature-wasapi-loopback-card")).toBeVisible();
});

test("client-side navigation loads setup instructions and returns to overview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Instructions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Native Setup Instructions" })).toBeVisible();

  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Studio Overview" })).toBeVisible();
});
