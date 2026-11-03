# Code review — 2026-11-03

## Scope

Reviewed application routes, all source components/hooks/domain modules, Canvas
and geography generation, tests, configuration, dependency declarations and the
Pages workflow. Profile facts, command names, URLs, static hosting and visual
behavior are preserved. Binary CV/image assets were not rewritten.

## Findings addressed

| Finding                                                        | Change                                                                      | Verification                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Batched commands lost prior history through a stale closure    | Pure terminal reducer with ordered state transitions                        | Regression reproduced before the fix, now passes                |
| IME composition triggered recall/submission                    | Composition lifecycle guards; preserve the browser-native Cmd+L shortcut    | Composition regression test                                     |
| Typing re-rendered historical profile content                  | Stable command callback and memoized output                                 | Existing command/recall/scrollback flows                        |
| One terminal hook mixed domain, caret and scroll logic         | Dedicated reducer, cursor and scroll synchronization hooks                  | Unit and desktop/mobile browser tests                           |
| Globe lifecycle, input and rendering were coupled              | Environment, pointer and Canvas resource hooks; small animation coordinator | Pause, visibility, reduced motion, high-refresh and touch tests |
| Frame rendering measured computed styles repeatedly            | Renderer-owned font metrics refreshed only on setup/theme/font readiness    | Unit test checks no font measurement in the frame loop          |
| Canvas contexts and cache access relied on non-null assertions | Explicit resource checks, owned bounded sprite cache and disposal           | Context-unavailable unit/browser fallback tests                 |
| Lazy chunk/render errors could remove surrounding content      | Local globe error boundary with reload action                               | Error-isolation regression test                                 |
| Simple routes inherited the root Open Graph URL                | Shared metadata builder with per-route canonical/OG URLs                    | All three routes checked in Chromium                            |
| e2e files were outside TypeScript checks                       | Include e2e and enable unused/return/fallthrough checks                     | Typecheck and static build                                      |
| Formatting/lint rules were not enforced                        | Prettier, Next/TypeScript/React ESLint rules, zero-warning CI gate          | `npm run check`                                                 |
| Dependency declarations used floating versions                 | Exact direct versions, lockfile and Node version/engine contract            | Clean-install check and CI                                      |
| Browser failures were hard to diagnose                         | Retained traces/screenshots and CI failure artifacts                        | Playwright configuration                                        |
| Accessibility had no automated gate                            | axe checks for every page at desktop/mobile sizes                           | Browser suite                                                   |

## Verification

- Formatting, zero-warning lint, strict typecheck and static export pass.
- 46 unit tests and 25 browser tests pass. One duplicate desktop touch test is
  intentionally skipped; the touch scenario runs in the mobile project.
- axe reports no violations on the three tested pages in both viewport projects.
- A clean `npm ci` passes. Regenerated geographic masks and their license are
  byte-identical; evaluated profile/travel data is unchanged.
- Runtime dependency audit reports zero known advisories at review time.
- Browser automation and automated accessibility checks do not replace testing
  on physical devices or a manual screen-reader audit.

## Dependency limitation

The Next ESLint preset currently brings React/import/accessibility plugins whose
peer ranges stop at ESLint 9. ESLint 10 causes unsupported peer combinations, so
the compatible ESLint 9 version is pinned. npm currently reports 16 moderate
**development-tooling** findings, originating from the minimatch glob-amplification
advisory (GHSA-g3hv-75wg-m249). These tools are not shipped in the static site.
The audit's suggested downgrades and cross-major overrides were not applied.
Upgrade the lint preset/plugins together when compatible patched versions exist.

## Deliberate boundaries

No runtime backend, generic state library, Worker, arbitrary FPS cap, new command
framework or content rewrite was introduced. The renderer stays lazy-loaded;
animation still follows native requestAnimationFrame cadence. Known tiny-territory
limitations of the geographic raster/ASCII grid are unchanged.
