import { expect, test } from "@playwright/test";

const candidateUrl = process.env.DYAD_TEST_BASE_URL;
if (!candidateUrl) {
  throw new Error(
    "DYAD_TEST_BASE_URL is required; set it to the deployed Vercel candidate URL.",
  );
}

const candidate = new URL(candidateUrl);
if (
  candidate.protocol !== "https:" ||
  !candidate.hostname.endsWith(".vercel.app") ||
  candidate.username ||
  candidate.password ||
  candidate.search ||
  candidate.hash ||
  (candidate.pathname !== "/" && candidate.pathname !== "")
) {
  throw new Error(
    "DYAD_TEST_BASE_URL must be an HTTPS Vercel deployment URL with no path, query, or fragment.",
  );
}

const candidateOrigin = candidate.origin;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!bypassSecret) {
  throw new Error(
    "VERCEL_AUTOMATION_BYPASS_SECRET is required for the protected candidate smoke test.",
  );
}

// Never persist request traces for these tests: they may contain the bypass
// header. Failure screenshots remain enabled by the Playwright config.
test.use({ trace: "off" });

// Vercel Deployment Protection may block CI. Attach its automation bypass only
// to requests for this exact candidate origin; never forward it to redirects,
// third-party assets, or unrelated hosts.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestOrigin = new URL(route.request().url()).origin;
    if (requestOrigin !== candidateOrigin) {
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

test("candidate home page responds and renders the SL.STUDIO overview", async ({ page }) => {
  const response = await page.goto(candidateUrl);

  expect(response, "the candidate home page should return an HTTP response").not.toBeNull();
  expect(response!.status(), "the candidate home page should return HTTP 200").toBe(200);
  await expect(page).toHaveTitle(/SL\.STUDIO/);
  await expect(page.getByRole("heading", { name: "Studio Overview" })).toBeVisible();
  await expect(page.getByTestId("feature-wasapi-loopback-card")).toBeVisible();
});

test("candidate client-side navigation loads instructions and returns to overview", async ({ page }) => {
  await page.goto(candidateUrl);

  await page.getByRole("tab", { name: "Instructions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Native Setup Instructions" })).toBeVisible();

  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Studio Overview" })).toBeVisible();
});
