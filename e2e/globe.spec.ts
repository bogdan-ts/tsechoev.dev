import { expect, test } from "@playwright/test";

test("ASCII globe animates, pauses and fits the terminal", async ({ page }, testInfo) => {
  await page.goto("/");
  const input = page.getByRole("textbox");
  await input.fill("globe");
  await input.press("Enter");
  const globe = page.locator(".globe-command");
  const frame = globe.locator("pre");
  await expect(frame).toBeVisible();
  await expect(globe.locator(".globe-visited").first()).toBeVisible();
  const initial = await frame.textContent();
  await expect.poll(() => frame.textContent()).not.toBe(initial);
  await globe.getByRole("button", { name: "Pause rotation" }).click();
  const paused = await frame.textContent();
  await page.waitForTimeout(350);
  expect(await frame.textContent()).toBe(paused);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(input).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("globe.png"), fullPage: true });
  await globe.getByRole("button", { name: "Show visited places" }).click();
  await expect(page.locator(".command-output").last().getByRole("listitem")).toHaveCount(19);
  await input.fill("clear");
  await input.press("Enter");
  await expect(globe).toHaveCount(0);
});

test("reduced motion keeps the globe static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const input = page.getByRole("textbox");
  await input.fill("globe");
  await input.press("Enter");
  const globe = page.locator(".globe-command");
  await expect(globe.getByText("Rotation off: reduced motion.")).toBeVisible();
  const frame = await globe.locator("pre").textContent();
  await page.waitForTimeout(350);
  expect(await globe.locator("pre").textContent()).toBe(frame);
});
