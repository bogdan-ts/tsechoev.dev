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
`travel [--globe]`, `help`, `history`, `clear`, `theme [dark|light]`, `pwd`.

Aliases: `about`, `oss`, `resume`, `countries`, `ls`.

Enter submits; Tab cycles command completions; Up/Down navigate history and
restore the unfinished input. Escape clears input; Ctrl/Cmd+L clears output.
Ctrl+C cancels a draft without executing or recording it. Ctrl+U deletes before
the cursor; Ctrl+K deletes after it. Text selection preserves Ctrl+C copying.
Tab shows ambiguous completions. Desktop starts at the prompt; background clicks
refocus it. The borderless prompt uses a blinking block cursor (steady
with reduced motion). Mobile retains its keyboard and explicit submit button.
Commands append to scrollback, capped at 100 entries. Only output scrolls; the
prompt stays visible. New output scrolls to its beginning, so long answers open
at the first line. `clear` and Ctrl/Cmd+L remove output and the welcome message
without deleting command recall. Reading older output does not trigger scrolling.
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

Travel entries use `{ name, code }` in `countries`, ordered alphabetically.
The 19 entries come from Bogdan's travel screenshots; the output has no regional
groups, cities or visit statistics. No entries are inferred from residence or
employment. Open-source entries link to the CV's two
repositories, not fabricated individual PRs or live contribution counts.

## ASCII globe

`travel --globe` renders a rotating ASCII sphere with visited country/territory
polygons filled in green. `countries --globe` works through the existing alias;
`travel` without a flag shows the list. There is no standalone `globe` command.
Small territories can be below the raster or ASCII resolution; no point markers
or enlarged borders stand in for them. The view has pause/resume and a link to
the full `travel` list. The renderer and masks load only when a globe is opened.
Canvas draws cached glyph sprites without per-frame React/DOM changes.
Drag horizontally or use left/right arrows to position the sphere; release adds
decaying inertia. Pause and reduced motion disable automatic movement and inertia.
A selector offers 30 or 60 FPS, with a 60 FPS default ceiling.
Rotation follows requestAnimationFrame with elapsed-time
angular movement, so speed does not depend on refresh rate. Rotation stops
for reduced motion, offscreen output, hidden tabs and unmounted history entries.

Surface-normal lighting stays fixed above and to the left while the map rotates.
Ocean, neutral land and green visited areas share ambient light and limb darkening.
Character density and brightness carry the shading. The denser responsive ASCII
grid keeps the physical globe size; cached geometry avoids per-frame projection
and lighting work. Glyph clipping smooths the silhouette and muted blue oceans
separate unvisited land from water. High-DPI rendering is capped at 2×.

Geography comes from [Natural Earth](https://www.naturalearthdata.com/), distributed
by [world-atlas](https://github.com/topojson/world-atlas). The checked-in land mask
and visited polygon mask total about 54 KB; geometry tools are development-only.
No map service, external request or backend is needed at runtime. Attribution and
the redistribution license ship in `public/world-atlas-license.txt`.

After changing the travel list, regenerate geometry with Node.js 22.18+:

```sh
npm run generate:globe
```

`scripts/generate-globe-data.ts` samples land outlines and fills the selected
country shapes. Projection and ASCII rendering live in
`src/lib/globe.ts`; Canvas painting and its glyph cache are in
`src/lib/globe-canvas.ts`. Animation lifecycle lives in `src/hooks/use-globe.ts`,
with frame-independent inertia in `src/lib/globe-motion.ts`.

## Deployment

Pushing to `main` runs unit/interaction tests, typecheck, build, desktop/mobile
browser tests, and deploys `out/` to GitHub Pages.
`public/CNAME` preserves the custom domain. `output: "export"` deliberately avoids
runtime-only features such as server actions or ISR: this terminal needs no server.
Production changes take effect only after the workflow successfully deploys.

## License

CC BY-NC-ND 4.0.

### Globe profiling

With a preview server running, compare the same three-second Chromium window:

```sh
node --experimental-strip-types scripts/benchmark-globe.ts http://127.0.0.1:3000/ 60
node --experimental-strip-types scripts/benchmark-globe.ts http://127.0.0.1:3000/ 30
```

The script reports DOM changes, paint counts and CDP task/script/layout time.
Headless rendering and host load affect timing; these are local diagnostics,
not device-wide performance guarantees.
