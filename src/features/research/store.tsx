import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CandidateConditions } from "./data";

/**
 * Local state of the research prototypes (EXP1–EXP3): facilitator settings, what each side did
 * and the event log. Stored only in this browser (localStorage); export is an explicit download.
 */
export const RESEARCH_STORAGE_KEY = "doroboty-research-v1";

export type ResearchEvent = {
  at: string;
  /** Milliseconds since the session started (facilitator's "Nowa sesja"). */
  ms: number;
  prototype: "P1" | "P2" | "P3" | "HUB";
  type: string;
  data?: Record<string, unknown>;
};

export type P2Scenario = "silence" | "queue" | "message" | "message-no-salary";

export type StatusMessage = { reason: string; nextContact: string; sentAt: string; to: number };

export type P3Job = {
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  contract: string;
  salaryLater: boolean;
  firstProject: string;
  mandate: string;
  process: string;
  publishedAt: string;
};

export type ResearchState = {
  sessionStartedAt: string;
  participant: string;
  /** Which posting runs variant A in task 1 (the other runs B); swapped between participants. */
  p1Order: "ml-first" | "pm-first";
  p2: {
    scenario: P2Scenario;
    askAfterDays: number;
    considering: Record<string, string>;
    statusMessages: StatusMessage[];
    question?: { askedAt: string; answer?: "considering" | "rejected"; answeredAt?: string };
    withdrawnAt?: string;
    reminder: {
      enabled: boolean;
      days: number;
      audience: "all" | "preference";
      reason: string;
      savedAt?: string;
    };
  };
  p3: { job?: P3Job; conditions?: CandidateConditions & { submittedAt: string; skipped: boolean } };
  events: ResearchEvent[];
};

export function initialResearchState(): ResearchState {
  return {
    sessionStartedAt: new Date().toISOString(),
    participant: "",
    p1Order: "ml-first",
    p2: {
      scenario: "silence",
      askAfterDays: 7,
      considering: {},
      statusMessages: [],
      reminder: {
        enabled: false,
        days: 7,
        audience: "preference",
        reason: "Czekamy na wewnętrzne ustalenia.",
      },
    },
    p3: {},
    events: [],
  };
}

function load(): ResearchState {
  try {
    const raw = localStorage.getItem(RESEARCH_STORAGE_KEY);
    if (!raw) return initialResearchState();
    const parsed = JSON.parse(raw) as Partial<ResearchState>;
    const base = initialResearchState();
    return {
      ...base,
      ...parsed,
      p2: { ...base.p2, ...parsed.p2, reminder: { ...base.p2.reminder, ...parsed.p2?.reminder } },
      p3: { ...parsed.p3 },
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return initialResearchState();
  }
}

type ResearchContext = {
  state: ResearchState;
  update: (change: (state: ResearchState) => ResearchState) => void;
  log: (
    prototype: ResearchEvent["prototype"],
    type: string,
    data?: Record<string, unknown>,
  ) => void;
  newSession: () => void;
};

const Context = createContext<ResearchContext | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try {
      localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be blocked; the prototype keeps working in memory and export still works.
    }
  }, [state]);
  // Keep both views in sync when the facilitator uses two tabs (recruiter and candidate).
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === RESEARCH_STORAGE_KEY) setState(load());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback((change: (state: ResearchState) => ResearchState) => {
    setState((current) => change(current));
  }, []);
  const log = useCallback<ResearchContext["log"]>((prototype, type, data) => {
    setState((current) => ({
      ...current,
      events: [
        ...current.events,
        {
          at: new Date().toISOString(),
          ms: Date.now() - Date.parse(current.sessionStartedAt),
          prototype,
          type,
          ...(data ? { data } : {}),
        },
      ],
    }));
  }, []);
  const newSession = useCallback(() => {
    setState((current) => ({ ...initialResearchState(), p1Order: current.p1Order }));
  }, []);
  const value = useMemo(
    () => ({ state, update, log, newSession }),
    [state, update, log, newSession],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useResearch() {
  const value = useContext(Context);
  if (!value) throw new Error("useResearch must be used inside ResearchProvider");
  return value;
}

/** Events as CSV (one row per event, data as JSON) for spreadsheets. */
export function eventsToCsv(events: ResearchEvent[], participant: string) {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = events.map((event) =>
    [
      quote(participant),
      event.at,
      String(event.ms),
      event.prototype,
      event.type,
      quote(JSON.stringify(event.data ?? {})),
    ].join(","),
  );
  return ["uczestnik,czas,ms_od_startu,prototyp,zdarzenie,dane", ...rows].join("\n");
}
