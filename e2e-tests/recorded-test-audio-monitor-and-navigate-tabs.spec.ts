// dyad-recording-draft-id: "c98f677b-19c6-47f0-a4ce-f9978b8508df" "e6494adf-e59f-431d-b88d-60e15fbc0cb5"
import { test, expect } from "@playwright/test";

test("Test audio monitor and navigate tabs", async ({ page }) => {
  await page.addInitScript(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = async () => {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const dst = ctx.createMediaStreamDestination();
        osc.connect(dst);
        osc.start();
        return dst.stream;
      };
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Start Audio Test", exact: true }).click();
  
  // Assert monitor actively captures and enters live monitoring state
  await expect(page.getByTestId("audio-monitor-status-badge")).toContainText("LIVE");
  await expect(page.getByRole("button", { name: "Stop & Save Test", exact: true })).toBeVisible();
  await expect(page.getByTestId("audio-level-percentage")).toBeVisible();

  await page.getByRole("button", { name: "Stop & Save Test", exact: true }).click();
  await expect(page.getByRole("link", { name: "Save", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Instructions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Native Setup Instructions" })).toBeVisible();
  await page.getByTestId("header-tagline-badge").click();
  await page.getByRole("tab", { name: "Troubleshoot", exact: true }).click();
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Studio Overview" })).toBeVisible();
});
