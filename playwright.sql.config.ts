import { defineConfig } from "@playwright/test";
import config from "./playwright.config";
export default defineConfig({ ...config, testMatch: "sql-detective.spec.ts", workers: 1 });
