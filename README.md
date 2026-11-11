# DoRoboty.ai — AIPH3 prototype

A frontend-only job marketplace for participants to extend and test. Built with React, TypeScript and Vite, using Base UI components. The required visual direction for new and changed screens is the accepted Poster People design system.

## Design system — start here for UI work

The app uses the **Instrument** direction: a light work surface on a sky gradient, 1px frames with square corners, DM Mono titles and data, Nunito Sans text, Departure Mono labels and Doto counters. Contrast is reserved for the dark console, inverted selected rows and one orange main action. Read [GUI.md](GUI.md), then the project skill [.claude/skills/doroboty-instrument-ui/design.md](.claude/skills/doroboty-instrument-ui/design.md) and its [screen recipes](.claude/skills/doroboty-instrument-ui/references/screen-recipes.md).

Poster People, the previous direction, is kept as an immutable historical kit under docs/design-system/agent-kit:

```sh
npm run design-system:check
npm run design-system:dev
```

The first command verifies that kit; the second serves it at http://127.0.0.1:8952/. Do not use it for new UI. The main app uses port 3001 as below.

## Run

Requirements: **Node.js 24 and npm**. Fonts are installed as npm packages; no remote font requests at runtime.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3001. No environment file, account, database or additional service is required. Package installation requires access to the npm registry.

Select Anna or Marek as a candidate, Karolina or Tomasz as an employer, or the instructor. Publish a job, apply, switch person and record the employer decision. Changes survive reload in this browser; settings provide export, import and reset. AI and scores simulate prepared scenarios. Use example CVs only.

## Build and verify

```sh
npm run build
npm run preview
./scripts/verify
```

The static output is dist/. Browser checks require an already provisioned Playwright Chromium; starting the app never installs it. See [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md), [current features](FEATURES.md) and [case protocol](docs/case/CASE_PROTOCOL.md).

To distribute a baseline participant package, run npm run package:participant -- /absolute/output/directory. This excludes Git history and instructor source material. Never distribute this repository’s history as a stage-safe packet.
