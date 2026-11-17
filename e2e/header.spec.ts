import { test, expect, type Page } from "@playwright/test";

async function headerGeometry(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  return page.locator(".site-header").evaluate((header) => {
    const style = getComputedStyle(header);
    const bounds = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const title = header.querySelector(".site-title");
    const nav = header.querySelector("nav");
    if (!title || !nav) throw new Error("Missing shared header content");
    return {
      header: bounds(header),
      title: bounds(title),
      nav: bounds(nav),
      padding: style.padding,
      border: style.borderBottomWidth,
      font: style.font,
      background: style.backgroundColor,
    };
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`shared header stays in place when switching routes (${theme})`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (savedTheme) => localStorage.setItem("portfolio-theme", savedTheme),
      theme,
    );
    await page.goto("/");
    const reference = await headerGeometry(page);
    await page
      .getByRole("navigation", { name: "Site version" })
      .getByRole("link", { name: "Simple", exact: true })
      .click();
    await expect(page).toHaveURL(/\/simple\//);
    expect(await headerGeometry(page)).toEqual(reference);
    await page.screenshot({ path: testInfo.outputPath("shared-header-simple.png") });
    await page
      .getByRole("navigation", { name: "Profile sections" })
      .getByRole("link", { name: "Atlas", exact: true })
      .click();
    await expect(page).toHaveURL(/\/simple\/atlas\//);
    expect(await headerGeometry(page)).toEqual(reference);
    await page
      .getByRole("navigation", { name: "Site version" })
      .getByRole("link", { name: "Terminal", exact: true })
      .click();
    await expect(page).toHaveURL("/");
    expect(await headerGeometry(page)).toEqual(reference);
    await page.screenshot({ path: testInfo.outputPath("shared-header-terminal.png") });
  });
}
