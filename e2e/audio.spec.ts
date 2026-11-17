import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    portfolioAudio?: HTMLAudioElement;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.Audio = class extends NativeAudio {
      constructor(src?: string) {
        super(src);
        window.portfolioAudio = this;
      }
    };
  });
});

test("intro is lazy, playable, resumable and stops on navigation", async ({ page }, testInfo) => {
  const audioRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audioRequests.push(request.url());
    expect(request.url()).not.toContain("api.elevenlabs.io");
  });
  await page.goto("/simple/");
  await expect(page.getByRole("button", { name: "Listen to my intro" })).toBeVisible();
  expect(audioRequests).toHaveLength(0);
  await page.getByText("Read transcript", { exact: true }).click();
  await expect(
    page.getByText("If you’d like to work together, feel free to get in touch.", { exact: true }),
  ).toBeVisible();
  await page.getByText("Read transcript", { exact: true }).click();
  await page.getByRole("button", { name: "Listen to my intro" }).click();
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  expect(audioRequests.some((url) => url.endsWith("/audio/intro.mp3"))).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.portfolioAudio?.duration ?? 0))
    .toBeGreaterThan(30);
  await page.getByRole("button", { name: "Pause audio" }).click();
  await expect(page.getByRole("button", { name: "Resume audio" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("audio-simple.png"), fullPage: true });
  await page.getByRole("button", { name: "Resume audio" }).click();
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await page.getByRole("button", { name: "Stop audio" }).click();
  await expect(page.getByRole("button", { name: "Listen to my intro" })).toBeVisible();
  await page.getByRole("button", { name: "Listen to my intro" }).click();
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await page.getByRole("link", { name: "Terminal", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.portfolioAudio?.paused)).toBe(true);
  expect(await page.evaluate(() => window.portfolioAudio?.getAttribute("src"))).toBeNull();
  await expect(page.getByRole("button", { name: "Pause audio" })).toHaveCount(0);
});

test("terminal switches recordings, shows contacts and clears playback", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const prompt = page.getByRole("textbox");
  await prompt.fill("play intro");
  await prompt.press("Enter");
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await prompt.fill("sudo hire me");
  await prompt.press("Enter");
  await expect(page.getByRole("link", { name: /bogdan.tsechoev@gmail.com/ })).toBeVisible();
  await expect(
    page.getByText("Permission granted. Contact details unlocked. Hiring still requires humans."),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("audio-terminal.png"), fullPage: true });
  await prompt.fill("stop");
  await prompt.press("Enter");
  await expect(page.getByText("Audio stopped.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause audio" })).toHaveCount(0);
  await prompt.fill("play intro");
  await prompt.press("Enter");
  await expect(page.getByRole("button", { name: "Pause audio" })).toBeVisible();
  await prompt.fill("clear");
  await prompt.press("Enter");
  await expect(page.getByRole("button", { name: "Pause audio" })).toHaveCount(0);
});

test("missing audio is recoverable without hiding the profile", async ({ page }) => {
  await page.route("**/audio/intro.mp3", (route) => route.fulfill({ status: 404 }));
  await page.goto("/simple/");
  await page.getByRole("button", { name: "Listen to my intro" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not play" })).toContainText(
    "Could not play audio",
  );
  await expect(page.getByRole("button", { name: "Retry audio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Email", exact: true })).toBeVisible();
});
