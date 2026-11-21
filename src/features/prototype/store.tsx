import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import posthog from "posthog-js";
import { currentPerson, initialState, transition, type Action, type State } from "./model";
import { STORAGE_KEY, parseState, readState, saveState, type StoragePort } from "./storage";
function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function useStore() {
  const [loaded] = useState(() => readState(browserStorage()));
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(loaded.blocked);
  const latest = useRef(state);
  const restoredPerson = useRef(currentPerson(loaded.state));
  const restoredIdentity = useRef(false);
  function identifyPerson(person: State["people"][number]) {
    posthog.identify(person.id, { role: person.role });
  }
  function commit(next: State, replace = false) {
    latest.current = next;
    setState(next);
    setError("");
    if (blocked && !replace) return;
    try {
      saveState(browserStorage(), next);
      setIssue("");
      if (replace) setBlocked(false);
    } catch (e) {
      setIssue((e as Error).message);
    }
  }
  function run(action: Action) {
    try {
      commit(transition(latest.current, action));
      return true;
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }
  function selectPerson(id: string) {
    const activePersonId = latest.current.activePersonId;
    const person = latest.current.people.find((candidate) => candidate.id === id);
    if (!person || !run({ type: "select_person", id })) return false;

    if (activePersonId !== id) {
      if (activePersonId !== null) posthog.reset();
      identifyPerson(person);
    }
    return true;
  }
  function importState(raw: string) {
    try {
      const activePersonId = latest.current.activePersonId;
      const next = parseState(raw);
      const nextPerson = currentPerson(next);
      commit(next, true);
      if (activePersonId !== nextPerson?.id) {
        if (activePersonId !== null) posthog.reset();
        if (nextPerson) identifyPerson(nextPerson);
      }
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  useEffect(() => {
    const person = restoredPerson.current;
    if (!restoredIdentity.current && person) {
      posthog.identify(person.id, { role: person.role });
      restoredIdentity.current = true;
    }
  }, []);
  // Another tab saved the scenario: adopt it, so this tab's next save cannot silently undo it.
  // While this tab protects an unreadable save (blocked) it keeps working in memory only.
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null || blocked) return;
      try {
        const activePersonId = latest.current.activePersonId;
        const next = parseState(event.newValue);
        const nextPerson = currentPerson(next);
        latest.current = next;
        setState(next);
        setIssue("");
        if (activePersonId !== nextPerson?.id) {
          if (activePersonId !== null) posthog.reset();
          if (nextPerson) identifyPerson(nextPerson);
          restoredIdentity.current = true;
        }
      } catch {
        // An invalid write from elsewhere is ignored; this tab keeps its valid state.
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [blocked]);
  return {
    state,
    issue,
    error,
    blocked,
    original: loaded.original,
    run,
    selectPerson,
    importState,
    clearError: () => setError(""),
    reset: () => {
      const hadActivePerson = latest.current.activePersonId !== null;
      commit(initialState(), true);
      if (hadActivePerson) posthog.reset();
    },
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
