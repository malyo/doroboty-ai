import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  parseResearchExport,
  withDefaults,
  type P2Scenario,
  type P3Job,
  type ResearchEvent,
  type ResearchState,
  type StatusMessage,
} from "./schema";

/**
 * Local state of the research prototypes (EXP1–EXP3): facilitator settings, what each side did
 * and the event log. Stored only in this browser (localStorage); export is an explicit download.
 */
export const RESEARCH_STORAGE_KEY = "doroboty-research-v1";

export type { ResearchEvent, P2Scenario, StatusMessage, P3Job, ResearchState };
/** Where an unreadable save is kept before the store starts a clean session. */
export const RESEARCH_BACKUP_KEY = `${RESEARCH_STORAGE_KEY}.unreadable`;

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

/**
 * Reads the saved session through the shared Zod schema. An unreadable save is copied to
 * RESEARCH_BACKUP_KEY before a clean session starts, so a later save cannot destroy it.
 */
export function loadResearchState(storage: Pick<Storage, "getItem" | "setItem">): ResearchState {
  let raw: string | null = null;
  try {
    raw = storage.getItem(RESEARCH_STORAGE_KEY);
    if (!raw) return initialResearchState();
    return withDefaults(JSON.parse(raw), initialResearchState());
  } catch {
    try {
      if (raw) storage.setItem(RESEARCH_BACKUP_KEY, raw);
    } catch {
      // Storage is full or blocked; nothing more can be preserved.
    }
    return initialResearchState();
  }
}

function load(): ResearchState {
  try {
    return loadResearchState(localStorage);
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
  /** Validates an exported session file and replaces the current session. Throws a Polish message. */
  importSession: (raw: string) => void;
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
  const importSession = useCallback((raw: string) => {
    const next = parseResearchExport(raw, initialResearchState());
    setState(next);
  }, []);
  const value = useMemo(
    () => ({ state, update, log, newSession, importSession }),
    [state, update, log, newSession, importSession],
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
