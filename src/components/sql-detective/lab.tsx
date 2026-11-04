"use client";
import { useState, useEffect, useRef } from "react";
import {
  configurations,
  hints,
  query,
  schema,
  type Configuration,
  type Profile,
} from "../../lib/sql-detective/case-orders";
import { facts, solved, speedup } from "../../lib/sql-detective/plan-analysis";
import { useLab } from "./use-lab";
import { PlanTree } from "./plan-tree";
import { ExecutionIllustration } from "./execution-illustration";
const time = (value: unknown) => (typeof value === "number" ? `${value.toFixed(3)} ms` : "n/a");
export function SqlDetectiveLab() {
  const container = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const root = container.current?.closest(".workspace");
    if (!root) return;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme);
    return () => {
      if (previous === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previous);
    };
  }, [theme]);
  const lab = useLab();
  const [choice, setChoice] = useState<Configuration>("none");
  const [hint, setHint] = useState(0);
  const [copy, setCopy] = useState("");
  const run = lab.selected;
  const baseline = lab.history.find((e) => e.configuration === "none");
  const won = lab.history.some((e) => solved(baseline, e));
  const details = run ? facts(run.median) : undefined;
  const scan = details?.scans.find((node) => node["Relation Name"] === "orders");
  const sortInput = details?.sorts[0]?.Plans?.[0];
  const total = (node: typeof scan, key: string) =>
    node && typeof node[key] === "number" && typeof node["Actual Loops"] === "number"
      ? (node[key] as number) * (node["Actual Loops"] as number)
      : undefined;
  const output = total(scan, "Actual Rows"),
    removed = total(scan, "Rows Removed by Filter"),
    sorted = total(sortInput, "Actual Rows");
  const usable = !!lab.session && !lab.busy && lab.phase !== "error";
  const raw = run ? JSON.stringify(run.samples, null, 2) : "";
  return (
    <div className="detective-lab" ref={container}>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? "Light theme" : "Dark theme"}
      </button>
      <div role="status" aria-live="polite">
        {lab.phase === "idle"
          ? "Start to download and prepare the local database."
          : lab.busy
            ? `${lab.phase}: ${lab.stage}`
            : lab.phase === "error"
              ? "The local database stopped."
              : `Ready · ${lab.session?.rows.toLocaleString()} orders · ${lab.session?.matching.toLocaleString()} for customer 42`}
      </div>
      {lab.busy && <progress aria-label="Database operation in progress" />}
      <label>
        {lab.session ? "Dataset for next reset" : "Dataset"}{" "}
        <select
          disabled={lab.busy}
          value={lab.profile}
          onChange={(e) => lab.setProfile(e.target.value as Profile)}
        >
          <option value="standard">Standard dataset · 100,000 orders</option>
          <option value="compact">Compact dataset · 25,000 orders</option>
        </select>
      </label>
      {!lab.session && !lab.busy && (
        <>
          <button
            onClick={() => {
              setChoice("none");
              setHint(0);
              void lab.start();
            }}
          >
            {lab.phase === "error" ? "Retry" : "Start investigation"}
          </button>
        </>
      )}
      {lab.session && (
        <details>
          <summary>Database and dataset</summary>
          <p>{lab.session.version}</p>
          <p>
            {lab.session.profile} · orders-v1 · preparation including engine loading:{" "}
            {time(lab.session.preparationMs)}
          </p>
          <p>In memory only. Reloading or resetting creates a new session and baseline.</p>
        </details>
      )}
      {lab.busy && (
        <>
          <p>
            Cancel terminates the worker, rebuilds the database and restores the last confirmed
            index. Previous measurements are discarded.
          </p>
          <button onClick={() => void lab.start(true)}>Cancel and restart database</button>
        </>
      )}
      {lab.error && (
        <section role="alert">
          <p>
            The database could not finish this operation. Retry starts a fresh session; the compact
            dataset uses less memory.
          </p>
          <details>
            <summary>Technical details</summary>
            <pre>{lab.error}</pre>
          </details>
          {lab.session && <button onClick={() => void lab.start(true)}>Retry</button>}
        </section>
      )}
      <div className="detective-grid">
        <section>
          <h2>The query</h2>
          <pre tabIndex={0}>{query}</pre>
          <details>
            <summary>Schema</summary>
            <pre tabIndex={0}>{schema}</pre>
          </details>
          <p>A fictional learning case, not a production incident from my work.</p>
          <h2>Experiments</h2>
          <label>
            Index configuration{" "}
            <select
              value={choice}
              disabled={lab.busy}
              onChange={(e) => setChoice(e.target.value as Configuration)}
            >
              {Object.entries(configurations).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          <pre tabIndex={0}>
            {configurations[choice].ddl || "-- no additional index; orders_pkey remains"}
          </pre>
          <p>
            Last confirmed configuration: <strong>{configurations[lab.configuration].label}</strong>
          </p>
          <div className="detective-actions">
            <button
              disabled={!usable || !baseline}
              onClick={() => void lab.operate("apply", choice)}
            >
              Apply index
            </button>
            <button disabled={!usable} onClick={() => void lab.operate("run")}>
              Run &amp; explain
            </button>
            <button
              disabled={lab.busy || lab.phase === "idle"}
              onClick={() => {
                setChoice("none");
                setHint(0);
                void lab.start();
              }}
            >
              Reset case
            </button>
          </div>
          {!baseline && lab.session && (
            <p>Run once with no additional index to establish the baseline.</p>
          )}
          {lab.indexes.length > 0 && (
            <details>
              <summary>Confirmed PostgreSQL indexes</summary>
              {lab.indexes.map((i) => (
                <div key={i.indexname}>
                  <pre>{i.indexdef.toLowerCase()}</pre>
                  <p>{i.bytes.toLocaleString()} bytes</p>
                </div>
              ))}
            </details>
          )}
        </section>
        <section>
          <h2>Plan</h2>
          {run ? (
            <>
              <p>
                Experiment {run.id.split(":").at(-1)} · {configurations[run.configuration].label} ·{" "}
                {run.session.rows.toLocaleString()} orders
              </p>
              {run.configuration !== lab.configuration && (
                <p>
                  This result belongs to the previous configuration. Run again to measure the active
                  index.
                </p>
              )}
              <p>
                Execution time (median of three):{" "}
                <strong>{time(run.median["Execution Time"])}</strong>
                <br />
                Planning time (same sample): {time(run.median["Planning Time"])}
              </p>
              <p className="small muted">
                Measured locally in your browser; results vary by device and cache state.
              </p>
              <p>
                {details?.sorts.length
                  ? "A separate sort remains: finding matching rows and ordering them are separate jobs."
                  : "No separate sort appears in this plan."}{" "}
                {details?.scans.some((n) => n["Node Type"] === "Seq Scan")
                  ? "The plan scans orders sequentially. A sequential scan is not inherently wrong; it can be the cheapest choice for a large fraction of a table."
                  : ""}
              </p>
              <dl>
                {output !== undefined && (
                  <div>
                    <dt>Rows output by scan (node rows × loops)</dt>
                    <dd>{output.toLocaleString()}</dd>
                  </div>
                )}
                {removed !== undefined && (
                  <div>
                    <dt>Rows removed by filter (node rows × loops)</dt>
                    <dd>{removed.toLocaleString()}</dd>
                  </div>
                )}
                {sorted !== undefined && (
                  <div>
                    <dt>Rows passed to sort</dt>
                    <dd>{sorted.toLocaleString()}</dd>
                  </div>
                )}
              </dl>
              <ExecutionIllustration key={run.id} run={run} />
              <ul className="detective-plan">
                <PlanTree node={run.median.Plan} />
              </ul>
              <p>
                Actual Rows is output per loop, not all tuples read. Parent and child counters
                overlap; do not add them together.
              </p>
              <details>
                <summary>Results · 20 orders</summary>
                <div className="detective-scroll">
                  <table>
                    <caption>Same fixed query, ordered by created_at and id</caption>
                    <thead>
                      <tr>
                        {["id", "customer_id", "created_at", "status", "total_cents"].map((k) => (
                          <th key={k} scope="col">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {run.rows.map((row) => (
                        <tr key={row.id}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details>
                <summary>Raw JSON · all three measured plans</summary>
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(raw).then(
                      () => setCopy("Copied JSON"),
                      () => setCopy("Copy unavailable; select the JSON below."),
                    );
                  }}
                >
                  Copy JSON
                </button>
                <span role="status">{copy}</span>
                <pre tabIndex={0}>{raw}</pre>
                <p>
                  Planner costs are arbitrary cost units, not milliseconds. Buffer counters describe
                  PostgreSQL buffers, not physical SSD reads on your device.
                </p>
              </details>
            </>
          ) : (
            <p>Start the database, then run the fixed query to see its actual plan.</p>
          )}
        </section>
      </div>
      {won && (
        <section role="status">
          <h2>Case solved</h2>
          <p>
            The baseline scanned more orders and sorted matching rows before returning 20. A
            customer-only index helps find rows but does not guarantee their date order. The
            composite index narrows to customer 42 and supplies the requested order, so Limit can
            stop reading early.
          </p>
          <p>
            A B-tree can also be read backward: DESC is not mandatory for every descending query.
            Here it makes the intended order explicit. An index takes additional space and adds work
            to inserts, updates and deletes.
          </p>
          <p>Keep experimenting; each result retains its original index configuration.</p>
        </section>
      )}
      {lab.history.length > 0 && (
        <section>
          <h2>Experiment history</h2>
          <div className="detective-scroll">
            <table>
              <caption>One warm-up, three measured EXPLAIN runs, then a separate SELECT</caption>
              <thead>
                <tr>
                  {[
                    "Experiment",
                    "Index / bytes",
                    "Execution median",
                    "Scan / sort",
                    "Same result",
                    "Baseline ratio",
                  ].map((h) => (
                    <th scope="col" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lab.history.map((e, i) => {
                  const f = facts(e.median),
                    ratio = speedup(baseline, e);
                  return (
                    <tr key={e.id}>
                      <td>
                        <button onClick={() => lab.setSelected(e)}>View {i + 1}</button>
                        <br />
                        {configurations[e.configuration].label}
                      </td>
                      <td>
                        {e.indexes
                          .filter((index) => index.indexname !== "orders_pkey")
                          .map((index) => `${index.indexname}: ${index.bytes}`)
                          .join(", ") || "None"}
                      </td>
                      <td>{time(e.median["Execution Time"])}</td>
                      <td>
                        {f.scans.map((n) => n["Node Type"]).join(", ")} /{" "}
                        {f.sorts.length ? "Sort" : "No sort"}
                      </td>
                      <td>{e.matches === null ? "Baseline" : e.matches ? "Yes" : "No"}</td>
                      <td>{ratio ? `${ratio.toFixed(2)}×` : "n/a"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section>
        <h2>Hints</h2>
        {hints.slice(0, hint).map((text) => (
          <p key={text}>{text}</p>
        ))}
        <button disabled={hint >= 3} onClick={() => setHint(hint + 1)}>
          Hint{hint < 3 ? ` ${hint + 1}` : ""}
        </button>
      </section>
    </div>
  );
}
