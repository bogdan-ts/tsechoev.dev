import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("complete a real local PostgreSQL case from static export", async ({ page }) => {
  test.setTimeout(120000);
  const engineRequests: string[] = [];
  const requests: string[] = [];
  page.on("request", (r) => {
    requests.push(r.url());
    if (/pglite|\.wasm|\.data/.test(r.url())) engineRequests.push(r.url());
  });
  await page.goto("/simple/sql-detective/");
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
  expect(engineRequests).toHaveLength(0);
  await page.getByRole("button", { name: "Start investigation", exact: true }).click();
  const run = page.getByRole("button", { name: "Run & explain", exact: true });
  await expect(run).toBeEnabled({ timeout: 60000 });
  await run.click();
  await expect(page.getByText("Execution time (median of three):", { exact: false })).toBeVisible({
    timeout: 20000,
  });
  await expect(
    page.getByText("The plan scans orders sequentially.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Index configuration").selectOption("latest");
  await page.getByRole("button", { name: "Apply index", exact: true }).click();
  await expect(run).toBeEnabled();
  await run.click();
  await expect(page.getByRole("heading", { name: "Case solved", exact: true })).toBeVisible({
    timeout: 20000,
  });
  expect(engineRequests.length).toBeGreaterThan(0);
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:3000/"))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Light theme", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Replay", exact: true })).toBeDisabled();
  await page.locator(".workspace").evaluate((el) => {
    (el as HTMLElement).style.zoom = "2";
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Atlas", exact: true }).click();
  await expect.poll(() => page.workers().length).toBe(0);
  await page.getByRole("link", { name: "SQL Detective", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start investigation", exact: true }),
  ).toBeVisible();
  expect(page.workers()).toHaveLength(0);
});
test("no engine assets before start, including other routes", async ({ page }) => {
  const assets: string[] = [];
  page.on("request", (r) => {
    if (/pglite|\.wasm|\.data/.test(r.url())) assets.push(r.url());
  });
  for (const path of ["/", "/simple/atlas/", "/simple/sql-detective/"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(assets).toEqual([]);
});
test("cancel destroys busy worker; retry recovers after a missing asset", async ({ page }) => {
  test.setTimeout(120000);
  await page.clock.install();
  await page.route("**/*.wasm", (route) => route.abort());
  await page.goto("/simple/sql-detective/");
  await page.getByRole("button", { name: "Start investigation", exact: true }).click();
  await page.waitForTimeout(500);
  await page.clock.fastForward(61000);
  await expect(page.locator(".detective-lab").getByRole("alert")).toBeVisible();
  await page.clock.resume();
  await page.unroute("**/*.wasm");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.getByRole("button", { name: "Cancel and restart database", exact: true }).click();
  await expect(page.getByRole("button", { name: "Run & explain", exact: true })).toBeEnabled({
    timeout: 60000,
  });
});

test("case shell and navigation work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/simple/sql-detective/`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Case 001: The slow orders page" }),
  ).toBeVisible();
  const html = await (await context.request.get(`${baseURL}/simple/sql-detective/`)).text();
  expect(html).toContain("<noscript>Enable JavaScript");
  await page.getByRole("link", { name: "Atlas", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Atlas", exact: true })).toBeVisible();
  await context.close();
});
