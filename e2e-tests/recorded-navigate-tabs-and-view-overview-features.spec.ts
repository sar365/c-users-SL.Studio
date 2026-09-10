// dyad-recording-draft-id: "11318083-e5ae-4b9c-b7a0-894f27cc5425" "928e991f-ad45-4407-8253-e351d1521aaa"
import { test, expect } from "@playwright/test";

test("Navigate tabs and view overview features", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Verification", exact: true }).click();
  await page.getByRole("tab", { name: "Instructions", exact: true }).click();
  await page.getByRole("tab", { name: "Verification", exact: true }).click();
  await page.getByRole("tab", { name: "History", exact: true }).click();
  await page.getByRole("tab", { name: "Troubleshoot", exact: true }).click();
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(page.getByTestId("feature-vu-feedback-card")).toBeVisible();
  await page.getByTestId("feature-vu-feedback-description").click();
  await page.getByTestId("feature-vu-feedback-card").dblclick();
  await page.getByTestId("feature-lossless-pcm-description").click();
  await expect(page.getByTestId("feature-lossless-pcm-description")).toBeVisible();
});