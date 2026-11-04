# SQL Detective — Case 001

## Run and validate

Use the Node version in `.nvmrc`, then:

```sh
npm ci
npm run check
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
npm run preview
```

For isolated database-browser checks use
`npx playwright test --config playwright.sql.config.ts`. To reproduce local
compressed delivery measurements after building, run
`node --experimental-strip-types scripts/measure-sql-detective.ts`.

Open `/simple/sql-detective/`. `investigate` and `investigate orders` show a
link, not another database in terminal scrollback. The shell, query, schema,
navigation and case description are static HTML. A noscript message explains
why the interactive investigation needs JavaScript.

The branch must not be merged/deployed just to validate the engine. PR CI runs
validation only; the Pages deployment job is restricted to main, outside PRs.

## Engine and asset pipeline

Pinned `@electric-sql/pglite` 0.5.15 (ElectricSQL), reporting PostgreSQL 18.6.
The technical prototype was tested from `out/` using sirv over ordinary HTTP.
`crossOriginIsolated` was false, with no COOP/COEP, SharedArrayBuffer requirement,
service worker, backend, CDN or special host headers.

Next 16's standard `new Worker(new URL(..., import.meta.url))` pipeline resolves
the package JS, pglite.wasm, initdb.wasm and pglite.data into content-hashed static
artifacts. No manual node_modules paths, deprecated Next options or copied assets
are required. PGlite imports exist only in the worker's database module. Merely
loading/prefetching the route does not create the worker or request its assets.
The engine is started by the explicit button, not a mount effect.

Updating PGlite requires updating the exact package + lockfile, building a fresh
export and rerunning the browser/plan tests. Deploy the entire out directory
atomically. Do not combine old worker JS with new data/WASM. HTTP caching is fine;
there is no promise of offline availability after a reload. The case sends no SQL
or results to a remote database and adds no telemetry.

## Dataset and experiment contract

`case-orders.ts` is the single source for orders-v1, SQL, profiles, whitelist DDL
and hints. SQL generates 100,000 rows (standard) or 25,000 (explicit compact).
Customer 42 gets exactly 5%, interleaved every twentieth row. Modular timestamps
break correlation with heap order. Both row counts are checked after seeding.
No random/current-time values enter the dataset. ANALYZE can sample statistics;
minor row estimates and timings may differ between sessions.

A primary key is always retained. Switching indexes drops only the three known
extra indexes and creates the selection in a PostgreSQL transaction. The catalog
is reread and checked before confirming the active configuration. Index size is
pg_relation_size; DDL/build time is outside query execution measurements.

Each experiment performs one EXPLAIN ANALYZE warm-up, three measured JSON
EXPLAIN ANALYZE calls with buffers and timing off, then a separate SELECT.
All measured plans are retained; the first sample equal to the median execution
time supplies the displayed plan and planning time. SELECT time is not included.
Dates become UTC ISO strings, ids and cents become JSON numbers; the ordered
20-row result is compared with the session baseline. No bigint crosses RPC.

Speed ratios are only computed for positive finite times in the same session.
They are not rankings or production SLA predictions. Zero/absent values are n/a.
Planner costs are not milliseconds. Buffers are PostgreSQL buffer counters, not
physical browser-device SSD reads. Node Actual Rows is per-loop output; filter
averages are also per loop. Parent and child values overlap and are not summed
into a fictitious global rows-read metric.

Observed real standard-profile plan families (integration run):

| Configuration            | Actual scan family                        | Separate sort | Example median execution |
| ------------------------ | ----------------------------------------- | ------------- | ------------------------ |
| None                     | Seq Scan                                  | Sort          | 21.092 ms                |
| By customer              | Bitmap Heap Scan → Bitmap Index Scan      | Sort          | 8.954 ms                 |
| By status                | Seq Scan                                  | Sort          | 20.720 ms                |
| Customer + latest orders | Index Scan, detective_customer_latest_idx | None          | 0.157 ms                 |

These are observations from one Linux server run, not expected timings or
fixtures used by the application. Tests assert plan properties and identical
results, never these numbers. Integration evidence is written into test-results.
The run used an AMD EPYC virtual host reporting four CPUs and about 8 GB RAM.

