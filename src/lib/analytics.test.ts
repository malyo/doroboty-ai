import { afterEach, describe, expect, it } from "vitest";
import {
  capture,
  routeTemplate,
  sanitizeProps,
  setAnalyticsTransport,
  trackApplyClicked,
  trackPageView,
} from "./analytics";

afterEach(() => setAnalyticsTransport(null));

describe("analytics", () => {
  it("maps paths to route templates without slugs or ids", () => {
    expect(routeTemplate("/")).toBe("/");
    expect(routeTemplate("/oferty/growth-lead-northstar")).toBe("/oferty/:slug");
    expect(routeTemplate("/firmy/northstar-health/")).toBe("/firmy/:slug");
    expect(routeTemplate("/app/aplikacje/abc-123")).toBe("/app/aplikacje/:id");
    expect(routeTemplate("/app/profil")).toBe("/app/*");
  });

  it("drops everything except the allowlisted properties", () => {
    expect(
      sanitizeProps({
        route: "/oferty",
        email: "anna@example.com",
        phone: "+48 600 000 000",
        message: "free text",
        url: "https://x.test/#/oferty?q=secret",
        nested: { a: 1 },
      }),
    ).toEqual({ route: "/oferty" });
  });

  it("sends only the route template through the mocked transport", () => {
    const sent: Array<[string, unknown]> = [];
    setAnalyticsTransport((event, props) => sent.push([event, props]));
    trackPageView("/oferty/some-job");
    capture("filter_used", { query: "secret", email: "a@b.pl" });
    expect(sent).toEqual([
      ["$pageview", { route: "/oferty/:slug" }],
      ["filter_used", {}],
    ]);
  });

  it("sends apply clicks with the job id and category only", () => {
    const sent: Array<[string, unknown]> = [];
    setAnalyticsTransport((event, props) => sent.push([event, props]));
    trackApplyClicked(
      { id: "growth-lead", category: "lead", email: "a@b.pl", name: "Anna" } as {
        id: string;
        category: string;
      },
      "/oferty/:slug",
    );
    expect(sent).toEqual([
      ["apply_clicked", { job_id: "growth-lead", category: "lead", source_page: "/oferty/:slug" }],
    ]);
  });

  it("is a no-op without a transport", () => {
    expect(() => trackPageView("/")).not.toThrow();
  });
});
