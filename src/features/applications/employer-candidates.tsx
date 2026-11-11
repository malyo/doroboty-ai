import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { MatchScore } from "@/features/prototype/match-score";
import { PageTitle } from "@/features/prototype/shell";
import { usePrototype } from "@/features/prototype/store";
import {
  MAX_INVITES,
  ageDays,
  currentPerson,
  isWaiting,
  pendingQuestion,
  stageLabels,
  type Application,
} from "@/features/prototype/model";
import { plural } from "@/lib/plural";
import { Impatience } from "./conditions";
import { StatusMessageForm } from "./status";

const DEFAULT_PER_PAGE = 10;

const columns = {
  "--cols": "18px minmax(180px,1fr) 84px 150px 150px 120px 140px",
  "--areas": '"chk who top score stat wait act"',
  "--areas-m": '"chk top score" "who who who" "stat wait wait" "act act act"',
} as React.CSSProperties;

function invitable(application: Application) {
  return application.stage === "submitted" || application.stage === "reviewed";
}

/**
 * Employer candidate list with the EXP1 shortened view (first N above a Match Score threshold,
 * "Pokaż pozostałe", Top 3, invite up to three people) and the EXP2 status tools
 * ("Nadal rozważam", message to waiting candidates, status questions).
 */
export function EmployerCandidatesPage() {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("");
  const [threshold, setThreshold] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [composing, setComposing] = useState(false);
  const [notice, setNotice] = useState("");
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const jobs = state.jobs.filter((x) => x.companyId === person.companyId);
  const all = useMemo(
    () =>
      state.applications
        .filter(
          (x) =>
            x.companyId === person.companyId &&
            (!jobId || x.jobId === jobId) &&
            `${x.candidateName} ${x.jobTitle}`
              .toLocaleLowerCase("pl")
              .includes(query.toLocaleLowerCase("pl")),
        )
        .sort((a, b) => b.score - a.score || a.candidateName.localeCompare(b.candidateName, "pl")),
    [state.applications, person.companyId, jobId, query],
  );
  const top3 = new Set(all.slice(0, 3).map((x) => x.id));
  const passing = all.filter((x) => x.score >= threshold);
  const visible = expanded ? all : passing.slice(0, perPage);
  const hidden = all.length - visible.length;
  const waiting = all.filter(isWaiting);
  const questions = all.filter((x) => isWaiting(x) && pendingQuestion(x)).length;

  function toggle(application: Application) {
    setSelected((current) =>
      current.includes(application.id)
        ? current.filter((x) => x !== application.id)
        : current.length < MAX_INVITES
          ? [...current, application.id]
          : current,
    );
  }

  function invite() {
    const names = all.filter((x) => selected.includes(x.id)).map((x) => x.candidateName);
    if (run({ type: "invite", applicationIds: selected })) {
      setNotice(`Zaproszono na rozmowę: ${names.join(", ")}.`);
      setSelected([]);
      resultsRef.current?.focus();
    }
  }

  return (
    <>
      <PageTitle
        action={
          <Link
            className={buttonVariants({ variant: "outline" })}
            to="/app/organizacja#przypomnienia"
          >
            Ustawienia przypomnień
          </Link>
        }
      >
        Kandydaci
      </PageTitle>
      {notice && (
        <p className="prototype-notice" role="status">
          {notice}
        </p>
      )}
      <div className="candidates-filters">
        <label className="field">
          <span>Szukaj kandydata lub oferty</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="field">
          <span>Oferta</span>
          <select
            value={jobId}
            onChange={(e) => {
              setJobId(e.target.value);
              setSelected([]);
            }}
          >
            <option value="">Wszystkie oferty</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="panel shortlist-controls">
        <div className="cap">
          <span>Krótka lista</span>
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
            onChange={(e) => {
              setThreshold(Number(e.target.value));
              setExpanded(false);
            }}
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
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setExpanded(false);
            }}
          />
          <span className="t-data">{perPage}</span>
        </label>
        <p className="t-meta" aria-live="polite">
          Widocznych: <span className="t-data">{visible.length}</span> · pod „Pokaż pozostałe”:{" "}
          <span className="t-data">{hidden}</span>
          {questions > 0 &&
            ` · ${questions} ${plural(questions, "pytanie", "pytania", "pytań")} o status czeka na odpowiedź`}
        </p>
      </div>
      <div className="sec-head">
        <div>
          <h2 className="t-sec" ref={resultsRef} tabIndex={-1}>
            Zgłoszenia ({all.length})
          </h2>
          <p className="t-meta">
            Według Match Score. Ciemny wiersz to osoba wybrana do zaproszenia; „★ Top 3” to trzy
            najwyżej ocenione zgłoszenia.
          </p>
        </div>
        <Button
          aria-expanded={composing}
          disabled={!waiting.length}
          onClick={() => setComposing((x) => !x)}
        >
          Wyślij wszystkim kandydatom informację, że rekrutacja trwa
        </Button>
      </div>
      {composing && (
        <StatusMessageForm
          count={waiting.length}
          jobTitle={jobs.find((x) => x.id === jobId)?.title}
          onCancel={() => setComposing(false)}
          onSend={(reason, nextContact) => {
            if (
              run({
                type: "status_message",
                applicationIds: waiting.map((x) => x.id),
                reason,
                nextContact,
              })
            ) {
              setComposing(false);
              setNotice(
                `Wysłano informację do ${waiting.length} ${plural(waiting.length, "osoby", "osób", "osób")}.`,
              );
              return true;
            }
            return false;
          }}
        />
      )}
      <div className="list record-list candidates-list" style={columns}>
        <div className="thead" aria-hidden="true">
          <span />
          <span>Kandydat</span>
          <span />
          <span>Match Score ↓</span>
          <span>Etap</span>
          <span>Czeka / oczekuje</span>
          <span />
        </div>
        {visible.length ? (
          visible.map((a) => {
            const on = selected.includes(a.id);
            const question = isWaiting(a) ? pendingQuestion(a) : undefined;
            const considering = (a.updates ?? []).filter((x) => x.kind === "considering").at(-1);
            return (
              <article className={on ? "row sl" : "row"} key={a.id}>
                <input
                  className="chk"
                  type="checkbox"
                  checked={on}
                  disabled={!invitable(a) || (!on && selected.length >= MAX_INVITES)}
                  aria-label={`Zaproś na rozmowę: ${a.candidateName}`}
                  onChange={() => toggle(a)}
                />
                <div className="who">
                  <h2 className="t-name">
                    <Link to={`/app/kandydaci/${a.id}`}>{a.candidateName}</Link>
                  </h2>
                  <span className="t-meta">{a.jobTitle}</span>
                  <span className="t-meta record-summary">{a.summary}</span>
                  {on && <span className="t-label why">Do zaproszenia</span>}
                  {!on && considering && isWaiting(a) && (
                    <span className="t-label why">
                      Nadal rozważam ·{" "}
                      {new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" }).format(
                        new Date(considering.at),
                      )}
                    </span>
                  )}
                </div>
                <span className="top">
                  {top3.has(a.id) && <span className="badge warn">★ Top 3</span>}
                </span>
                <span className="score">
                  <MatchScore score={a.score} />
                </span>
                <span className="stat">
                  {question ? (
                    <span className="badge warn">Pyta o status</span>
                  ) : (
                    <span className={isWaiting(a) ? "badge" : "badge off"}>
                      {stageLabels[a.stage]}
                    </span>
                  )}
                </span>
                <span className="wait">
                  <Impatience conditions={a.conditions} ageDays={ageDays(a)} />
                </span>
                <span className="row-actions">
                  {isWaiting(a) && (
                    <Button
                      size="sm"
                      aria-label={`Nadal rozważam: ${a.candidateName}`}
                      onClick={() => {
                        if (run({ type: "still_considering", applicationId: a.id }))
                          setNotice(`${a.candidateName} zobaczy, że nadal rozważasz zgłoszenie.`);
                      }}
                    >
                      Nadal rozważam
                    </Button>
                  )}
                </span>
              </article>
            );
          })
        ) : (
          <div className="row">
            <p className="t-meta empty-row">Brak aplikacji spełniających kryteria.</p>
          </div>
        )}
      </div>
      {!expanded && hidden > 0 && (
        <Button className="wide show-rest" variant="outline" onClick={() => setExpanded(true)}>
          Pokaż pozostałe ({hidden})
        </Button>
      )}
      <div className="actbar" hidden={selected.length === 0}>
        <span className="t-label">
          {selected.length} z {MAX_INVITES}{" "}
          {plural(selected.length, "wybrana", "wybrane", "wybranych")}
        </span>
        <button type="button" className="tx" onClick={() => setSelected([])}>
          Wyczyść wybór
        </button>
        <Button variant="action" onClick={invite}>
          Zaproś {selected.length} {plural(selected.length, "osobę", "osoby", "osób")} na rozmowę
        </Button>
      </div>
    </>
  );
}
