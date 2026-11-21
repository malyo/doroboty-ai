// Privacy-first product analytics (PostHog Cloud EU).
// Cookieless (memory persistence), anonymous only, no session replay, no autocapture.
// Only a route template is sent, never the full URL, query string, slug or free text.
// Without VITE_POSTHOG_KEY (local dev, tests) every function is a no-op.

type Props = Record<string, string | number | boolean>;
type Capture = (event: string, props?: Props) => void;

const ROUTE_TEMPLATES: Array<[RegExp, string]> = [
  [/^\/$/, "/"],
  [/^\/oferty$/, "/oferty"],
  [/^\/oferty\/[^/]+$/, "/oferty/:slug"],
  [/^\/firmy\/[^/]+$/, "/firmy/:slug"],
  [/^\/aplikuj\/[^/]+$/, "/aplikuj/:slug"],
  [/^\/auth\/[^/]+$/, "/auth/:mode"],
  [/^\/app\/aplikacje\/[^/]+$/, "/app/aplikacje/:id"],
];

/** Maps a pathname to a route template; unknown paths collapse to their first segment. */
export function routeTemplate(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (const [pattern, template] of ROUTE_TEMPLATES) if (pattern.test(path)) return template;
  const first = path.split("/")[1];
  return first ? `/${first}/*` : "/";
}

// Only these properties may leave the browser. Everything else is dropped.
const ALLOWED_PROPS = new Set(["route"]);

export function sanitizeProps(props: Record<string, unknown> = {}): Props {
  const clean: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    }
  }
  return clean;
}

let transport: Capture | null = null;

/** Test hook: replace the capture transport so no data reaches PostHog. */
export function setAnalyticsTransport(next: Capture | null) {
  transport = next;
}

export function capture(event: string, props?: Record<string, unknown>) {
  transport?.(event, sanitizeProps(props));
}

export function trackPageView(pathname: string) {
  capture("page_viewed", { route: routeTemplate(pathname) });
}

export async function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key || transport) return;
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://eu.i.posthog.com";
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: host,
    persistence: "memory",
    person_profiles: "never",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    ip: false,
    // Keep full URLs (hash + query) out of auto-added properties.
    before_send: (event) => {
      if (event) {
        const props = (event.properties ??= {});
        props.$current_url = `${location.origin}/`;
        delete props.$referrer;
        delete props.$referring_domain;
        delete props.$pathname;
      }
      return event;
    },
  });
  transport = (event, props) => posthog.capture(event, props);
}
