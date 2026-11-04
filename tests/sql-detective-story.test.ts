import { describe, it, expect } from "vitest";
import { planStory } from "../src/lib/sql-detective/plan-story";
describe("game flow from real plan data", () => {
  it("shows scan/filter/sort/limit without double-counting tuples", () => {
    const stages = planStory({
      Plan: {
        "Node Type": "Limit",
        "Actual Rows": 20,
        "Actual Loops": 1,
        Plans: [
          {
            "Node Type": "Sort",
            "Actual Rows": 20,
            "Actual Loops": 1,
            Plans: [
              {
                "Node Type": "Seq Scan",
                "Relation Name": "orders",
                "Actual Rows": 5000,
                "Rows Removed by Filter": 95000,
                "Actual Loops": 1,
              },
            ],
          },
        ],
      },
    });
    expect(stages.map((s) => [s.title, s.count])).toEqual([
      ["Table scan", 100000],
      ["Matching rows", 5000],
      ["Sort", 5000],
      ["Latest 20", 20],
    ]);
  });
  it("omits sort only when absent and does not invent missing counts", () => {
    const stages = planStory({
      Plan: {
        "Node Type": "Limit",
        "Actual Rows": 20,
        "Actual Loops": 1,
        Plans: [
          {
            "Node Type": "Index Scan",
            "Relation Name": "orders",
            "Index Name": "detective_customer_latest_idx",
            "Actual Rows": 20,
            "Actual Loops": 1,
          },
        ],
      },
    });
    expect(stages.some((s) => s.title === "Sort")).toBe(false);
    expect(stages[0].title).toBe("Index access");
    expect(stages[0].count).toBe(20);
    const unknown = planStory({ Plan: { "Node Type": "Future Node" } });
    expect(unknown[0].count).toBeNull();
    expect(unknown[0].title).toBe("Plan output");
    expect(unknown[0].description).not.toContain("sequential scan");
    expect(unknown.at(-1)?.title).toBe("Final output");
  });
});
