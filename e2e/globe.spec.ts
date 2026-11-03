import { expect, test } from "@playwright/test";

test("ASCII globe animates, pauses and fits the terminal", async ({ page }, testInfo) => {
  await page.goto("/");
  const input = page.getByRole("textbox");
  await input.fill("atlas --globe");
  await input.press("Enter");
  const globe = page.locator(".globe-command");
  const frame = globe.locator("canvas");
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute("aria-label", /visited/);
  await expect
    .poll(() =>
      page
        .locator(".transcript-entry")
        .last()
        .evaluate((element) => {
          const screen = element.closest(".terminal-screen");
          if (!screen) throw new Error("Missing terminal screen");
          const desired =
            screen.scrollTop +
            element.getBoundingClientRect().top -
            screen.getBoundingClientRect().top -
            Number.parseFloat(getComputedStyle(screen).paddingTop);
          const expected = Math.max(
            0,
            Math.min(desired, screen.scrollHeight - screen.clientHeight),
          );
          return Math.abs(screen.scrollTop - expected);
        }),
    )
    .toBeLessThan(2);
  const initial = await frame.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await expect
    .poll(() => frame.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()))
    .not.toBe(initial);
  await globe.getByRole("button", { name: "Pause rotation" }).click();
  const paused = await frame.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(350);
  expect(await frame.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(paused);
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
  await input.fill("atlas --globe");
  await input.press("Enter");
  const globe = page.locator(".globe-command");
  await expect(globe.getByText("Rotation off: reduced motion.")).toBeVisible();
  const frame = await globe
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(350);
  expect(
    await globe.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
  ).toBe(frame);
});

test("atlas loads the globe automatically and supports pointer dragging", async ({ page }) => {
  await page.goto("/simple/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Atlas", exact: true }).click();
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Pause rotation" }).click();
  const initial = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing globe bounds");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(
    initial,
  );
  await page.getByRole("link", { name: "Whoami", exact: true }).click();
  await expect(canvas).toHaveCount(0);
});

test("globe controls keep focus and repaint correctly after a theme change", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox");
  await input.fill("atlas --globe");
  await input.press("Enter");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Pause rotation" }).click();
  await canvas.click();
  await expect(canvas).toBeFocused();
  const before = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await canvas.press("ArrowLeft");
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(
    before,
  );
  const dark = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await input.fill("theme light");
  await input.press("Enter");
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(dark);
});

test("touch dragging works with reduced motion without starting inertia", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Touch interaction is exercised in the mobile project.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/simple/atlas/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByText("Rotation off: reduced motion.")).toBeVisible();
  const initial = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing globe bounds");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y + 60 }],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const dragged = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  expect(dragged).not.toBe(initial);
  await page.waitForTimeout(300);
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(dragged);
});

test("vertical arrow keys and vertical dragging rotate a paused globe", async ({ page }) => {
  await page.goto("/simple/atlas/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Pause rotation" }).click();
  const initial = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await canvas.press("ArrowUp");
  const tilted = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  expect(tilted !== initial).toBe(true);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing globe bounds");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 65, { steps: 8 });
  await page.mouse.up();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(
    tilted,
  );
});
