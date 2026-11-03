import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/simple/", "/simple/travel/"]) {
  test(`accessible static page and matching metadata: ${path}`, async ({ page, baseURL }) => {
    await page.goto(path);
    if (path === "/simple/travel/") {
      await expect(page.locator("canvas")).toBeVisible();
      await page.getByRole("button", { name: "Pause rotation" }).click();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const canonical = `https://tsechoev.dev${path}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
    expect(baseURL).toBeTruthy();
  });
}

test("unavailable Canvas has a readable fallback instead of throwing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/simple/travel/");
  await expect(page.getByRole("status")).toHaveText(/Canvas is unavailable/);
  await expect(page.locator("#travel li")).toHaveCount(19);
  await expect(page.getByRole("button", { name: "Pause rotation" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
