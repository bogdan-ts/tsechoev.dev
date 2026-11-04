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
    "CV",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toHaveCount(1);
  }
  await expect(
    page.locator("#whoami").getByRole("heading", { name: "Atlas", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#atlas")).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Contact", exact: true })
      .getByRole("link", { name: "https://www.linkedin.com/in/bogdan-tsechoev/", exact: true }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/bogdan-tsechoev/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("simple.png"), fullPage: true });
  await page
    .getByRole("navigation", { name: "Profile sections" })
    .getByRole("link", { name: "Atlas" })
    .click();
  await expect(page).toHaveURL(/\/simple\/atlas\//);
  await expect(page.locator("#atlas li")).toHaveCount(19);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
  await expect(page).toHaveTitle(/Atlas \| Bogdan Tsechoev/);
  await page.getByRole("link", { name: "Terminal", exact: true }).click();
  await expect(page.getByRole("textbox")).toBeVisible();
});

test("simple profile is statically available without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/simple/`);
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toHaveCount(1);
  await expect(page.locator("#atlas")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Download CV/ })).toHaveAttribute(
    "href",
    "/bogdan-tsechoev-resume.pdf",
  );
  await page
    .getByRole("navigation", { name: "Profile sections" })
    .getByRole("link", { name: "Atlas" })
    .click();
  await expect(page.locator("#atlas li")).toHaveCount(19);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("link", { name: "Who I Am", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toHaveCount(1);
  await page.getByRole("link", { name: "Terminal", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("legacy globe URL redirects to Atlas without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/simple/travel/`);
  await expect(page).toHaveURL(/\/simple\/atlas\//);
  await expect(page.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
  await expect(page.locator("#atlas li")).toHaveCount(19);
  await context.close();
});

test("explicit contacts open normally and copy independently", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          document.documentElement.dataset.copied = value;
        },
      },
    });
  });
  await page.goto("/simple/");
  await page.getByRole("button", { name: "Copy Email", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Email copied.");
  await expect(page.locator("html")).toHaveAttribute("data-copied", "bogdan.tsechoev@gmail.com");
  await expect(
    page.getByRole("link", { name: "bogdan.tsechoev@gmail.com", exact: true }),
  ).toHaveAttribute("href", "mailto:bogdan.tsechoev@gmail.com");
  await page.getByRole("button", { name: "Copy Telegram", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-copied", "@tsechoevb");
  await expect(page.getByRole("link", { name: "tsechoev", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Copy LINE", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-copied", "tsechoev");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  await page.getByRole("button", { name: "Copy LinkedIn", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Copy unavailable");
});
