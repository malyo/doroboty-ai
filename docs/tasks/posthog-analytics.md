# PostHog analytics (anonymous page views)

## Intent

Prepare the prototype for PostHog Cloud EU after the Vercel deployment, without weakening the privacy boundary.

## Acceptance criteria

- No key, no analytics: without `VITE_POSTHOG_KEY` (local dev, tests, CI) nothing is loaded or sent.
- Cookieless (`persistence: "memory"`), `person_profiles: "never"`, no autocapture, no session replay, no surveys, no feature flags, no IP, off on Do Not Track.
- The only event is `page_viewed` with the `route` template (e.g. `/oferty/:slug`). No slug, query string, id or free text. Everything else is dropped by an allowlist; `$current_url` is reduced to the origin.
- Unit tests use a mocked transport; no test data reaches PostHog.
- The privacy page (PUB-09) states the measurement.

## Configuration (not committed)

Set in Vercel (Production, public values by design for a Vite app):

- `VITE_POSTHOG_KEY` - project API key (starts with `phc_`)
- `VITE_POSTHOG_HOST` - optional, default `https://eu.i.posthog.com`

Vite inlines these at build time, so redeploy after changing them.

## Not done

Project key is not set yet, so the deployed site sends nothing. No custom events (job_viewed, apply_clicked, ...) - decide the event contract first. Verification in the PostHog live view needs the key and a redeploy.
