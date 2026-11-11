# Research prototypes EXP1–EXP3 (ponowny zakup)

## Intent

Add clickable prototypes for the brief "Prototypy EXP1, EXP2, EXP3" (version 3, 2026-11-11) so a facilitator can run every test task with recruiters and candidates. Goal of the experiments: employer repeat purchase within 90 days from 30% to 60% (opportunity OPP2: "a few people worth talking to, not many applications to review"). Keep all existing screens; the brief does not remove any.

## Acceptance criteria

- Every task path in the brief can be clicked through: P1.1 (A and B on two postings), P1.2 (B, own settings), P2 candidate scenarios (1), (2), (3), (3b), P2 recruiter (handle waiting candidates, set an automatic reminder, answer a status question), P3 recruiter form, P3 candidate conditions, P3 recruiter review.
- Polish UI, sample data in code, no backend, no login, no real personal data, nothing sent out.
- Recruiter and candidate views with an easy view and scenario switch for the facilitator.
- Local event log (clicks, times) with export to a file.
- Look close to the current product (Instrument).

## Implementation

- `src/features/research/`: `data.ts` (deterministic fictional data), `store.tsx` (state, event log, localStorage key `doroboty-research-v1`, sync between tabs), `components.tsx` (layout, facilitator bar, shared `ConditionsList` and `Impatience`), `hub.tsx`, `p1.tsx`, `p2.tsx`, `p3.tsx`; styles in `src/app/research.css`.
- Routes under `/#/badanie` inside the existing shell; footer link "Badanie (prowadzący)".
- Decisions where the brief was open:
  - EXP2 assurance appears only after a recruiter click (answer to the question). Automatic reminders show settings and a preview only, as the brief allows.
  - Scenario (3) uses the recruiter's last sent "rekrutacja trwa" message if there is one, otherwise a sample message.
  - Changing the candidate scenario clears the previous question and withdrawal, so every scenario starts clean.
  - "Top 3" highlights are shown in variant B only.
  - EXP3 review uses three fixed sample applications; the participant's own conditions are shown on their confirmation screen.
- Extrapolated Instrument parts (not in the skill sources): facilitator bar, range sliders, form steps, salary nudge card and warning.

## Validation

- `./scripts/verify` (see final report in the conversation): lint, types, unit tests, build and e2e including the new `tests/e2e/research.spec.ts` (6 journeys covering all three prototypes and export).
- Browser walk-through at 1440 px of every path; all research routes at 390 px without horizontal scroll.

Not verified: real participant sessions, screen reader output, Safari/Firefox.

## Product integration (follow-up, branch `produkt-exp1-3`)

The user asked to keep `/badanie` and also implement the functionality in the base product.

- Model (`src/features/prototype/model.ts`): optional `conditions` and `updates` on applications, optional `salaryLater`, `firstProject`, `mandate`, `processForm` on jobs and `reminder` on companies, so existing saves and imports stay valid (version 1). New actions: `invite` (up to 3, submitted → reviewed → interview_invited), `still_considering`, `status_message` (reason ≥ 10 chars, next contact today or later), `ask_status` (7 days after applying and after the previous question), `answer_status` ("Rezygnujemy" rejects), `reminder`.
- Shared code in `src/features/applications/`: `conditions.tsx` (labels, `ConditionsList`, `Impatience`, `OptionGroup`, used by `/badanie` too), `conditions-fields.tsx`, `status.tsx`, `employer-candidates.tsx`; `src/features/jobs/salary-scope-fields.tsx`; styles in `src/app/recruiting-status.css`.
- Screens: employer candidates list (EXP1 + EXP2), employer application record (conditions, question, updates), organization page (reminders), job editor (EXP3 salary step), candidate application form (conditions) and record (status panel), public offer (role scope).
- The marketplace has only two candidate personas, so the shortened list shows few rows in the product; the 40-application lists stay in `/badanie`.
- Tests: `src/features/prototype/exp.test.ts` (4 model tests) and `tests/e2e/product-exp.spec.ts` (3 journeys); the publish journey now clicks "Dodam później".
