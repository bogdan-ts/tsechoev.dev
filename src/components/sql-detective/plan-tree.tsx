import type { PlanNode } from "../../lib/sql-detective/types";
const fields = [
  "Relation Name",
  "Index Name",
  "Plan Rows",
  "Actual Rows",
  "Actual Loops",
  "Rows Removed by Filter",
  "Rows Removed by Index Recheck",
  "Index Cond",
  "Filter",
  "Sort Key",
  "Sort Method",
];
export function PlanTree({ node }: { node: PlanNode }) {
  const known = [
    "Limit",
    "Sort",
    "Incremental Sort",
    "Seq Scan",
    "Index Scan",
    "Index Only Scan",
    "Bitmap Heap Scan",
    "Bitmap Index Scan",
  ].includes(node["Node Type"]);
  const visible = known
    ? fields
    : Object.keys(node).filter((key) => key !== "Plans" && key !== "Node Type");
  return (
    <li>
      <strong>{node["Node Type"]}</strong>
      <dl>
        {visible
          .filter((key) => node[key] !== undefined)
          .map((key) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>
                {Array.isArray(node[key]) ? (node[key] as unknown[]).join(", ") : String(node[key])}
              </dd>
            </div>
          ))}
      </dl>
      {node.Plans?.length ? (
        <ul>
          {node.Plans.map((child, i) => (
            <PlanTree key={i} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
