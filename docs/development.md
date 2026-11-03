# Development workflow

This project follows Spec driven development + TDD.

1. Update `spec/site-spec.md` first.
2. Add or update tests for the behavior/content contract.
3. Implement the smallest change that makes tests pass.
4. Run `npm run check` and `npm run build`.
5. Run `npm run test:e2e` against the static export (install Playwright Chromium
   and its dependencies once). Cover desktop, 375px mobile, and no-JavaScript links.
6. Inspect the screenshots in `test-results/` before publishing a visual redesign.

Keep profile content in `src/lib/profile.ts`, command parsing in
`src/lib/commands.ts`, and presentation in the terminal/output components.
The current hosting is GitHub Pages: runtime server features require a hosting
change. A push to `main` publishes automatically after the workflow checks pass.

## Quality gate

Use Node.js from `.nvmrc` (`nvm use`), then `npm ci`.

- `npm run format` applies the repository formatter.
- `npm run check` verifies formatting, zero-warning ESLint, all TypeScript sources
  (including e2e), and unit tests.
- `npm run build && npm run test:e2e` checks the static export, Chromium desktop/
  mobile flows and axe accessibility rules.
- Failed browser tests retain screenshots and traces; CI uploads them as an artifact.

Terminal domain transitions live in `src/lib/terminal-state.ts`; input events,
caret synchronization and scroll following have separate hooks. Historical output
is memoized and receives a stable command callback.

The globe hook coordinates environment observation, pointer input and Canvas
resource ownership. The renderer measures fonts only during setup/refresh and
owns a bounded sprite cache that is cleared on disposal. Animation data stays
in refs rather than React state. The loader isolates chunk/render errors; a missing
Canvas context falls back to readable content and the travel list.

Dependency versions are exact and recorded in the lockfile. ESLint 9 is retained
because the React/import/accessibility plugins shipped by Next's ESLint preset
currently declare support through ESLint 9. Do not force incompatible peer ranges
or major transitive overrides just to silence an audit report. See the review
notes for the remaining development-tooling advisory.
