# Terminal portfolio contract

An English-language interactive terminal portfolio. Only the terminal: a plain
full-page background, self-hosted Martian Mono via next/font/local, restrained green accents, no site header,
footer, decorative window controls, borders, status bars, or oversized hero.
On first load show a short introduction and the full
command list, server-rendered for SEO and no-JavaScript visitors, with ordinary
contact/CV links. Show detailed `whoami` output only when requested.

## Content

Use the November 2026 supplied CV: Senior Full-Stack Engineer, Manila, Philippines,
open to any time zone, bogdan.tsechoev@gmail.com. Postgres.ai ended February 2026.
Do not infer current employment or hiring availability. Open source links to the
two CV repositories with contribution context, not invented PRs or counts. Travel
uses the 19 entries in Bogdan's supplied travel screenshots, including Hong Kong
and Macau as separate territories. Render one alphabetical list of names, without
regional groups, cities, notes or visit statistics. Replace the PDF.

## Commands

- `whoami` / `about`: identity, summary, selected measurable outcomes.
- `help` / `ls`: all commands with descriptions.
- `experience`: three roles and achievements.
- `skills`: grouped technologies and languages.
- `opensource` / `oss`: PostgresAI and Database Lab Engine contributions.
- `education`: both degrees.
- `contact`: email, GitHub, LinkedIn; no automatic navigation.
- `cv` / `resume`: download link to the new PDF.
- `travel` / `countries`: supplied countries and territories in one list.
- `travel --globe` / `countries --globe`: rotating ASCII Earth with visited areas filled.
  `globe` is not a standalone command. Reject unknown or repeated travel flags
  with `Usage: travel [--globe]`; Tab completes the travel flag.
- `history`: session commands including itself.
- `clear`: clear output, retain history.
- `theme [dark|light]`: toggle or select theme.
- `pwd`: a virtual path, not a real server path.

Trim whitespace, ignore command-name case, treat blank input as a no-op. Unknown
commands and invalid arguments return helpful errors. Never execute shell input;
render it as text. Append each command and answer to scrollback, preserving the
welcome until clear. Keep the last 100 output entries with stable identities;
keep command recall separately for Up/Down without truncating it with scrollback.
The terminal fills the viewport; only its output scrolls, while the prompt stays
visible at the bottom. The scroll container spans the full viewport width, placing
its scrollbar at the right screen edge. Apply small inner text padding (16px on
desktop, 12px on mobile), with no outer frame or margins around the terminal.
After a command, scroll to the beginning of its new output
(or as far as the scroll range permits). Do not scroll the outer page or jump
while the visitor is reading older output. Clear and Ctrl/Cmd+L remove scrollback
and the welcome message, but retain command recall.
Tab cycles completions, Up/Down
recall history and restore the input draft, Ctrl/Cmd+L clears output, Escape clears
input. Ctrl+C cancels the draft with a visible ^C and never executes or records it;
preserve Ctrl+C when text is selected for copying. Ctrl+U deletes before the cursor,
Ctrl+K deletes after it. Ambiguous Tab completions are shown as terminal text.
The prompt has no input box or placeholder; a focused prompt has a blinking block
cursor that follows typing, selection and horizontal scrolling (steady with reduced motion). Desktop fine-pointer users start with
input focus; clicking terminal background focuses input without hijacking links,
buttons, or text selection. Quick-command buttons support touch. No initial mobile autofocus. Use a
labelled input, live status, visible focus, reduced-motion support, and no overflow
at 375px. Do not persist personal command history.

## Architecture and acceptance

Latest stable Next.js/React, App Router, TypeScript, static export to `out/` for
existing GitHub Pages hosting. Server-rendered initial content and isolated client
terminal. Metadata, Open Graph image, sitemap and robots; no remote font requests
or unnecessary backend. Command tests first, then implementation, interaction
tests, typecheck, production build and desktop/mobile browser smoke checks.

Keep each content command in its own readable React component. The output renderer
uses an exhaustive typed component registry; command metadata and profile data
remain separate from presentation. Keep session/input logic in a terminal hook,
not mixed into command views. Shared prompt and command-list markup is reused.
Review all site copy with stop-slop; preserve CV facts and numerical claims.

## ASCII globe

Render an orthographic sphere using bundled Natural Earth masks, not random
characters or network maps. Fill visited country/territory polygons in the accent
colour; leave other land neutral. Do not use point markers or enlarge small
territories. Derive the visited mask from the same 19 travel entries. The raster
and ASCII resolutions limit small-border detail. Link to `travel` for names.
Start facing Asia.

Use responsive character dimensions, retaining a circular appearance and no
horizontal overflow at 375px. Rotation is deterministic on initial render, runs
at browser frame cadence with requestAnimationFrame and elapsed-time-based angular motion,
and has an accessible pause/resume control. Disable motion
for reduced-motion users and stop timers when offscreen, the tab is hidden, or
the output is cleared. Animation must not scroll the terminal or steal focus.
Keep text accessible without announcing each ASCII animation frame. The command
works offline after page assets load; preserve SSG and no runtime API dependency.
Keep projection/rendering separate from React and test front/back clipping,
rotation, polygon coverage, pause, reduced motion and timer cleanup.

The globe must read as a lit sphere, not a flat disc. Compute a camera-fixed light
from the upper left using surface normals, ambient light and limb darkening.
Apply the same lighting to ocean, land and visited polygons, combining character
density with quantized brightness. Visited areas retain their green material but
must not bypass shading. Use a denser responsive grid while preserving the
displayed physical size and circular proportions. Cache geometry/light samples
per resolution so animation frames only rotate and sample the geographic masks.
# Simple version

- Header links between Terminal (`/`) and Simple (`/simple/`), identifying the current version.
- Simple is statically rendered, usable without JavaScript, with Whoami (`/simple/`) and Travel (`/simple/travel/`) on separate pages.
- Whoami includes description, experience, skills, open source, education, contact and CV, shared with the terminal command.
- Travel stays separate, with 19 places, no cities or regions, and an optional expandable globe.
- Preserve terminal keyboard and scrollback behavior; both versions fit mobile widths.
