import { useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { MatchScore } from "@/features/prototype/match-score";
import { NotFound } from "@/features/prototype/shell";
import { plural } from "@/lib/plural";
import { p1Applications, p1Jobs, type ResearchApplication } from "./data";
import { counter, useScreenOpen } from "./components";
import { useResearch } from "./store";

const MAX_SELECTED = 3;
const DEFAULT_PER_PAGE = 10;

const columns = {
  "--cols": "18px 44px minmax(220px,1fr) 110px 150px 120px 90px",
  "--areas": '"chk nr who top score stat upd"',
  "--areas-m": '"chk top score" "who who who" "stat stat upd"',
} as React.CSSProperties;

/**
 * EXP1: shortened application list (recruiter). Variant A shows the full list; variant B shows the
 * first N applications above a score threshold and folds the rest under "Pokaż pozostałe (X)".
 * Nothing is removed. The recruiter selects up to three people to invite.
 */
export function ShortlistPage() {
  const { job: jobKey, variant: rawVariant } = useParams();
  const [params] = useSearchParams();
  const task = params.get("zadanie") === "2" ? 2 : 1;
  const job = p1Jobs.find((x) => x.key === jobKey);
  const variant = rawVariant === "A" || rawVariant === "B" ? rawVariant : undefined;
  if (!job || !variant) return <NotFound />;
  // Remount per job/variant/task so each run starts with a fresh timer and selection.
  return (
    <Shortlist
      key={`${job.key}-${variant}-${task}`}
      jobKey={job.key}
      variant={variant}
      task={task}
    />
  );
}

function Shortlist({
  jobKey,
  variant,
  task,
}: {
  jobKey: string;
  variant: "A" | "B";
  task: number;
}) {
  const job = p1Jobs.find((x) => x.key === jobKey)!;
  const applications = p1Applications[jobKey];
  const { log } = useResearch();
  useScreenOpen("P1", `shortlist-${jobKey}-${variant}-task${task}`);
  const startedAt = useRef(Date.now());
  const [threshold, setThreshold] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [expandedAt, setExpandedAt] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState<null | { elapsedMs: number }>(null);
  const top3 = useMemo(() => new Set(applications.slice(0, 3).map((x) => x.id)), [applications]);
  const base = { job: jobKey, variant, task };

  const shortened = variant === "B" && expandedAt === null;
  const passing = applications.filter((x) => x.score >= threshold);
  const visible = shortened ? passing.slice(0, perPage) : applications;
  const hiddenCount = applications.length - visible.length;

  function toggle(person: ResearchApplication) {
    const on = selected.includes(person.id);
    if (!on && selected.length >= MAX_SELECTED) return;
    const next = on ? selected.filter((x) => x !== person.id) : [...selected, person.id];
    setSelected(next);
    log("P1", on ? "unselect" : "select", {
      ...base,
      id: person.id,
      position: applications.indexOf(person) + 1,
      highlighted: top3.has(person.id),
      ms: Date.now() - startedAt.current,
    });
  }

  function invite() {
    const elapsedMs = Date.now() - startedAt.current;
    const chosen = applications.filter((x) => selected.includes(x.id));
    log("P1", "invite", {
      ...base,
      elapsedMs,
      expanded: expandedAt !== null,
      expandedAtMs: expandedAt,
      threshold: variant === "B" ? threshold : null,
      perPage: variant === "B" ? perPage : null,
      selected: chosen.map((x) => ({
        id: x.id,
        name: x.name,
        score: x.score,
        position: applications.indexOf(x) + 1,
        highlighted: top3.has(x.id),
      })),
      highlightedChosen: chosen.filter((x) => top3.has(x.id)).length,
    });
    setDone({ elapsedMs });
  }

  if (done) {
    const chosen = applications.filter((x) => selected.includes(x.id));
    return (
      <div className="research-page">
        <div className="panel research-done">
          <span className="t-label">
            Zadanie P1.{task} · wariant {variant} · zakończone
          </span>
          <h1 className="t-sec">
            {chosen.length}{" "}
            {plural(chosen.length, "osoba zaproszona", "osoby zaproszone", "osób zaproszonych")} na
            rozmowę
          </h1>
          <ul className="research-done-list">
            {chosen.map((x) => (
              <li key={x.id}>
                <span className="t-name">{x.name}</span>{" "}
                <span className="t-meta">· {x.headline}</span> <MatchScore score={x.score} />
                {top3.has(x.id) && <span className="badge warn">Top 3</span>}
              </li>
            ))}
          </ul>
          <p className="t-meta">
            Czas do wyboru: <span className="t-data">{Math.round(done.elapsedMs / 1000)} s</span>
            {variant === "B" &&
              ` · reszta listy ${expandedAt !== null ? `rozwinięta po ${Math.round(expandedAt / 1000)} s` : "nierozwinięta"}`}
          </p>
          <div className="research-actions">
            <Link className={buttonVariants()} to="/badanie">
              Wróć do panelu prowadzącego
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="console">
        <div className="c-head">
          <span>
            {job.company} / Ogłoszenia / {job.title}
          </span>
          <span>
            Zadanie P1.{task} · wariant {variant}
          </span>
        </div>
        <h1 className="c-title">
          {applications.length} zgłoszeń do „{job.title}”. Wybierz do trzech osób na rozmowę.
        </h1>
        <div className="c-stats">
          <div className="c-stat">
            <b>{counter(applications.length)}</b>
            <small>Zgłoszenia</small>
          </div>
          <div className="c-stat">
            <b>
              {selected.length}/{MAX_SELECTED}
            </b>
            <small>Wybrane</small>
          </div>
          <div className="c-stat">
            <b>{counter(visible.length)}</b>
            <small>Widoczne</small>
          </div>
        </div>
      </header>
      <div className="research-page">
        {variant === "B" && (
          <div className="panel shortlist-controls">
            <div className="cap">
              <span>Ustawienia listy</span>
              <span>Nic nie jest usuwane</span>
            </div>
            <label className="range-field">
              <span className="t-label">Próg Match Score</span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={threshold}
                aria-valuetext={`${threshold}%`}
                onChange={(e) => setThreshold(Number(e.target.value))}
                onPointerUp={() =>
                  log("P1", "slider", { ...base, slider: "threshold", value: threshold })
                }
                onKeyUp={() =>
                  log("P1", "slider", { ...base, slider: "threshold", value: threshold })
                }
              />
              <span className="t-data">od {threshold}%</span>
            </label>
            <label className="range-field">
              <span className="t-label">Zgłoszeń na stronie</span>
              <input
                type="range"
                min={5}
                max={40}
                step={5}
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                onPointerUp={() =>
                  log("P1", "slider", { ...base, slider: "perPage", value: perPage })
                }
                onKeyUp={() => log("P1", "slider", { ...base, slider: "perPage", value: perPage })}
              />
              <span className="t-data">{perPage}</span>
            </label>
            <p className="t-meta" aria-live="polite">
              Widocznych: <span className="t-data">{visible.length}</span> · pod „Pokaż pozostałe”:{" "}
              <span className="t-data">{hiddenCount}</span>
            </p>
          </div>
        )}
        <p className="t-meta list-legend">
          Lista według Match Score. Ciemny wiersz to osoba wybrana do zaproszenia.
          {variant === "B" && " Znacznik „Top 3” oznacza trzy najwyżej ocenione zgłoszenia."}
        </p>
        <div className="list shortlist" style={columns}>
          <div className="thead" aria-hidden="true">
            <span />
            <span>Nr</span>
            <span>Kandydat</span>
            <span />
            <span>Match Score ↓</span>
            <span>Stan</span>
            <span>Wiek</span>
          </div>
          {visible.map((person) => {
            const on = selected.includes(person.id);
            const position = applications.indexOf(person) + 1;
            return (
              <article key={person.id} className={on ? "row sl" : "row"}>
                <input
                  className="chk"
                  type="checkbox"
                  checked={on}
                  disabled={!on && selected.length >= MAX_SELECTED}
                  aria-label={`Zaproś na rozmowę: ${person.name}`}
                  onChange={() => toggle(person)}
                />
                <span className="nr">{String(position).padStart(4, "0")}</span>
                <div className="who">
                  <span className="t-name">{person.name}</span>
                  <span className="t-meta">
                    {person.headline} · {person.summary}
                  </span>
                  {on && <span className="t-label why">Do zaproszenia</span>}
                </div>
                <span className="top">
                  {variant === "B" && top3.has(person.id) && (
                    <span className="badge warn">★ Top 3</span>
                  )}
                </span>
                <span className="score">
                  <MatchScore score={person.score} />
                </span>
                <span className="stat">
                  <span className={person.status === "new" ? "badge" : "badge off"}>
                    {person.status === "new" ? "Nowe" : "Przejrzane"}
                  </span>
                </span>
                <span className="t-data upd" data-label="Wiek:">
                  {person.ageDays} {plural(person.ageDays, "dzień", "dni", "dni")}
                </span>
              </article>
            );
          })}
        </div>
        {shortened && hiddenCount > 0 && (
          <Button
            className="wide show-rest"
            variant="outline"
            onClick={() => {
              const at = Date.now() - startedAt.current;
              setExpandedAt(at);
              log("P1", "expand_rest", {
                ...base,
                ms: at,
                hidden: hiddenCount,
                threshold,
                perPage,
              });
            }}
          >
            Pokaż pozostałe ({hiddenCount})
          </Button>
        )}
        <div className="actbar" hidden={selected.length === 0}>
          <span className="t-label">
            {selected.length} z {MAX_SELECTED}{" "}
            {plural(selected.length, "wybrana", "wybrane", "wybranych")}
          </span>
          <button
            type="button"
            className="tx"
            onClick={() => {
              log("P1", "clear_selection", base);
              setSelected([]);
            }}
          >
            Wyczyść wybór
          </button>
          <Button variant="action" onClick={invite}>
            Zaproś {selected.length} {plural(selected.length, "osobę", "osoby", "osób")} na rozmowę
          </Button>
        </div>
      </div>
    </>
  );
}
