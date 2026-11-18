# Release, rollback and recovery (static build)

Status: draft. Hosting provider, incident owner and support contact are not decided yet; the marked lines must be filled by a person before the release is treated as prepared.

## Release

1. Work from a clean commit on `main`; `./scripts/verify` passes (Node 24, `npm ci`).
2. `npm run build` writes the static site to `dist/` (relative asset paths, hash routing: no rewrite rules needed).
3. Publish the contents of `dist/` to the chosen static host. Record the commit hash and the published address.

## Smoke check after publishing (about 5 minutes)

1. Open the address; the home page shows offers and no console errors.
2. Open a deep link, e.g. `<address>/#/oferty` and `<address>/#/badanie`, then reload each.
3. Sign in as Anna Kowalska, open `#/app/profil`, change a field, reload: the change is kept.
4. Settings: export works. Check the address uses HTTPS.

## Rollback

The site has no server data, so rolling back means publishing the `dist/` of the previous good commit again (`git checkout <commit>`, `npm ci`, `npm run build`, publish). Visitors' data lives in their browsers and is not affected; incompatible saves are protected by the app (see `docs/tasks/frontend-only.md`).

## Recovery and ownership

- If the site is down: check the host's status, then re-publish the last good build as above.
- Before a facilitated research session, remind the facilitator to export the event log after each session (it cannot be re-imported).
- Incident owner: **TO BE FILLED – name and contact.**
- Support contact shown to participants: **TO BE FILLED.**
- Hosting provider and address: **TO BE FILLED.**
