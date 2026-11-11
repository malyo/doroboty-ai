# Working on DoRoboty.ai Case

This is an AIPH3 teaching prototype, separate from the public production portal.
Read BRIEF.md, docs/case/CASE_PROTOCOL.md, TODO.md and relevant FEATURES.md entries before product work.

## Start and boundaries

- Participant setup: Node.js 24, npm ci, npm run dev (http://127.0.0.1:3001).
- Role selection is a simulation, not security.
- Share plain Zod schemas between forms and domain operations.
- Preserve human editing and approval. Use synthetic data only.
- Keep historical case evidence separate from prototype state. Include only baseline in participant packages; source history and instructor materials must not be distributed.

## Workflow

1. Record intent and acceptance criteria in docs/tasks/ for changes larger than one line.
2. Do not let multiple agents write in one worktree.
3. Implement and run ./scripts/verify before claiming completion; explain actual failures.
4. Perform a separate review pass before merging. Record durable lessons when useful.

## Product behavior register

FEATURES.md describes current behavior, not a roadmap. Update it in the same change/commit for added, changed, removed or simulated flows. Preserve stable IDs, route/role/data boundaries and source/test references. Do not equate source coverage with an executed test or deployment. For changes without behavioral impact, record that the register was reviewed and did not need updating.

## Required design system

For every new or changed screen, use the **Instrument** direction from the project skill [.claude/skills/doroboty-instrument-ui/SKILL.md](.claude/skills/doroboty-instrument-ui/SKILL.md). Read its [design.md](.claude/skills/doroboty-instrument-ui/design.md), the matching recipe in [references/screen-recipes.md](.claude/skills/doroboty-instrument-ui/references/screen-recipes.md) and, for color or type decisions, [references/visual-system.md](.claude/skills/doroboty-instrument-ui/references/visual-system.md). [GUI.md](GUI.md) is the short entry point and maps the system onto this app.

The Instrument class API lives in src/app/instrument.css (enabled by `class="ins"` on `<body>`); host mapping is in tokens.css and src/app/instrument-host.css. Adapt it to this project's React/TypeScript/Vite and existing Base UI primitives; keep the `render` API, hash routes, domain data and persistent local flows. Orange is only the one main action of a screen (`Button variant="action"`), green only means "available", errors are crimson with "!". Bundle fonts locally; no remote runtime dependencies.

Poster People (docs/design-system/) is the previous direction. Keep docs/design-system/agent-kit immutable as history (`npm run design-system:check` still verifies it), but do not use it for new UI.

## Standards

- Code, comments and authored engineering documentation are English; end-user UI and canonical AIPH source wording are Polish.
- Use npm, Node.js 24 and package-lock.json. No second package manager.
- Features belong in src/features; src/components/ui contains shared Base UI primitives.
- For UI changes follow GUI.md and the project skill doroboty-instrument-ui; use the Instrument design system with the existing Base UI components and render composition API.
- Use React Router hash routes.
- Never log private free text or introduce secrets into the frontend.

## Validation

- npm run check verifies formatting, lint, types, unit tests, static build and browser journeys. ./scripts/verify runs the same gate.
- npm run dev never installs browser binaries or system tools. Browser tests require a provisioned Playwright Chromium; if missing, report it. Do not install OS dependencies automatically.
- Check mobile/desktop, keyboard access, error states and data recovery.
- Report what actually ran. Local checks do not prove CI, publishing or human approval.
