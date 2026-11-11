# Runtime typography

The application loads only local fonts (no remote font endpoint):

- **DM Mono** 400 and 500 (`@fontsource/dm-mono`): titles (500) and data (400).
- **Nunito Sans** variable with optical size (`@fontsource-variable/nunito-sans`): people, descriptions and interface text.
- **Doto** 700 (`@fontsource/doto`): console counters only.
- **Departure Mono** 400 (`DepartureMono-Regular.woff2`, Helena Zhang, SIL OFL 1.1, license in `DepartureMono-LICENSE.txt`): 11px uppercase labels only. Copied from `.claude/skills/doroboty-instrument-ui/assets/fonts/`.

The npm font packages are imported in `src/main.tsx`; Departure Mono is declared in `src/app/instrument.css`.

## Retained historical assets

`timeless-sans-variable.woff2` and `timeless-grotesk-web-variable.woff2` (Timeless Type, free for personal and commercial use) are earlier implementation assets and are not loaded by the application. Geist Serif (Poster People) remains in the immutable kit under docs/design-system/agent-kit and is not loaded either.
