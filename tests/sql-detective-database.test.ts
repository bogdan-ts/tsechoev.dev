// @vitest-environment node
import { mkdir, writeFile } from "node:fs/promises";
import { it, expect } from "vitest";
import { InvestigationDatabase } from "../src/lib/sql-detective/database";
import { facts, solved, sameRows } from "../src/lib/sql-detective/plan-analysis";
import type { Configuration } from "../src/lib/sql-detective/case-orders";
it("runs all configurations against real PostgreSQL with identical results", async () => {
  const db = await InvestigationDatabase.initialize("standard", () => {});
  try {
    expect(db.session.rows).toBe(100000);
    expect(db.session.matching).toBe(5000);
    const baseline = await db.run();
    expect(facts(baseline.median).scans.some((n) => n["Node Type"] === "Seq Scan")).toBe(true);
    expect(facts(baseline.median).sorts.length).toBeGreaterThan(0);
    const measurements = [];
    for (const configuration of ["customer", "status", "latest"] satisfies Configuration[]) {
      const indexes = await db.apply(configuration);
      expect(indexes.some((i) => i.indexname === "orders_pkey")).toBe(true);
      const run = await db.run();
      expect(sameRows(run.rows, baseline.rows)).toBe(true);
      expect(solved(baseline, run)).toBe(configuration === "latest");
      measurements.push({
        configuration,
        execution: run.median["Execution Time"],
        nodes: facts(run.median),
      });
    }
    await db.apply("none");
    expect((await db.indexes()).map((i) => i.indexname)).toEqual(["orders_pkey"]);
    await mkdir("test-results", { recursive: true });
    await writeFile(
      "test-results/sql-detective-integration.json",
      JSON.stringify({ session: db.session, baseline: baseline.median, measurements }, null, 2),
    );
  } finally {
    await db.close();
  }
}, 60000);

it("recreates a deterministic compact dataset with a fresh baseline and only the primary index", async () => {
  let previous: Awaited<ReturnType<InvestigationDatabase["run"]>> | undefined;
  for (let i = 0; i < 2; i++) {
    const db = await InvestigationDatabase.initialize("compact", () => {});
    try {
      expect(db.session.rows).toBe(25000);
      expect(db.session.matching).toBe(1250);
      expect((await db.indexes()).map((index) => index.indexname)).toEqual(["orders_pkey"]);
      const run = await db.run();
      if (previous) {
        expect(sameRows(previous.rows, run.rows)).toBe(true);
        expect(previous.session.id).not.toBe(run.session.id);
      }
      previous = run;
      await db.apply("latest");
      expect(solved(run, await db.run())).toBe(true);
    } finally {
      await db.close();
    }
  }
}, 60000);
