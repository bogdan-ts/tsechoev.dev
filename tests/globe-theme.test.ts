import { expect, it } from "vitest";
import { globeOpacity } from "../src/lib/globe-theme";
it("retains shadow detail on a light background without changing dark rendering", () => {
  expect(globeOpacity(0, true)).toBe(0.55);
  expect(globeOpacity(1, true)).toBe(1);
  expect(globeOpacity(0.5, false)).toBe(0.58);
});
