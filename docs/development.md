# Development workflow

This project follows Spec driven development + TDD.

1. Update `spec/site-spec.md` first.
2. Add or update tests for the behavior/content contract.
3. Implement the smallest change that makes tests pass.
4. Run `npm test`, `npm run typecheck`, and `npm run build`.
5. Run `npm run test:e2e` against the static export (install Playwright Chromium
   and its dependencies once). Cover desktop, 375px mobile, and no-JavaScript links.
6. Inspect the screenshots in `test-results/` before publishing a visual redesign.

Keep profile content in `src/lib/profile.ts`, command parsing in
`src/lib/commands.ts`, and presentation in the terminal/output components.
The current hosting is GitHub Pages: runtime server features require a hosting
change. A push to `main` publishes automatically after the workflow checks pass.