A win requires a fresh complete no-index baseline, the same session and same
20 ordered rows, and a real suitable orders index scan without Sort/Incremental
Sort or an orders sequential scan. It does not depend on a speed threshold.
The final explanation covers index write/storage costs, reverse B-tree scans,
and why a sequential scan is not inherently a mistake.

## Worker ownership, cancellation and recovery

A lab owns one dedicated worker and one in-memory database. Worker commands are
serialized. Main-thread RPC has monotonic request/generation ids, validates
response shapes, ignores stale replies and rejects conflicting requests.
Watchdogs: 60 seconds initialization, 20 seconds subsequent operations. They run
on the main thread, not inside a potentially blocked WASM worker.

Cancel terminates the worker immediately, discards measurements and creates a
new database session. If an extra index had been confirmed, recovery measures a
new no-index baseline before restoring that index. The UI explains this reset.
Reset case uses a new worker/session and returns to no additional index. Retry
also starts a new session, never reusing old benchmark numbers. Unmount terminates
the worker and clears pending RPC timers; Strict Mode cannot auto-start engines.
No database or timings are persisted. Dataset selection applies to the next reset.

## Illustration and accessibility

The illustration uses 120 aggregated cells and a short sequence selected from
the actual scan/sort tree. It is not physical row-visit tracing, and its 2–4 second
playback is not query runtime. Plan text and exact node counters remain readable
independently of the animation. Reduced motion immediately shows the final state
and disables replay/movement. Every run is an immutable configuration snapshot;
applying another index never relabels the preceding plan.

Keyboard-accessible native controls, visible focus, labelled selects, real result
and comparison tables, scoped SQL/JSON overflow and polite status updates preserve
the site's typography/themes. Raw JSON includes all three measured plans and can
be selected/copied. Unknown plan nodes retain their own fields/children rather
than breaking the page. Navigation and the case shell work without JavaScript.

## Measurements and browser matrix

The reproducible `scripts/measure-sql-detective.ts` serves out over loopback HTTP
with ordinary gzip transport and correct application/wasm MIME, without isolation
headers. It records actual response Content-Length/Content-Encoding, initial shell
bytes separately from deferred assets, and wall time from Start to ready. This is
not a measurement of GitHub Pages compression or a simulated production SLA.

Raw engine files: pglite.wasm 9,086,480 B; initdb.wasm 298,788 B;
pglite.data 6,242,272 B, plus the deferred worker JS. Gzip estimates for those
three files alone: 3,290,364 + 131,377 + 2,131,246 B. A plain uncompressed static
server transfers more than 15 MB; checking only the WASM would undercount it.
Initial implementation: measured gzip HTTP payloads from a fresh desktop session totalled **5,706,829 B**
after Start; another **16,194,282 B raw** corresponds to those exact files, including
worker runtime and JS chunks. Mobile-emulation samples include some late shared
prefetch assets and conservatively measured up to **5,749,267 B**. No .gz files or
custom production host headers were added.

Before the game-flow revision, the SQL-page-specific JavaScript difference against a fresh terminal-page load
was **7,262 B gzip**. Whole initial shell traffic was 184–227 KB gzip including
framework, fonts, HTML and prefetch traffic; that is not all newly added page UI.

Two isolated measurement runs on this host observed:

| Profile / browser setup                         | Start → Ready, including transfer and initialization |
| ----------------------------------------------- | ---------------------------------------------------- |
| Standard, Chromium 1280×1000                    | 8.32–8.95 s                                          |
| Standard, 360×800 and CDP 4× page CPU emulation | 9.31–9.54 s                                          |
| Compact, 360×800 and CDP 4× page CPU emulation  | 6.85–8.48 s                                          |

The CDP rate is a requested emulation setting, not a calibrated phone or guarantee
that all worker/native compilation work is slowed identically. These are local
HTTP compressed-body measurements, excluding HTTP header overhead. The script
serves gzip dynamically, so its compression CPU cost is included in startup.
The five-second desktop preparation target is **not proven**: asset acquisition,
WASM compilation/initdb and SQL generation overlap and are not independently
profiled here. Compact reduces SQL generation work but does not reduce the engine
payload or fixed PostgreSQL initialization. An actual phone/Pages download and
post-download breakdown remain release checks; do not relabel these figures as
pure SQL seed time or claim all performance targets are met. Initial prototype preparation was 7–10 seconds
including asset loading/initialization under concurrent build/test load; the
5-second desktop target is not assumed satisfied by that observation.

