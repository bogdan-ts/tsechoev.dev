import { test, expect } from "@playwright/test";

test("portfolio discovery, command execution and keyboard controls", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("I’m Bogdan.");
  await expect(page.getByRole("button", { name: /whoami/ })).toBeVisible();
  if (testInfo.project.name === "desktop") await expect(page.getByRole("textbox")).toBeFocused();
  await expect(page.locator(".command-output .eyebrow")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: testInfo.outputPath("welcome.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: /whoami/ }).click();
  await expect(page.locator(".command-output").getByText("ABOUT ME")).toBeVisible();
  const input = page.getByRole("textbox");
  await input.fill("opensource");
  await input.press("Enter");
  await expect(
    page
      .locator(".command-output")
      .last()
      .getByRole("link", { name: "postgres-ai/postgresai ↗", exact: true }),
  ).toHaveAttribute("href", "https://github.com/postgres-ai/postgresai");
  await input.fill("draft");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("opensource");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("draft");
  await input.press("ArrowLeft");
  await expect(page.locator(".cursor-offset")).toHaveText("draf");
  await expect(page.locator(".block-cursor")).toBeVisible();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
  await input.fill("exp");
  await input.press("Tab");
  await expect(input).toHaveValue("experience");
  await input.press("Enter");
  await expect(
    page.locator(".command-output").last().getByText("Apr 2024 – Feb 2026", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("ABOUT ME", { exact: true })).toHaveCount(1);
  const latestOutput = page.locator(".transcript-entry").last();
  const topOffset = await latestOutput.evaluate((element) => {
    const screen = element.closest(".terminal-screen");
    if (!screen) throw new Error("Missing terminal screen");
    return (
      element.getBoundingClientRect().top -
      screen.getBoundingClientRect().top -
      Number.parseFloat(getComputedStyle(screen).paddingTop)
    );
  });
  expect(Math.abs(topOffset)).toBeLessThan(2);
  await page.locator(".terminal-screen").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(input).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);
  await input.fill("theme light");
  await input.press("Enter");
  await expect(page.locator("main")).toHaveAttribute("data-theme", "light");
  await expect(page.getByText("Theme changed.")).toBeVisible();
  expect(
    await page.locator(".terminal-screen").evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("light-output.png"), fullPage: true });
  await input.fill("atlas");
  await input.press("Enter");
  const atlasOutput = page.locator(".command-output").last();
  await expect(atlasOutput.getByRole("listitem")).toHaveCount(19);
  await expect(atlasOutput.getByRole("heading", { name: "Atlas", exact: true })).toBeVisible();
  await input.fill("clear");
  await input.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await input.fill("history");
  await input.press("Enter");
  await expect(page.getByRole("listitem")).toHaveCount(7);
  expect(errors).toEqual([]);
});

test("static introduction, metadata and CV work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL ?? "/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("I’m Bogdan.");
  await expect(page.getByText("Available commands:")).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://tsechoev.dev/og.png",
  );
  const cv = await context.request.get(`${baseURL}/bogdan-tsechoev-resume.pdf`);
  expect(cv.ok()).toBe(true);
  expect(cv.headers()["content-type"]).toContain("application/pdf");
  const response = await context.request.get(`${baseURL}/robots.txt`);
  expect(await response.text()).toContain("https://tsechoev.dev/sitemap.xml");
  await context.close();
});
