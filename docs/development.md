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
bakes camera-fixed light, glyph foreshortening and subtle glow into three material
textures. A shared cache retains at most two layout/theme texture sets; frame
composition copies contiguous geographic row ranges instead of individual glyphs.
The renderer stops drawing on disposal. Animation data stays
in refs rather than React state. A local error boundary isolates renderer errors; a missing
Canvas context falls back to readable content and the travel list.

Dependency versions are exact and recorded in the lockfile. ESLint 9 is retained
because the React/import/accessibility plugins shipped by Next's ESLint preset
currently declare support through ESLint 9. Do not force incompatible peer ranges
or major transitive overrides just to silence an audit report. See the review
notes for the remaining development-tooling advisory.

### Illustration-style globe rendering

The responsive globe uses 64/96/128 columns and a two-to-one glyph cell aspect
ratio to keep the sphere round. Camera-space shading is shared by land, visited
areas and water; limb glyphs are compressed without changing geographic masks.
Bright land glyphs receive a small cached glow. Comet tails scale with the canvas.

A local Chromium headless sample at 1280×720 recorded 176 frame paints over three
seconds, zero DOM mutations, 614 ms of script time and zero layout time. The first
per-glyph version of this same larger design recorded 31 paints in the same
benchmark; this is not a comparison with the earlier deployed small globe.
These are software-browser measurements, not a guarantee for physical devices.
Run `npm run benchmark:globe -- http://127.0.0.1:3000/` against a fresh static preview
to reproduce the sampling procedure. Initial material baking is outside the
steady-state measurement. The renderer follows native requestAnimationFrame
cadence; it does not impose a fixed FPS cap.
