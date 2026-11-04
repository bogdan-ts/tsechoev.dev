import { describe, it, expect } from "vitest";
import { nodes, medianPlan, sameRows, normalizeRows } from "../src/lib/sql-detective/plan-analysis";
import type { Plan } from "../src/lib/sql-detective/types";
describe("SQL Detective analysis", () => {
  it("walks unknown nodes and preserves absent metrics", () => {
    const root = { "Node Type": "Future Node", Plans: [{ "Node Type": "Seq Scan" }] };
    expect(nodes(root)).toHaveLength(2);
    expect(nodes(root)[1]["Actual Rows"]).toBeUndefined();
  });
  it("selects the first plan at the median including ties and zeros", () => {
    const plans: Plan[] = [3, 0, 0].map((time) => ({
      Plan: { "Node Type": "Limit" },
      "Execution Time": time,
    }));
    expect(medianPlan(plans)).toBe(plans[1]);
    expect(() => medianPlan(plans.slice(1))).toThrow();
  });
  it("normalizes dates but preserves result order", () => {
    const r = {
      id: 1,
      customer_id: 42,
      created_at: "2025-01-01T00:00:00Z",
      status: "paid",
      total_cents: 100,
    };
    const a = normalizeRows([r, { ...r, id: 2 }]);
    expect(
      sameRows(
        a,
        normalizeRows([
          { ...r, created_at: "2025-01-01T00:00:00+00:00" },
          { ...r, id: 2 },
        ]),
      ),
    ).toBe(true);
    expect(sameRows(a, [...a].reverse())).toBe(false);
  });
});

import { solved, speedup } from "../src/lib/sql-detective/plan-analysis";
import type { Experiment } from "../src/lib/sql-detective/types";
const fixture = (): Experiment => {
  const plan: Plan = {
    Plan: {
      "Node Type": "Index Scan",
      "Relation Name": "orders",
      "Index Name": "detective_customer_latest_idx",
      "Index Cond": "(customer_id = 42)",
    },
    "Execution Time": 1,
  };
  return {
    id: "run",
    session: {
      id: "session",
      profile: "compact",
      rows: 25000,
      matching: 1250,
      version: "test",
      preparationMs: 1,
    },
    configuration: "latest",
    indexes: [],
    samples: [plan, plan, plan],
    median: plan,
    rows: Array.from({ length: 20 }, (_, id) => ({
      id,
      customer_id: 42,
      created_at: "2025-01-01T00:00:00.000Z",
      status: "paid",
      total_cents: 100,
    })),
    matches: true,
  };
};
it("requires a complete comparable baseline, identical rows and an ordered index plan", () => {
  const run = fixture(),
    baseline = { ...fixture(), configuration: "none" as const };
  expect(solved(baseline, run)).toBe(true);
  expect(solved(undefined, run)).toBe(false);
  expect(solved(baseline, { ...run, rows: [...run.rows].reverse() })).toBe(false);
  expect(solved(baseline, { ...run, samples: [] })).toBe(false);
  expect(
    solved(baseline, {
      ...run,
      median: { Plan: { "Node Type": "Sort", Plans: [run.median.Plan] } },
    }),
  ).toBe(false);
  expect(solved(baseline, { ...run, session: { ...run.session, id: "other" } })).toBe(false);
});
it("does not claim speedup across sessions or with zero/missing times", () => {
  const run = fixture();
  expect(speedup(run, run)).toBe(1);
  expect(speedup(undefined, run)).toBeNull();
  expect(speedup(run, { ...run, median: { ...run.median, "Execution Time": 0 } })).toBeNull();
  expect(speedup(run, { ...run, session: { ...run.session, id: "other" } })).toBeNull();
});

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { PlanTree } from "../src/components/sql-detective/plan-tree";
it("renders unknown plan-node fields and children without inventing counters", () => {
  const html = renderToStaticMarkup(
    createElement(PlanTree, {
      node: { "Node Type": "Future Scan", "Future Metric": 17, Plans: [{ "Node Type": "Limit" }] },
    }),
  );
  expect(html).toContain("Future Metric");
  expect(html).toContain("17");
  expect(html).toContain("Limit");
  expect(html).not.toContain("Actual Rows");
});
