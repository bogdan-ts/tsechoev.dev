# Site design contract

Two intentionally different reading modes share profile data, not presentation.

- Terminal: one scrollback contains introduction, commands, outputs and live prompt.
  Submitting follows the prompt to the bottom; wheel/touch/key interaction stops
  following late output. Selection and interactive output must not steal focus.
  Preserve history/drafts, IME, completion, Ctrl+C/L/U/K; add Ctrl+A/E/W editing.
  This is a portfolio command interface, not an operating-system shell.
- Simple: document-first profile, restrained sans-serif typography, original dark
  palette with system light preference, readable measures and honest section labels.
  No metric tiles, uppercase decorative labels, cards, or landing-page hero treatment.
- Keep all profile facts, Atlas rendering and controls, CV and static navigation.
- Work independently of SQL Detective. No merge or deployment in this task.

Verify unit input editing/IME/history and browser scrollback, selection, mobile,
keyboard navigation, static navigation, Atlas and accessibility.

Simple deliberately keeps its navigation label Whoami for continuity, but uses the
person's name as its document title. Shared terminal headings are visually hidden
only in Simple. The system sans stack is intentional: this surface is a reading
view, not a separate display-brand or marketing landing page. Profile highlights
are still available in terminal output; Simple prioritizes the full experience.

## Verification

- Input contract test failed before implementation, then 50 unit tests passed.
- Lint, typecheck and static production export passed.
- Simple dark/light axe checks passed on the local static build.
- Browser coverage includes updated bottom-follow scrollback, prompt placement,
  Atlas pointer/keyboard controls, CV and no-JavaScript navigation on desktop/mobile.
- No public Pages validation or physical-phone test is claimed.

Terminal typography uses a single cell size for headings, captions and body output;
weight, color and blank lines express hierarchy. The editable input stays 16px on
mobile to avoid iOS focus zoom. Canvas ASCII glyph size is rendering geometry, not
terminal text typography.
