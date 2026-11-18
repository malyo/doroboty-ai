# Readiness fixes: research state schema, cross-tab sync, research session import

## Intent

Close three agent-fixable preparation items from the production readiness audit (`docs/production-readiness.html`, audit after merge 4577ffe): `research-state-validation`, `concurrent-writes` and `restore`.

## Acceptance criteria

- The research state (EXP1–EXP3) is read and imported through one plain Zod schema (AGENTS.md "Share plain Zod schemas"); an unreadable save is kept in a backup key instead of being overwritten.
- The prototype scenario stays in sync between tabs of one browser, so the last writing tab no longer silently overwrites another tab's changes.
- The facilitator can import a session file produced by "Eksportuj JSON"; an invalid file shows an error and leaves the session unchanged; import asks for confirmation.
- Unit and browser tests cover the new behaviour; `./scripts/verify` passes; FEATURES.md updated.

## Implementation

- `src/features/research/schema.ts`: `researchStateSchema` (text limits, 2 MB file limit), `withDefaults` (fills fields added later), `parseResearchExport` (accepts the export format or a bare state; Polish error message). Types are inferred from the schema and re-exported by `store.tsx`.
- `src/features/research/store.tsx`: `loadResearchState(storage)` validates and copies an unreadable save to `doroboty-research-v1.unreadable`; `importSession(raw)` in the context.
- `src/features/research/hub.tsx`: "Importuj JSON" file button next to the exports, validation before a confirm dialog "Zastąpić bieżącą sesję?", status/alert message.
- `src/features/prototype/store.tsx`: `storage` event listener adopts a valid save from another tab (ignored while this tab protects an unreadable save).

## Validation

- `src/features/research/schema.test.ts` (4 tests): export round-trip, invalid and oversized files, defaults for older saves, backup of an unreadable save.
- `tests/e2e/research.spec.ts`: export → new session → invalid file rejected → valid file imported.
- `tests/e2e/prototype.spec.ts`: a saved offer in one tab appears in another tab without reload. Confirmed to fail with the previous `store.tsx`.
- `./scripts/verify` and browser check at 1440 and 390 px (see report in the conversation).

## Not in scope

`data-lifecycle` (where to keep exported session files) and `support-info` (contact in the UI) need the owner's decision.
