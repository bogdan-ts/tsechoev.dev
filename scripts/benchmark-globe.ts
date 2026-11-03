import { chromium } from "@playwright/test";

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(process.argv[2] ?? "http://127.0.0.1:3000/");
  const input = page.getByRole("textbox");
  await input.fill("atlas --globe");
  await input.press("Enter");
  const globe = page.locator(".globe-command");
  await globe.waitFor();
  await page.waitForTimeout(1000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const before = (await cdp.send("Performance.getMetrics")).metrics;
  const observations = await globe.evaluate(
    (element) =>
      new Promise((resolve) => {
        let mutations = 0;
        let paints = 0;
        const observer = new MutationObserver(() => mutations++);
        observer.observe(element, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
        });
        const context = element.querySelector("canvas")?.getContext("2d");
        const clear = context?.clearRect;
        if (context && clear)
          context.clearRect = (...args) => {
            paints++;
            clear.apply(context, args);
          };
        setTimeout(() => {
          observer.disconnect();
          if (context && clear) context.clearRect = clear;
          resolve({ nodes: element.querySelectorAll("*").length, mutations, paints });
        }, 3000);
      }),
  );
  const after = (await cdp.send("Performance.getMetrics")).metrics;
  const delta = (name: string) =>
    Math.round(
      1000 *
        ((after.find((metric) => metric.name === name)?.value ?? 0) -
          (before.find((metric) => metric.name === name)?.value ?? 0)),
    );
  console.log(
    JSON.stringify({
      observations,
      taskMs: delta("TaskDuration"),
      scriptMs: delta("ScriptDuration"),
      layoutMs: delta("LayoutDuration"),
    }),
  );
} finally {
  await browser.close();
}
