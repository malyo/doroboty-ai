@AGENTS.md

Start with npm ci and npm run dev. Do not infer work from historical course material. Keep durable task notes in docs/tasks and review the actual diff before claiming completion.

## UI work uses the Instrument design system

Use the project skill `doroboty-instrument-ui` ([.claude/skills/doroboty-instrument-ui/SKILL.md](.claude/skills/doroboty-instrument-ui/SKILL.md)) for every new or changed screen; start with its [design.md](.claude/skills/doroboty-instrument-ui/design.md) and the matching screen recipe. [GUI.md](GUI.md) maps the system onto this app: Instrument classes in src/app/instrument.css (enabled by `class="ins"` on `<body>`), host token mapping in tokens.css and src/app/instrument-host.css, `Button variant="action"` for the one orange main action.

Preserve hash routing, Zod, persona data, localStorage and application/employer workflows. Scope visual changes to the requested task. Fonts are local only. Poster People in docs/design-system/ is the previous direction: keep docs/design-system/agent-kit immutable (`npm run design-system:check` still verifies it) but do not use it for new UI. Validate new UI at 1440 and 390 px with keyboard/state checks, run ./scripts/verify, update FEATURES.md for actual behavior changes and report actual evidence.
