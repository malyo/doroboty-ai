# Production readiness fixes (dev stage)

## Intent

Act on the first readiness audit (docs/production-readiness.html): fix what needs no external decision.

## Acceptance criteria

- `./scripts/verify` no longer fails on the generated report (`.prettierignore`).
- Workspace and application-form screens show a sample-data notice (FEATURES.md PUB-15).
- A render failure shows a recovery screen with data download (PUB-14).
- docs/release.md drafts release, smoke check, rollback and recovery; owner, contact and hosting stay marked as open.

## Not done (needs a decision)

Hosting provider, incident owner, support contact, research-log retention/free text, research-log import, two-tab overwrite, research-state Zod validation.
