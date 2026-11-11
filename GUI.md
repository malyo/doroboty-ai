# GUI — DoRoboty.ai Instrument

The required visual direction for new and changed screens is **Instrument**: a light, quiet work surface on a sky gradient where everything sits in 1px frames with square corners; contrast appears only in three places (the dark console with numbers, inverted selected rows, one orange action). The source of truth is the project skill [.claude/skills/doroboty-instrument-ui/SKILL.md](.claude/skills/doroboty-instrument-ui/SKILL.md) with its one-file summary [.claude/skills/doroboty-instrument-ui/design.md](.claude/skills/doroboty-instrument-ui/design.md).

Poster People (docs/design-system/) is the previous direction. Its immutable kit stays in the repository as history and is still checked by `npm run design-system:check`; do not use it for new UI.

## Read

1. [design.md](.claude/skills/doroboty-instrument-ui/design.md): principles, tokens, type roles, page composition, class API (C01–C17) and the review checklist.
2. [references/screen-recipes.md](.claude/skills/doroboty-instrument-ui/references/screen-recipes.md): the recipe for your screen type and where its contrast points go.
3. [references/visual-system.md](.claude/skills/doroboty-instrument-ui/references/visual-system.md): token sources and contrast pairs.
4. Working patterns: `.claude/skills/doroboty-instrument-ui/assets/candidate-list.html`, `candidate-profile.html`, `job-form.html`.

## Implement in this app

- Instrument classes (`.console`, `.filters`, `.list`/`.row`, `.detail`/`.side`/`.kv`, `.badge`, `.chip`, `.seg`, `.empty`, `.t-*` roles) come from [src/app/instrument.css](src/app/instrument.css), enabled by `class="ins"` on `<body>`. Keep the class names; they are the public API.
- Host mapping lives in [tokens.css](tokens.css) (`--gui-*`, `--pp-*` and shadcn bridge resolve to Instrument values) and [src/app/instrument-host.css](src/app/instrument-host.css) (Base UI buttons, inputs, labels, dialogs, shell).
- Buttons: `Button` default is the light frame with an arrow cell (`.cta2`); `variant="action"` is the orange `.cta` and is used for the one main action of a screen only; `outline` for neutral controls; `link`/`destructive` render as underlined text.
- Fonts are bundled locally (DM Mono, Nunito Sans, Doto via npm packages; Departure Mono in src/app/fonts). Never load a remote font.
- Lists are framed tables (`JobList`/`JobCard` for offers); an inverted `.row.sl` always carries a `.why` reason and a legend above the list.
- Keep the scope, React/TypeScript/Vite, hash routes, Base UI `render` composition, Zod/local data operations and workflows.
- Check 1440 and 390 px: no horizontal page scroll, facts card above content on mobile, visible focus, one orange element per screen. Run ./scripts/verify and report actual checks.
