import { describe, expect, it } from "vitest";
import { MAX_RESEARCH_BYTES, parseResearchExport } from "./schema";
import {
  RESEARCH_BACKUP_KEY,
  RESEARCH_STORAGE_KEY,
  initialResearchState,
  loadResearchState,
  type ResearchState,
} from "./store";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

function session(): ResearchState {
  return {
    ...initialResearchState(),
    participant: "R01",
    events: [{ at: "2026-11-18T10:00:00.000Z", ms: 1200, prototype: "P1", type: "row_selected" }],
  };
}

describe("research state schema", () => {
  it("round-trips the 'Eksportuj JSON' file format", () => {
    const state = session();
    const exported = JSON.stringify({
      participant: state.participant,
      sessionStartedAt: state.sessionStartedAt,
      state: { ...state, events: undefined },
      events: state.events,
    });
    const imported = parseResearchExport(exported, initialResearchState());
    expect(imported.participant).toBe("R01");
    expect(imported.events).toEqual(state.events);
  });

  it("rejects malformed files and oversized files with a Polish message", () => {
    expect(() => parseResearchExport("{not json", initialResearchState())).toThrow(
      /poprawny plik dziennika/,
    );
    const badEvent = JSON.stringify({ ...session(), events: [{ at: 1, prototype: "X" }] });
    expect(() => parseResearchExport(badEvent, initialResearchState())).toThrow(
      /poprawny plik dziennika/,
    );
    const huge = JSON.stringify({ participant: "x".repeat(MAX_RESEARCH_BYTES) });
    expect(() => parseResearchExport(huge, initialResearchState())).toThrow(/za duży/);
  });

  it("fills fields added after a session was saved", () => {
    const { p2, ...rest } = session();
    const old = JSON.stringify({ ...rest, p2: { ...p2, reminder: undefined } });
    const storage = memoryStorage({ [RESEARCH_STORAGE_KEY]: old });
    const loaded = loadResearchState(storage);
    expect(loaded.participant).toBe("R01");
    expect(loaded.p2.reminder.days).toBe(7);
  });

  it("keeps an unreadable save in a backup key and starts a clean session", () => {
    const storage = memoryStorage({ [RESEARCH_STORAGE_KEY]: '{"events":"broken"}' });
    const loaded = loadResearchState(storage);
    expect(loaded.events).toEqual([]);
    expect(storage.data.get(RESEARCH_BACKUP_KEY)).toBe('{"events":"broken"}');
  });
});
