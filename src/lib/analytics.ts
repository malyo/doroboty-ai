// Privacy-first product analytics (PostHog Cloud EU).
// Cookieless (memory persistence), anonymous only, no session replay; autocapture limited to link/button clicks.
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
const ALLOWED_PROPS = new Set(["route", "job_id", "category", "source_page"]);

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
  // `$pageview` feeds PostHog Web Analytics; the URL is rebuilt from the route template.
  capture("$pageview", { route: routeTemplate(pathname) });
}

/** Anonymous count of apply clicks per public job id. Never includes the person. */
export function trackApplyClicked(job: { id: string; category: string }, sourcePage: string) {
  capture("apply_clicked", { job_id: job.id, category: job.category, source_page: sourcePage });
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
    // Clicks on links/buttons only; no inputs, no copied text, no form values.
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
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
        // Page views carry a template URL built in the transport below; others get the origin.
        if (event.event !== "$pageview") {
          props.$current_url = `${location.origin}/`;
          delete props.$pathname;
        }
        // Autocaptured elements carry hrefs with hash routes/slugs; drop them.
        if (Array.isArray(props.$elements)) {
          for (const el of props.$elements as Array<Record<string, unknown>>) delete el.attr__href;
        }
        delete props.$referrer;
        delete props.$referring_domain;
      }
      return event;
    },
  });
  transport = (event, props) => {
    if (event === "$pageview" && typeof props?.route === "string") {
      // Hash routing hides the route from the path, so expose the template as the path.
      posthog.capture(event, {
        ...props,
        $current_url: `${location.origin}${props.route}`,
        $pathname: props.route,
      });
      return;
    }
    posthog.capture(event, props);
  };
}
