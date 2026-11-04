import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";
const root = path.resolve("out");
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(
      root,
      "." + decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname),
    );
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const bytes = await readFile(file);
    const body = gzipSync(bytes);
    const type = file.endsWith(".wasm")
      ? "application/wasm"
      : file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".html")
          ? "text/html"
          : file.endsWith(".css")
            ? "text/css"
            : "application/octet-stream";
    res.writeHead(200, {
      "content-type": type,
      "content-encoding": "gzip",
      "content-length": body.length,
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise<void>((resolve) => server.listen(3002, "127.0.0.1", resolve));
const browser = await chromium.launch();
type Asset = { url: string; bytes: number; encoding: string; stage: string };
type Measurement = {
  profile: string;
  mobileEmulation: boolean;
  cpuThrottle: number;
  readyMs: number;
  database: string;
  isolation: boolean;
  shellBytes: number;
  deferredBytes: number;
  assets: Asset[];
  pageSpecificJsGzipBytes?: number;
};
const report: Measurement[] = [];
try {
  for (const setting of [
    { profile: "standard", mobile: false },
    { profile: "standard", mobile: true },
    { profile: "compact", mobile: true },
  ]) {
    const { profile, mobile } = setting;
    const context = await browser.newContext({
      viewport: mobile ? { width: 360, height: 800 } : { width: 1280, height: 1000 },
    });
    const page = await context.newPage();
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    }
    const assets: { url: string; bytes: number; encoding: string; stage: string }[] = [];
    let stage = "shell";
    context.on("response", (response) => {
      void response.allHeaders().then((headers) =>
        assets.push({
          url: response.url(),
          bytes: Number(headers["content-length"] ?? 0),
          encoding: headers["content-encoding"] ?? "identity",
          stage,
        }),
      );
    });
    await page.goto("http://127.0.0.1:3002/simple/sql-detective/");
    await page.waitForLoadState("networkidle");
    await page.getByText("Dataset settings", { exact: true }).click();
    await page.getByLabel("Dataset").selectOption(profile);
    stage = "engine";
    const started = performance.now();
    await page.getByRole("button", { name: "Start investigation", exact: true }).click();
    await page.getByRole("button", { name: "Run & explain", exact: true }).waitFor();
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("button")).some(
          (b) => b.textContent === "Run & explain" && !b.disabled,
        ),
      null,
      { timeout: 60000 },
    );
    const readyMs = performance.now() - started;
    await page.getByText("Database and dataset", { exact: true }).click();
    const database = await page
      .getByText("Database and dataset", { exact: true })
      .locator("..")
      .innerText();
    report.push({
      profile,
      mobileEmulation: mobile,
      cpuThrottle: mobile ? 4 : 1,
      readyMs,
      database,
      isolation: await page.evaluate(() => crossOriginIsolated),
      shellBytes: assets.filter((a) => a.stage === "shell").reduce((s, a) => s + a.bytes, 0),
      deferredBytes: assets.filter((a) => a.stage === "engine").reduce((s, a) => s + a.bytes, 0),
      assets,
    });
    await context.close();
  }
  const baselineContext = await browser.newContext();
  const baselinePage = await baselineContext.newPage();
  const baselineUrls = new Set<string>();
  baselineContext.on("response", (response) => baselineUrls.add(response.url()));
  await baselinePage.goto("http://127.0.0.1:3002/");
  await baselinePage.waitForLoadState("networkidle");
  await baselineContext.close();
  for (const sample of report)
    sample.pageSpecificJsGzipBytes = sample.assets
      .filter(
        (a) =>
          a.stage === "shell" &&
          new URL(a.url).pathname.endsWith(".js") &&
          !baselineUrls.has(a.url),
      )
      .reduce((sum, a) => sum + a.bytes, 0);
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/sql-detective-browser-measurements.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
  await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
}
