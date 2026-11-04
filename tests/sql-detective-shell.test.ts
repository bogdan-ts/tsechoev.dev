import { it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SqlDetectiveLab } from "../src/components/sql-detective/lab";
it("does not offer an actionable Start before client hydration", () => {
  const html = renderToStaticMarkup(createElement(SqlDetectiveLab));
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start investigation<\/button>/);
  expect(html).toContain("Investigation progress");
  expect(html).not.toContain("Execution time (median");
});
