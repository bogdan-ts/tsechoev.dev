import type { Experiment, Order, Plan, PlanNode } from "./types";
export function nodes(root: PlanNode): PlanNode[] {
  return [root, ...(root.Plans ?? []).flatMap(nodes)];
}
export function normalizeRows(rows: Record<string, unknown>[]): Order[] {
  return rows.map((r) => ({
    id: Number(r.id),
    customer_id: Number(r.customer_id),
    created_at: new Date(String(r.created_at)).toISOString(),
    status: String(r.status),
    total_cents: Number(r.total_cents),
  }));
}
export function sameRows(a: Order[], b: Order[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}
export function medianPlan(plans: Plan[]): Plan {
  if (
    plans.length !== 3 ||
    plans.some(
      (p) => typeof p["Execution Time"] !== "number" || !Number.isFinite(p["Execution Time"]),
    )
  )
    throw new Error("Expected three measured plans");
  const value = plans.map((p) => p["Execution Time"] as number).sort((a, b) => a - b)[1];
  const plan = plans.find((p) => p["Execution Time"] === value);
  if (!plan) throw new Error("Missing median plan");
  return plan;
}
export function speedup(baseline: Experiment | undefined, run: Experiment): number | null {
  const a = baseline?.median["Execution Time"],
    b = run.median["Execution Time"];
  return baseline?.session.id === run.session.id &&
    typeof a === "number" &&
    typeof b === "number" &&
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    a > 0 &&
    b > 0
    ? a / b
    : null;
}
export function facts(plan: Plan) {
  const all = nodes(plan.Plan);
  return {
    scans: all.filter((n) => n["Node Type"].includes("Scan")),
    sorts: all.filter((n) => /Sort/.test(n["Node Type"])),
  };
}
export function solved(baseline: Experiment | undefined, run: Experiment) {
  if (
    !baseline ||
    baseline.configuration !== "none" ||
    baseline.samples.length !== 3 ||
    baseline.session.id !== run.session.id ||
    run.samples.length !== 3 ||
    run.rows.length !== 20 ||
    !sameRows(baseline.rows, run.rows)
  )
    return false;
  const { scans, sorts } = facts(run.median);
  return (
    !sorts.length &&
    !scans.some((n) => n["Relation Name"] === "orders" && n["Node Type"] === "Seq Scan") &&
    scans.some(
      (n) =>
        ["Index Scan", "Index Only Scan"].includes(n["Node Type"]) &&
        n["Relation Name"] === "orders" &&
        n["Index Name"] === "detective_customer_latest_idx" &&
        /customer_id\s*=\s*42/.test(String(n["Index Cond"])),
    )
  );
}
