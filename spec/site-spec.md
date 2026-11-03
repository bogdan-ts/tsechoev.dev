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
is a typed empty dataset until countries are supplied. Replace the PDF.

## Commands

- `whoami` / `about`: identity, summary, selected measurable outcomes.
- `help` / `ls`: all commands with descriptions.
- `experience`: three roles and achievements.
- `skills`: grouped technologies and languages.
- `opensource` / `oss`: PostgresAI and Database Lab Engine contributions.
- `education`: both degrees.
- `contact`: email, GitHub, LinkedIn; no automatic navigation.
- `cv` / `resume`: download link to the new PDF.
- `travel` / `countries`: countries or honest pending state.
- `history`: session commands including itself.
- `clear`: clear output, retain history.
- `theme [dark|light]`: toggle or select theme.
- `pwd`: a virtual path, not a real server path.

Trim whitespace, ignore command-name case, treat blank input as a no-op. Unknown
commands and invalid arguments return helpful errors. Never execute shell input;
render it as text. Bound output to 100 entries. Tab cycles completions, Up/Down
recall history and restore the input draft, Ctrl/Cmd+L clears output, Escape clears
input. Quick-command buttons support touch. No initial mobile autofocus. Use a
labelled input, live status, visible focus, reduced-motion support, and no overflow
at 375px. Do not persist personal command history.

## Architecture and acceptance

Latest stable Next.js/React, App Router, TypeScript, static export to `out/` for
existing GitHub Pages hosting. Server-rendered initial content and isolated client
terminal. Metadata, Open Graph image, sitemap and robots; no remote font requests
or unnecessary backend. Command tests first, then implementation, interaction
tests, typecheck, production build and desktop/mobile browser smoke checks.
