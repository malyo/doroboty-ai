# Instrument prototypes and component documentation

Static HTML prototypes and designer documentation for the **Instrument** design direction, the design reference behind the app's current UI. They were built before the direction was adopted in the app and are kept here as a test and reference surface. They are **not** part of the app build, the participant package (`scripts/package-participant.mjs` does not include `docs/instrument/`) or Prettier formatting (pages carry inlined CSS and fonts).

All data is fictional. UI copy is Polish.

## Contents

| Path | What it is |
| --- | --- |
| `prototypes/index.html` | Index of the prototype screens |
| `prototypes/kandydat-*.html` | Candidate: job list, job offer |
| `prototypes/pulpit-pracodawcy.html`, `prototypes/pracodawca-*.html` | Employer: dashboard, company postings, own posting |
| `design-system/komponenty.html` | Designer documentation v4 (accepted): foundations, detail layout, 17 component families with live renders, open questions. Click-through sections with hash URLs (`#c05`). |
| `design-system/build_docs.py`, `renders.py` | Generator for `komponenty.html` |
| `design-system/evidence/` | Screenshot crops of the prototypes used as evidence links in the documentation |
| `build_site.py` | Builds the publishable folder `site/` (git-ignored) |

The design system's source of truth is the project skill [`.claude/skills/doroboty-instrument-ui/`](../../.claude/skills/doroboty-instrument-ui/design.md). The prototypes and the documentation inline its `assets/instrument.css`, fonts and favicon.

## Regenerate after changing the skill CSS

From the repository root:

```sh
python3 .claude/skills/doroboty-instrument-ui/scripts/inline_css.py docs/instrument/prototypes/*.html
python3 docs/instrument/design-system/build_docs.py
python3 docs/instrument/build_site.py
```

The pages are self-contained files that open directly in a browser, including the Claude app preview. Links between pages work in a normal browser.

## Publishing (team and invited testers only)

Publish **only** `docs/instrument/site/`, never the repository or `docs/instrument/` itself. `build_site.py`:

- recreates `site/` with the prototypes, the 3 skill templates and the documentation;
- adds `noindex, nofollow` and a "Prototyp DoRoboty.ai · dane fikcyjne" bar to every page;
- writes `robots.txt` (`Disallow: /`);
- fails if any local link leaves `site/`.

`noindex` is not access control, and this repository is public. Anyone with the link can open the published pages, and the source is visible on GitHub. Use the hosting provider's access protection if the prototype must stay private.

### Before publishing

- [ ] `python3 docs/instrument/build_site.py` ends with "All local links resolve to files inside site/."
- [ ] `site/` contains only `index.html`, `robots.txt`, `prototypes/`, `wzorce/` and `design-system/`.

### Right after publishing (about 5 minutes, private browser window)

1. [ ] The address uses `https://` and shows no certificate warning.
2. [ ] The root redirects to the prototype index.
3. [ ] All five screens open from the index.
4. [ ] Every page shows the "Prototyp DoRoboty.ai · dane fikcyjne" bar.
5. [ ] Styling loads:
   - frames;
   - the orange action on the job offer;
   - dot-matrix numbers on the dark console;
   - monospace headings.
6. [ ] Interactions work:
   - the star on the job list inverts the row;
   - selecting candidates on `wzorce/candidate-list.html` shows the "Zaproś…" bar.
7. [ ] `design-system/komponenty.html` opens and its left navigation switches sections.
8. [ ] `/robots.txt` shows `Disallow: /`.
9. [ ] At phone width the job list does not scroll horizontally.

If any step fails, roll back to the previous deployment in the hosting dashboard.

## Not included

The visual research (moodboard, direction study, screenshots of third-party sites) stays in the original local prototype folder and is intentionally not committed to this public repository.
