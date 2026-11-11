# Instrument design system adoption

## Intent

The user asked to implement the "Instrument" design system from the project skill `.claude/skills/doroboty-instrument-ui` across the current application. This replaces Poster People as the visual direction for the running app. Preserve routes, hash routing, Zod validation, persona data, localStorage and all candidate/employer/instructor workflows. Keep `docs/design-system/agent-kit` (the Poster People reference) byte-identical; it stays in the repository as a historical reference.

## Approach

Follow the skill's rule for projects with an existing system: translate the Instrument roles onto the host token layer instead of adding a competing set of variables.

- Bundle fonts locally (no remote font endpoint): DM Mono 400/500, Nunito Sans variable, Doto 700 via npm packages, Departure Mono from the skill (SIL OFL, license kept).
- Add the Instrument class API (`src/app/instrument.css`, copied from the skill with a local font path) and enable it with `class="ins"` on `<body>`, so new screens can use `.console`, `.cta`, `.list`, `.badge` and the other public classes.
- Remap `tokens.css` (`--gui-*`, shadcn bridge) and the marketplace `--pp-*` tokens to Instrument values: paper/surface/ink/mute/frame/rule, radius 0, no shadows, 1 px frames, sky gradient page background.
- Adapt shared primitives: Button variants (orange `.cta` only for the one main action per screen, light framed secondary with arrow cell, text links), Badge (11 px Departure Mono rectangles), headings (DM Mono 500 roles), inputs and focus.
- Remove Poster People-only expression: pink accents, illustration, Geist Serif.

## Acceptance criteria

- Every route renders in the Instrument language: sky gradient background, framed rectangles, no radii or shadows, DM Mono titles, Nunito Sans text, Departure Mono 11 px labels.
- Orange appears only as the background of the main action; green only means "available"; errors are crimson with "!".
- Desktop 1440 and mobile 390 px have no horizontal page scroll; focus is visible.
- `./scripts/verify` passes; e2e assertions tied to Poster People values are updated to Instrument values.
- Project guidance (AGENTS.md, CLAUDE.md, README.md, GUI.md, docs/design-system/README.md) names Instrument as the active direction.

## Implementation notes

- `src/app/instrument.css` is the skill CSS with a local Departure Mono path. One host deviation: decorative arrow-cell glyphs (`→ ↗ + ✓`) use `content: "…" / ""` so they stay out of accessible names (otherwise "Aplikuj" becomes "Aplikuj →").
- `Button` variants: `default` = `.cta2` (light frame + arrow cell), `action` = `.cta` (orange), `outline` = neutral control, `link`/`destructive` = underlined text. Stable hooks: `btn-cta`, `btn-cta2`, `btn-outline`, `btn-icon`.
- Orange (`action`) per screen: home "Zobacz oferty", offer "Aplikuj", dashboards "Przeglądaj oferty"/"Przejrzyj kandydatów", profile "Zapisz profil", application "Wyślij aplikację", employer offers "Dodaj ofertę", job editor "Opublikuj ofertę", organization "Zapisz dane firmy", employer record forward stage. The public listing has none (recipe decision).
- Listing, home, offer, company, employer offers and application lists use framed list tables (`JobList`/`JobCard`, `.record-list`). Home, listing and both dashboards use the console with Doto counters instead of the Poster People illustration.
- Match Score and stage/status badges are neutral (no red/yellow/green bands); the top score band has an ink frame. Checkbox accent is ink (resolves open question 1 of the skill's design.md).
- Removed: Poster People illustration usage, Geist Serif loading, `marketplace-components.css`, `marketplace-listing.css`, `marketplace-offer.css`; `poster-people.css` became `host-recipes.css`.
- Extrapolations beyond the studied sources (as the skill requires stating): workspace sidebar/topbar, record sheet, settings, mobile filter sheet, map panel and the home console.

## Validation

Executed locally with Node 24.22.2 and Playwright Chromium:

- `./scripts/verify`: Prettier, Poster People kit integrity (67 files, unchanged), ESLint, TypeScript, 28 unit tests (new `plural` test), participant packet, production build and 34 Chromium journeys including axe checks and "no external requests".
- Updated e2e assertions that encoded Poster People values: body background `#f2f2f2`, Instrument type roles (console 34/23px DM Mono 500, row title 18px Nunito Sans, offer title 52/32px, salary 24px DM Mono), frames (radius 0, frame colour, no shadow), exactly one orange element on the offer and none on the listing, glued Apply/Save buttons (-1px gap) and section focus landing below the 64px sticky header.
- Browser review at 1440 and 390px: home, listing, offer, company, person picker, candidate dashboard/profile/applications/application form, employer offers/editor/organization/candidates/record. No horizontal page scroll at 390px; facts card above content on mobile.
- Found and fixed during review: arrow glyphs leaking into accessible names; production minifier folding `translate: none` into `transform`, which pushed the mobile filter sheet off-screen.

Not verified: screen reader output, zoom/reflow at 320px beyond the existing e2e check, and Safari/Firefox rendering of the `content: "…" / ""` alt-text syntax (older browsers ignore the second declaration and read the glyph).
