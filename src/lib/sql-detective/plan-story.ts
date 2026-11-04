import type { Plan, PlanNode } from "./types";
import { facts } from "./plan-analysis";
export type PlanStage = {
  id: string;
  title: string;
  count: number | null;
  metric: string;
  description: string;
  node: PlanNode;
};
function counter(node: PlanNode | undefined, key = "Actual Rows"): number | null {
  return node && typeof node[key] === "number" && typeof node["Actual Loops"] === "number"
    ? (node[key] as number) * (node["Actual Loops"] as number)
    : null;
}
export function planStory(plan: Plan): PlanStage[] {
  const { scans, sorts } = facts(plan);
  const scan = scans.find((node) => node["Relation Name"] === "orders") ?? scans[0] ?? plan.Plan;
  const indexed = scans.some((node) => typeof node["Index Name"] === "string");
  const output = counter(scan),
    removed = counter(scan, "Rows Removed by Filter");
  const sequential = scan["Node Type"] === "Seq Scan";
  const stages: PlanStage[] = [
    {
      id: "access",
      title: indexed ? "Index access" : sequential ? "Table scan" : "Plan output",
      count: sequential && output !== null && removed !== null ? output + removed : output,
      metric: sequential && removed !== null ? "Tuples checked by scan" : "Rows output by scan",
      description: indexed
        ? "The plan uses an index to reach candidate rows. This does not by itself guarantee date order."
        : sequential
          ? "The sequential scan evaluates the customer filter while reading orders. Finding 20 final rows can still require examining the whole table."
          : "Inspect the reported fields in Plan details. This node does not match a known access pattern, so no table-read estimate is inferred.",
      node: scan,
    },
    {
      id: "matching",
      title: "Matching rows",
      count: output,
      metric: "Rows output by scan",
      description:
        "These rows leave the orders scan. They are not a second set of physical reads. Node counters are per-loop averages multiplied by loops.",
      node: scan,
    },
  ];
  for (const sort of sorts)
    stages.push({
      id: `sort-${stages.length}`,
      title: "Sort",
      count: counter(sort.Plans?.[0]),
      metric: "Rows passed to sort",
      description:
        "The sort must consider its input before it can identify the newest 20 rows. A top-N sort may keep fewer rows in memory, but still examines that input.",
      node: sort,
    });
  stages.push({
    id: "limit",
    title: plan.Plan["Node Type"] === "Limit" ? "Latest 20" : "Final output",
    count: counter(plan.Plan),
    metric: "Rows returned by root",
    description: sorts.length
      ? "The root returns the final rows after the sorting work."
      : "No separate sort exists in this plan. When the index supplies the requested order, Limit can stop after the first rows.",
    node: plan.Plan,
  });
  return stages;
}