Chromium 156.0.8078.4 desktop and 375px emulated mobile, Firefox 157.0 automation and WebKit 27.2 automation
are required by the browser suite. WebKit automation is not physical Safari/iPhone.
No physical phone, Safari device or manual screen-reader audit is claimed.

## Before a real Pages release

Public Pages has NOT been used to verify this feature and must not be silently
published. After an explicitly approved merge/release:

1. Open the deep link and reload it; check canonical/sitemap and trailing slash.
2. Confirm no engine files download before Start or on Atlas/the terminal.
3. Inspect same-origin worker/WASM/data URLs, status, content type and actual
   compressed transfer bytes. A 200 response containing fallback HTML is a failure.
4. Run baseline and composite-index experiments, inspect raw plans and identical
   results, test Cancel/Retry and navigate away/back.
5. Check mobile hardware, both themes, reduced motion and browser zoom at 200%.

## Extending later

Do not add a plugin framework for one case. A second case can supply its own
schema/seed/query/index whitelist/hints module, reuse the typed worker transport
and tree renderer, and provide a separate pure solution predicate. Include case,
seed and profile versions in session identity; add real-engine plan/result tests
before writing its teaching text. Avoid adding free-form SQL implicitly.

References: [PGlite API](https://pglite.dev/docs/api),
[bundler support](https://pglite.dev/docs/bundler-support),
[PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html),
[reading plans](https://www.postgresql.org/docs/current/using-explain.html),
[B-tree ordering](https://www.postgresql.org/docs/current/indexes-ordering.html).

## Verification record

- `npm run check`: lint, strict typecheck and 65 unit/integration tests pass.
- The standard-profile real-engine test covers all four configurations and ordered
  result identity. Another test rebuilds compact twice, checks counts/reproducibility,
  and verifies the composite plan. Median ties, zero values, stale generations,
  invalid RPC, watchdog termination and unknown plan-node rendering have unit coverage.
- The static browser matrix exercises actual SQL, plan-based solution, dark/light
  axe checks, 200% CSS zoom, reduced motion, missing WASM + watchdog + Retry/Cancel,
  unmount/re-entry, no-JavaScript navigation and absence of pre-Start engine requests.
- Existing Atlas/CV/terminal tests are retained. No real Pages deployment or real
  iPhone/Safari device has been used. Physical low-memory/mobile behavior remains
  unverified. The game-flow full browser run passed 44 tests and skipped one duplicate desktop touch test. Its remaining desktop drag test needed an explicit centered scroll before native drag (both targets must stay visible). After that adjustment, all four desktop SQL tests passed on the rebuilt static export. Together these cover the 45 non-skipped scenarios; the touch flow runs on mobile.

## Game-flow UI revision

The case is presented as three moves: reveal the baseline, try an index, explain
the changed plan. Index choices appear after the first real run. Cards can be
dragged onto the query; native radio controls and Apply index are the equivalent
keyboard/touch path. Applying an index does not run a fake benchmark or relabel
the previous result. Every new run still uses the same worker protocol.

The board's stages and counters come from `plan-story.ts`. A sequential scan's
checked-tuples illustration uses reported output + filtered rows, with loops;
index/bitmap paths report scan output instead of inventing a physical-read count.
A Sort card exists only when the actual tree contains a sort. Clicking a stage
pauses playback and exposes that node's explanation and metric. Reduced motion
starts at the final state but still allows manual node inspection.

A run picker switches the whole board between immutable experiments. Detailed
plan fields, results and raw JSON are separate inspection views; the full history
remains available in a disclosure. Victory uses the unchanged pure solution
predicate, not a timer, quiz, points total or promised acceleration. Reset starts
a fresh case as before. The Start action is disabled in server HTML until client
hydration so early clicks cannot disappear before event handlers are installed.

The browser scenario also exercises native card drag/drop on desktop, keyboard/touch
index selection, clicking the Sort and Index access stages, switching inspection
views, and manual stage inspection with reduced motion. A server-render test
asserts that the Start boundary is disabled before hydration.
