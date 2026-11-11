import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  availabilityLabels,
  bandLabels,
  responseTimeDays,
  responseTimeLabels,
  workModeLabels,
  type CandidateConditions,
} from "./data";
import { ResearchProvider, useResearch, type P2Scenario } from "./store";
import { plural } from "@/lib/plural";

export const scenarioLabels: Record<P2Scenario, string> = {
  silence: "(1) Cisza",
  queue: "(2) W kolejce z powodem",
  message: "(3) „Rekrutacja trwa” z widełkami",
  "message-no-salary": "(3b) „Rekrutacja trwa” bez widełek",
};

/** Recruiter ↔ candidate counterpart of each research screen, used by the view switch. */
const counterparts: Record<string, { view: "rekruter" | "kandydat"; other?: string }> = {
  "/badanie/p2/rekruter": { view: "rekruter", other: "/badanie/p2/kandydat" },
  "/badanie/p2/przypomnienia": { view: "rekruter", other: "/badanie/p2/kandydat" },
  "/badanie/p2/kandydat": { view: "kandydat", other: "/badanie/p2/rekruter" },
  "/badanie/p3/ogloszenie": { view: "rekruter", other: "/badanie/p3/warunki" },
  "/badanie/p3/zgloszenia": { view: "rekruter", other: "/badanie/p3/warunki" },
  "/badanie/p3/warunki": { view: "kandydat", other: "/badanie/p3/zgloszenia" },
};

/** Facilitator bar: view and scenario switch, event count, link back to the panel. */
function ResearchBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, update, log } = useResearch();
  const p1 = pathname.startsWith("/badanie/p1");
  const p2 = pathname.startsWith("/badanie/p2");
  const current = counterparts[pathname] ?? (p1 ? { view: "rekruter" as const } : undefined);
  return (
    <div className="research-bar" role="region" aria-label="Pasek prowadzącego badanie">
      <span className="t-label">Tryb badania · prowadzący</span>
      {current && (
        <div className="choice" role="group" aria-label="Widok">
          {(["rekruter", "kandydat"] as const).map((view) => (
            <button
              key={view}
              type="button"
              className="fpill"
              aria-pressed={current.view === view}
              disabled={current.view !== view && !current.other}
              onClick={() => {
                if (current.view === view || !current.other) return;
                log("HUB", "view_switch", { from: pathname, to: current.other });
                navigate(current.other);
              }}
            >
              {view === "rekruter" ? "Rekruter" : "Kandydat"}
            </button>
          ))}
        </div>
      )}
      {p2 && (
        <label className="research-select">
          <span className="t-label">Scenariusz kandydata</span>
          <select
            value={state.p2.scenario}
            onChange={(e) => {
              const scenario = e.target.value as P2Scenario;
              update((s) => ({
                ...s,
                p2: { ...s.p2, scenario, question: undefined, withdrawnAt: undefined },
              }));
              log("P2", "scenario_set", { scenario });
            }}
          >
            {Object.entries(scenarioLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      <span className="research-bar-end">
        <span className="t-data">
          {state.events.length} {plural(state.events.length, "zdarzenie", "zdarzenia", "zdarzeń")}
        </span>
        <Link className="tx" to="/badanie">
          Panel prowadzącego
        </Link>
      </span>
    </div>
  );
}

/** Route element for /badanie/*: provider, facilitator bar and the active screen. */
export function ResearchLayout() {
  return (
    <ResearchProvider>
      <div className="research-area">
        <ResearchBar />
        <Outlet />
      </div>
    </ResearchProvider>
  );
}

/** Logs that a screen was opened once per mount (StrictMode-safe). */
export function useScreenOpen(prototype: "P1" | "P2" | "P3" | "HUB", screen: string) {
  const { log } = useResearch();
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    log(prototype, "screen_open", { screen });
  }, [log, prototype, screen]);
}

/** How long the candidate waits compared with how fast they expect an answer. */
export function Impatience({
  conditions,
  ageDays,
}: {
  conditions: CandidateConditions;
  ageDays: number;
}) {
  const expected = conditions.responseTime ? responseTimeDays[conditions.responseTime] : undefined;
  const over = expected !== undefined && ageDays > expected;
  return (
    <span className="impatience">
      <span className="t-data">
        {ageDays} {plural(ageDays, "dzień", "dni", "dni")}
      </span>
      <span className="t-meta">
        {conditions.responseTime
          ? `oczekuje: ${responseTimeLabels[conditions.responseTime].toLocaleLowerCase("pl")}`
          : "oczekiwanie: —"}
      </span>
      {over && <span className="badge warn">Czas minął</span>}
    </span>
  );
}

/** Shared view of candidate conditions (EXP2 recruiter list and EXP3 review). */
export function ConditionsList({
  conditions,
  bandRange,
}: {
  conditions: CandidateConditions;
  bandRange?: Partial<Record<"low" | "mid" | "high", string>>;
}) {
  const fmt = new Intl.NumberFormat("pl-PL");
  const band = conditions.band;
  return (
    <dl className="kv conditions">
      <dt>Min. wynagrodzenie</dt>
      <dd className="t-data">
        {conditions.minSalary ? `${fmt.format(conditions.minSalary)} zł` : "—"}
      </dd>
      <dt>Tryb pracy</dt>
      <dd>{conditions.workMode ? workModeLabels[conditions.workMode] : "—"}</dd>
      <dt>Dostępność</dt>
      <dd>{conditions.availability ? availabilityLabels[conditions.availability] : "—"}</dd>
      <dt>Odpowiedź do</dt>
      <dd>{conditions.responseTime ? responseTimeLabels[conditions.responseTime] : "—"}</dd>
      <dt>Część widełek</dt>
      <dd>
        {band ? bandLabels[band] : "—"}
        {band && band !== "none" && bandRange?.[band] && (
          <span className="t-data conditions-range"> {bandRange[band]}</span>
        )}
      </dd>
    </dl>
  );
}

export const counter = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
