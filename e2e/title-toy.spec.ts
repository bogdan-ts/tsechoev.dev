import { test, expect } from "@playwright/test";

for (const [i, effect] of [
  "gravity",
  "typo",
  "reboot",
  "dot",
  "wave",
  "reverse",
  "atoms",
].entries()) {
  test(`title animation: ${effect}`, async ({ page }) => {
    await page.addInitScript(
      (value) => {
        Math.random = () => value;
      },
      (i + 0.1) / 7,
    );
    await page.goto("/simple/");
    const title = page.getByRole("button", {
      name: "tsechoev.dev — play a small animation",
      exact: true,
    });
    const before = await title.boundingBox();
    await title.click();
    await expect(title).toHaveAttribute("data-effect", effect);
    if (effect === "atoms") await expect(title.locator("canvas")).toBeVisible();
    await title.click();
    await expect(title).toHaveAttribute("data-effect", effect);
    await expect(title).not.toHaveAttribute("data-effect", effect);
    await expect(title).toHaveText("tsechoev.dev");
    expect(await title.boundingBox()).toEqual(before);
    await title.press("Enter");
    await expect(title).not.toHaveAttribute("data-effect", effect);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
test("reduced motion uses a still joke and restores the title", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const title = page.getByRole("button", {
    name: "tsechoev.dev — play a small animation",
    exact: true,
  });
  await title.click();
  await expect(title).toHaveAttribute("data-reduced", "true");
  await expect(title).toHaveAttribute("aria-busy", "false");
  await expect(title).toHaveText("tsechoev.dev");
});
