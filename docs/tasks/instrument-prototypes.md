# Bring the Instrument prototypes into the repository

## Intent

Move the standalone Instrument prototype project (static HTML prototypes, accepted designer component documentation v4 and its publish script) into this repository under `docs/instrument/`, keeping it separate from the app and from the participant package. Sync the project skill with the newer upstream fix (selection checkbox no longer green) and apply the same fix to the app's Instrument CSS.

## Acceptance criteria

- `docs/instrument/` contains the prototypes, `design-system/komponenty.html` with its generator and evidence, `build_site.py` and an English README with publishing steps.
- Not included in the app build, the participant package or Prettier checks.
- `docs/instrument/site/` (generated) is git-ignored. The build script's link check passes.
- Third-party research screenshots are not added.
- The skill's `assets/instrument.css`, `design.md` and three templates match the fixed version: `.chk` uses `--ink`, and `--console-ink` on `.row.sl`.
- `src/app/instrument.css` applies the same checkbox rule. The research screens EXP1/EXP3 stay usable at 1440 and 390 px.
- `./scripts/verify` passes, or its actual failures are reported.

## Implementation

- Copied `prototypes/*.html`, `docs/design-system/{komponenty.html,build_docs.py,renders.py,evidence/}` and `scripts/build_site.py` from the prototype folder. Adapted generator and build paths to `docs/instrument/`. Documentation links point to `../prototypes/` and `../../../.claude/skills/…`, and the build rewires them to `wzorce/`.
- Re-inlined the skill CSS into the prototypes and regenerated the documentation and `site/`.
- Added `docs/instrument/` to `.prettierignore` and `docs/instrument/site/` to `.gitignore`.
- `src/app/instrument.css`: `.ins .chk` accent `--ink`; `.ins .row.sl .chk` accent `--console-ink`.

## Feature register

FEATURES.md reviewed. The checkbox colour is a visual-only change with no change to flows, routes, data or roles. `docs/instrument/` is design reference material, not app behaviour, so no update is needed.

## Open

- The public skill still contains screenshots of third-party sites (`references/screenshots/r01–r07`, `c01–c04`). Removal is a separate decision.
- `docs/instrument/` documents the prototypes, not the React app. Where they differ, the app and the skill are authoritative.
