"use client";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
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
const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;
const time = (value: unknown) => (typeof value === "number" ? `${value.toFixed(3)} ms` : "n/a");
export function SqlDetectiveLab() {
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
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
  useEffect(() => {
    if (!run) return;
    const panel = container.current?.querySelector<HTMLElement>(".detective-result-panel");
    panel?.scrollIntoView({ block: "start", behavior: "auto" });
    panel?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [run]);
  const baseline = lab.history.find((e) => e.configuration === "none");
  const winner = lab.history.find((e) => solved(baseline, e));
  const won = !!winner;
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
  const [panel, setPanel] = useState<"story" | "plan" | "results" | "json">("story");
  const raw = run ? JSON.stringify(run.samples, null, 2) : "";
  return (
    <div className="detective-lab" data-started={!!lab.session || lab.busy} ref={container}>
      <div className="detective-toolbar">
        <span className="detective-kicker">CASE 001 / QUERY LAB</span>
        <button disabled={!hydrated} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
      </div>
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
      <details className="detective-settings">
        <summary>Dataset settings</summary>
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
      </details>
      {!lab.session && !lab.busy && (
        <>
          <button
            className="detective-primary detective-start"
            disabled={!hydrated}
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
      <ol className="detective-journey" aria-label="Investigation progress">
        <li aria-current={!baseline ? "step" : undefined}>
          <span>01</span>
          <strong>Find the bottleneck</strong>
          <small>{baseline ? "Baseline captured" : "Run the query without an index"}</small>
        </li>
        <li aria-current={baseline && !won ? "step" : undefined}>
          <span>02</span>
          <strong>Try an index</strong>
          <small>Compare the work, not just the time</small>
        </li>
        <li aria-current={won ? "step" : undefined}>
          <span>03</span>
          <strong>Explain the change</strong>
          <small>{won ? "Case solved" : "Same 20 rows. Less work?"}</small>
        </li>
      </ol>
      <section className="detective-objective" aria-label="Current objective">
        <span className="detective-kicker">YOUR MOVE</span>
        <h2>
          {won
            ? "Case closed. Keep experimenting."
            : !lab.session
              ? "Find the work hidden behind 20 orders."
              : !baseline
                ? "Run the query. Reveal the bottleneck."
                : "Try an index. Watch the plan change."}
        </h2>
        <p>
          {!lab.session
            ? "Open the case to prepare a local PostgreSQL database."
            : !baseline
              ? "Your first run records the plan without an extra index."
              : won
                ? "The real plan supplies the requested order and returns the same 20 rows."
                : "Choose a card, apply it to the query, then run again. Can you remove a step without changing the result?"}
        </p>
      </section>
      <div className="detective-grid" hidden={!lab.session && !lab.busy}>
        <section className="detective-query-panel">
          <span className="detective-kicker">THE EVIDENCE</span>
          <h2>The query</h2>
          <pre tabIndex={0}>{query}</pre>
          <details>
            <summary>Schema</summary>
            <pre tabIndex={0}>{schema}</pre>
          </details>
          <p className="small muted">A fictional learning case.</p>
          <div hidden={!baseline}>
            <h2>Choose your next move</h2>
            <p className="small muted">Drag a card onto the query, or select it and apply.</p>
            <fieldset className="detective-index-options" disabled={lab.busy}>
              <legend>Choose an index to test</legend>
              {Object.entries(configurations).map(([key, value]) => (
                <label
                  key={key}
                  data-selected={choice === key}
                  draggable={!!baseline && !lab.busy}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", key)}
                >
                  <input
                    type="radio"
                    name="detective-index"
                    value={key}
                    checked={choice === key}
                    onChange={() => setChoice(key as Configuration)}
                  />
                  <span>
                    <strong>{value.label}</strong>
                    <small>
                      {key === "none"
                        ? "Keep only the primary key"
                        : key === "customer"
                          ? "Locate this customer’s orders"
                          : key === "status"
                            ? "Index a different column"
                            : "Filter by customer, then read newest first"}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div
              className="detective-dropzone"
              onDragOver={(event) => {
                if (usable && baseline) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                const key = event.dataTransfer.getData("text/plain");
                if (usable && baseline && Object.hasOwn(configurations, key)) {
                  setChoice(key as Configuration);
                  void lab.operate("apply", key as Configuration);
                }
              }}
            >
              <span aria-hidden="true">＋</span>
              <strong>Apply an index to this query</strong>
              <small>Drop a card here · keyboard: select a card, then Apply index</small>
            </div>
            <pre tabIndex={0}>
              {configurations[choice].ddl || "-- no additional index; orders_pkey remains"}
            </pre>
            <p>
              Last confirmed configuration:{" "}
              <strong>{configurations[lab.configuration].label}</strong>
            </p>
          </div>
          <div className="detective-actions detective-main-actions">
            <button
              disabled={!usable || !baseline}
              onClick={() => void lab.operate("apply", choice)}
            >
              Apply index
            </button>
            <button
              className="detective-primary"
              disabled={!usable}
              onClick={() => {
                setPanel("story");
                void lab.operate("run");
              }}
            >
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
          <section className="detective-hints">
            <h2>Hints</h2>
            {hints.slice(0, hint).map((text) => (
              <p key={text}>{text}</p>
            ))}
            <button disabled={hint >= 3} onClick={() => setHint(hint + 1)}>
              Hint{hint < 3 ? ` ${hint + 1}` : ""}
            </button>
          </section>
        </section>
        <section className="detective-result-panel">
          <span className="detective-kicker">THE INVESTIGATION</span>
          <h2 tabIndex={-1}>Query plan</h2>
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
              </p>
              <p className="small muted">
                Measured locally in your browser; results vary by device and cache state.
              </p>
              <p>
                {details?.sorts.length
                  ? "A separate sort remains."
                  : "No separate sort appears in this plan."}{" "}
                {details?.scans.some((n) => n["Node Type"] === "Seq Scan")
                  ? "The plan scans orders sequentially."
                  : ""}
              </p>
              <button
                className="detective-next-move"
                disabled={lab.busy}
                onClick={() => {
                  const input = container.current?.querySelector<HTMLInputElement>(
                    ".detective-index-options input:checked",
                  );
                  input?.focus();
                  input?.scrollIntoView({ block: "center" });
                }}
              >
                {won ? "Try another index" : "Choose your next index"}
              </button>
              <div className="detective-run-picker" role="group" aria-label="Compare experiments">
                {lab.history.map((experiment, i) => (
                  <button
                    key={experiment.id}
                    aria-pressed={experiment.id === run.id}
                    onClick={() => {
                      lab.setSelected(experiment);
                      setPanel("story");
                    }}
                  >
                    <small>RUN {i + 1}</small>
                    <strong>{configurations[experiment.configuration].label}</strong>
                  </button>
                ))}
              </div>
              <div className="detective-view-switch" role="group" aria-label="Result view">
                {(
                  [
                    ["story", "Data flow"],
                    ["plan", "Plan details"],
                    ["results", "20 results"],
                    ["json", "Raw JSON"],
                  ] as const
                ).map(([key, label]) => (
                  <button key={key} aria-pressed={panel === key} onClick={() => setPanel(key)}>
                    {label}
                  </button>
                ))}
              </div>
              <div hidden={panel !== "story"}>
                {" "}
                <ExecutionIllustration key={run.id} run={run} />
              </div>
              <div hidden={panel !== "plan"}>
                <p>Planning time (same median sample): {time(run.median["Planning Time"])}</p>
                <p>
                  A sequential scan is not inherently wrong: it can be the cheapest choice when
                  reading a large fraction of a table.
                </p>{" "}
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
                <ul className="detective-plan">
                  <PlanTree node={run.median.Plan} />
                </ul>
                <p>
                  Actual Rows is output per loop, not all tuples read. Parent and child counters
                  overlap; do not add them together.
                </p>
              </div>
              <div hidden={panel !== "results"}>
                <details open>
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
              </div>
              <div hidden={panel !== "json"}>
                <details open>
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
                    Planner costs are arbitrary cost units, not milliseconds. Buffer counters
                    describe PostgreSQL buffers, not physical SSD reads on your device.
                  </p>
                </details>
              </div>
            </>
          ) : (
            <div className="detective-empty">
              <div aria-hidden="true">□ → ◇ → 20</div>
              <h3>Follow the query, step by step.</h3>
              <p>
                Start the database, then run the fixed query to reveal where PostgreSQL spends its
                work.
              </p>
            </div>
          )}
        </section>
      </div>
      {won && (
        <section className="detective-solved" role="status">
          <span className="detective-kicker">INVESTIGATION COMPLETE</span>
          <h2>Case solved</h2>
          <div className="detective-comparison">
            <div>
              <small>Baseline execution</small>
              <strong>{time(baseline?.median["Execution Time"])}</strong>
            </div>
            <span aria-hidden="true">→</span>
            <div>
              <small>Winning experiment</small>
              <strong>{time(winner?.median["Execution Time"])}</strong>
            </div>
          </div>
          <details>
            <summary>Why this worked</summary>
            <p>
              The baseline scanned more orders and sorted matching rows before returning 20. A
              customer-only index helps find rows but does not guarantee their date order. The
              composite index narrows to customer 42 and supplies the requested order, so Limit can
              stop reading early.
            </p>
            <p>
              A B-tree can also be read backward: DESC is not mandatory for every descending query.
              Here it makes the intended order explicit. An index takes additional space and adds
              work to inserts, updates and deletes.
            </p>
            <p>Keep experimenting; each result retains its original index configuration.</p>
          </details>
        </section>
      )}
      {lab.history.length > 0 && (
        <details className="detective-history">
          <summary>Detailed experiment history · {lab.history.length} runs</summary>
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
        </details>
      )}
    </div>
  );
}
