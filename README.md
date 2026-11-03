# tsechoev.dev

An interactive terminal portfolio for Bogdan Tsechoev. Next.js 16.4.4, React 19.3.1,
TypeScript, App Router, and static export. Hosted on GitHub Pages.

## Develop

Node.js 22+ and npm are required.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm run preview` serves the production `out/` directory.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

For desktop/mobile browser checks, run `npx playwright install --with-deps chromium`
once, then `npm run test:e2e` after building. Screenshots are written to the ignored
`test-results/` directory. The preview server binds only to loopback.

The build generates `out/`, including server-rendered introductory content and
command discovery, the downloadable CV, Open Graph image, robots, and sitemap.
JavaScript enables command execution; CV and email links also work without it.

## Commands and controls

`whoami`, `experience`, `skills`, `opensource`, `education`, `contact`, `cv`,
`travel`, `help`, `history`, `clear`, `theme [dark|light]`, `pwd`.

Aliases: `about`, `oss`, `resume`, `countries`, `ls`.

Enter submits; Tab cycles command completions; Up/Down navigate history and
restore the unfinished input. Escape clears input; Ctrl/Cmd+L clears output.
Ctrl+C cancels a draft without executing or recording it. Ctrl+U deletes before
the cursor; Ctrl+K deletes after it. Text selection preserves Ctrl+C copying.
Tab shows ambiguous completions. Desktop starts at the prompt; background clicks
refocus it. The borderless prompt uses a blinking block cursor (steady
with reduced motion). Mobile retains its keyboard and explicit submit button.
Each command replaces the screen. Only output scrolls; the prompt stays visible.
Clickable commands support touch. History and appearance remain session-local;
no analytics, cookies, remote fonts, API calls, or shell execution are involved.
Martian Mono (SIL Open Font License) is bundled from `@fontsource/martian-mono`
through `next/font/local`, with local WOFF2 files and no Google Fonts requests.

## Content and structure

- `spec/site-spec.md`: product and interaction contract.
- `src/lib/profile.ts`: November 2026 CV-based content and country dataset.
- `src/lib/commands.ts`: pure command parser and completion.
- `src/components/terminal.tsx`: interactive shell.
- `src/components/output.tsx`: command output views.
- `src/components/commands/`: individual content commands, selected by a typed registry.
- `src/hooks/use-terminal.ts`: session state, keyboard controls and cursor tracking.
- `src/app/`: routes, metadata, global styles.
- `tests/`: command and interaction tests.
- `public/bogdan-tsechoev-resume.pdf`: supplied CV.
- `public/og.svg`: editable social-image source; `public/og.png` is the shared asset.

Add travel entries to `countries` using `{ name, code, note? }`. No countries are
inferred from residence or employment. Open-source entries link to the CV's two
repositories, not fabricated individual PRs or live contribution counts.

## Deployment

Pushing to `main` runs unit/interaction tests, typecheck, build, desktop/mobile
browser tests, and deploys `out/` to GitHub Pages.
`public/CNAME` preserves the custom domain. `output: "export"` deliberately avoids
runtime-only features such as server actions or ISR: this terminal needs no server.
Production changes take effect only after the workflow successfully deploys.

## License

CC BY-NC-ND 4.0.
