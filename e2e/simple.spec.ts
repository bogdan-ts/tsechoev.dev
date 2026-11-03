import { test, expect } from "@playwright/test";

test("switch versions and read the complete profile without commands", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Site version" })
    .getByRole("link", { name: "Simple" })
    .click();
  await expect(page).toHaveURL(/\/simple\//);
  await expect(page.getByRole("link", { name: "Simple", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("textbox")).toHaveCount(0);
  for (const heading of [
    "Bogdan Tsechoev",
    "Experience",
    "Skills",
    "Open source",
    "Education",
    "Contact",
    "CV",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toHaveCount(1);
  }
  await expect(
    page.locator("#whoami").getByRole("heading", { name: "Travel", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#travel")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("simple.png"), fullPage: true });
  await page
    .getByRole("navigation", { name: "Profile sections" })
    .getByRole("link", { name: "Travel" })
    .click();
  await expect(page).toHaveURL(/\/simple\/travel\//);
  await expect(page.locator("#travel li")).toHaveCount(19);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Travel" })).toBeVisible();
  await page.getByRole("link", { name: "Terminal", exact: true }).click();
  await expect(page.getByRole("textbox")).toBeVisible();
});

test("simple profile is statically available without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/simple/`);
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toHaveCount(1);
  await expect(page.locator("#travel")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Download CV/ })).toHaveAttribute(
    "href",
    "/bogdan-tsechoev-resume.pdf",
  );
  await page
    .getByRole("navigation", { name: "Profile sections" })
    .getByRole("link", { name: "Travel" })
    .click();
  await expect(page.locator("#travel li")).toHaveCount(19);
  await page.getByRole("link", { name: "Whoami", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toHaveCount(1);
  await page.getByRole("link", { name: "Terminal", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
