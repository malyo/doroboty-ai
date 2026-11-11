import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { downloadText } from "@/features/prototype/settings";
import { p1Jobs } from "./data";
import { counter, formatDateTime, scenarioLabels, useScreenOpen } from "./components";
import { eventsToCsv, useResearch, type P2Scenario } from "./store";

/** Facilitator panel: participant, task order, scenario, paths for every task and the event log. */
export function ResearchHub() {
  useScreenOpen("HUB", "panel");
  const { state, update, log, newSession } = useResearch();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [aJob, bJob] =
    state.p1Order === "ml-first" ? [p1Jobs[0], p1Jobs[1]] : [p1Jobs[1], p1Jobs[0]];
  const fileBase = `badanie-${state.participant.trim().replace(/[^\p{L}\p{N}-]+/gu, "-") || "uczestnik"}`;
  const openCandidateScenario = (scenario: P2Scenario) => {
    update((s) => ({
      ...s,
      p2: { ...s.p2, scenario, question: undefined, withdrawnAt: undefined },
    }));
    log("HUB", "scenario_set", { scenario });
    navigate("/badanie/p2/kandydat");
  };
  return (
    <>
      <header className="console">
        <div className="c-head">
          <span>DoRoboty / Badanie / Panel prowadzącego</span>
          <span>Sesja od {formatDateTime(state.sessionStartedAt)}</span>
        </div>
        <h1 className="c-title">Prototypy EXP1–EXP3: ponowny zakup pracodawców.</h1>
        <div className="c-stats">
          <div className="c-stat">
            <b>{counter(state.events.length)}</b>
            <small>Zdarzenia w sesji</small>
          </div>
          <div className="c-stat">
            <b>03</b>
            <small>Prototypy</small>
          </div>
        </div>
      </header>
      <div className="research-page">
        <section>
          <h2 className="t-sec">Sesja</h2>
          <div className="panel research-session">
            <label className="field">
              <span>Uczestnik (kod, bez danych osobowych)</span>
              <input
                value={state.participant}
                maxLength={40}
                placeholder="np. R03 albo K07"
                onChange={(e) => update((s) => ({ ...s, participant: e.target.value }))}
              />
            </label>
            <fieldset className="choice" aria-label="Kolejność wariantów EXP1">
              <legend className="t-label">Kolejność wariantów EXP1</legend>
              {(
                [
                  ["ml-first", `A: ${p1Jobs[0].title} → B: ${p1Jobs[1].title}`],
                  ["pm-first", `A: ${p1Jobs[1].title} → B: ${p1Jobs[0].title}`],
                ] as const
              ).map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="p1-order"
                    checked={state.p1Order === value}
                    onChange={() => {
                      update((s) => ({ ...s, p1Order: value }));
                      log("HUB", "p1_order_set", { order: value });
                    }}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <label className="field research-days">
              <span>EXP2: „Zapytaj o status” po ilu dniach</span>
              <input
                type="number"
                min={1}
                max={30}
                value={state.p2.askAfterDays}
                onChange={(e) => {
                  const askAfterDays = Math.min(30, Math.max(1, Number(e.target.value) || 1));
                  update((s) => ({ ...s, p2: { ...s.p2, askAfterDays } }));
                }}
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="t-sec">Ścieżki zadań</h2>
          <p className="t-meta research-hint">
            Otwórz ścieżkę i oddaj uczestnikowi ekran. Widok i scenariusz zmienisz też z paska na
            górze każdego ekranu.
          </p>
          <div className="list task-list" style={taskColumns}>
            <div className="thead" aria-hidden="true">
              <span>Nr</span>
              <span>Zadanie</span>
              <span>Widok</span>
              <span />
            </div>
            <TaskRow
              nr="P1.1"
              title={`Wybierz do trzech osób: ${aJob.title}`}
              meta="Wariant A: pełna lista"
              view="Rekruter"
              to={`/badanie/p1/${aJob.key}/A`}
            />
            <TaskRow
              nr="P1.1"
              title={`Wybierz do trzech osób: ${bJob.title}`}
              meta="Wariant B: pierwsze 10, suwaki, podświetlone 3"
              view="Rekruter"
              to={`/badanie/p1/${bJob.key}/B`}
            />
            <TaskRow
              nr="P1.2"
              title="Ustaw listę tak, jak Ci wygodnie, i wybierz"
              meta={`Wariant B: ${bJob.title}`}
              view="Rekruter"
              to={`/badanie/p1/${bJob.key}/B?zadanie=2`}
            />
            <article className="row">
              <span className="nr">P2.K</span>
              <div className="who">
                <span className="t-name">Zgłoszenie sprzed 7 dni: co robisz dalej?</span>
                <span className="t-meta">Otwórz scenariusz w kolejności dla tego uczestnika</span>
                <div className="scenario-buttons">
                  {(Object.keys(scenarioLabels) as P2Scenario[]).map((scenario) => (
                    <button
                      key={scenario}
                      type="button"
                      className="fpill"
                      aria-pressed={state.p2.scenario === scenario}
                      onClick={() => openCandidateScenario(scenario)}
                    >
                      {scenarioLabels[scenario]}
                    </button>
                  ))}
                </div>
              </div>
              <span className="t-meta">Kandydat</span>
              <span />
            </article>
            <TaskRow
              nr="P2.R1"
              title="Zajmij się kandydatami czekającymi na decyzję budżetu"
              meta="Lista z wiekiem zgłoszeń, „Nadal rozważam”, wiadomość do wszystkich"
              view="Rekruter"
              to="/badanie/p2/rekruter"
            />
            <TaskRow
              nr="P2.R2"
              title="Ustaw, żeby takie przypomnienie wysyłało się samo"
              meta="Ustawienia przypomnienia i podgląd wiadomości"
              view="Rekruter"
              to="/badanie/p2/przypomnienia"
            />
            <article className="row">
              <span className="nr">P2.R3</span>
              <div className="who">
                <span className="t-name">Kandydat zapytał o status. Odpowiedz.</span>
                <span className="t-meta">
                  {state.p2.question
                    ? `Pytanie z ${formatDateTime(state.p2.question.askedAt)}${state.p2.question.answer ? " · odpowiedziane" : ""}`
                    : "Pytanie zada kandydat w swoim widoku albo zasymuluj je tutaj"}
                </span>
              </div>
              <span className="t-meta">Rekruter</span>
              <button
                type="button"
                className="tx"
                onClick={() => {
                  update((s) => ({
                    ...s,
                    p2: { ...s.p2, question: { askedAt: new Date().toISOString() } },
                  }));
                  log("HUB", "p2_question_simulated");
                  navigate("/badanie/p2/rekruter");
                }}
              >
                Zasymuluj pytanie i otwórz
              </button>
            </article>
            <TaskRow
              nr="P3.R1"
              title="Utwórz ogłoszenie: lider AI, budżet niezatwierdzony"
              meta="Krok „Wynagrodzenie i zakres” z zachętą do widełek"
              view="Rekruter"
              to="/badanie/p3/ogloszenie"
            />
            <TaskRow
              nr="P3.K"
              title="Zgłoś się i uzupełnij „Moje warunki”"
              meta={state.p3.job ? "Na opublikowane ogłoszenie" : "Na ogłoszenie przykładowe"}
              view="Kandydat"
              to="/badanie/p3/warunki"
            />
            <TaskRow
              nr="P3.R2"
              title="Przejrzyj trzy zgłoszenia z warunkami i wybierz"
              meta="Warunki kandydata obok zgłoszenia"
              view="Rekruter"
              to="/badanie/p3/zgloszenia"
            />
          </div>
        </section>

        <section>
          <div className="sec-head">
            <div>
              <h2 className="t-sec">Dziennik zdarzeń</h2>
              <p className="t-meta">
                Zapis kliknięć i czasów tylko w tej przeglądarce. Eksportuj po każdej sesji.
              </p>
            </div>
            <div className="research-export">
              <Button
                variant="outline"
                onClick={() => {
                  downloadText(
                    `${fileBase}.json`,
                    JSON.stringify(
                      {
                        participant: state.participant,
                        sessionStartedAt: state.sessionStartedAt,
                        state: { ...state, events: undefined },
                        events: state.events,
                      },
                      null,
                      2,
                    ),
                  );
                }}
              >
                Eksportuj JSON
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadText(
                    `${fileBase}.csv`,
                    eventsToCsv(state.events, state.participant),
                    "text/csv",
                  )
                }
              >
                Eksportuj CSV
              </Button>
              <button type="button" className="tx" onClick={() => setConfirming(true)}>
                Nowa sesja
              </button>
            </div>
          </div>
          {state.events.length ? (
            <div className="list event-list" style={eventColumns}>
              <div className="thead" aria-hidden="true">
                <span>Czas</span>
                <span>Prototyp</span>
                <span>Zdarzenie</span>
                <span>Dane</span>
              </div>
              {state.events
                .slice(-12)
                .reverse()
                .map((event, index) => (
                  <div className="row" key={`${event.at}-${index}`}>
                    <span className="t-data">+{Math.round(event.ms / 1000)} s</span>
                    <span className="seg">{event.prototype}</span>
                    <span className="t-data">{event.type}</span>
                    <span className="t-meta event-data">
                      {event.data ? JSON.stringify(event.data) : "—"}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty">
              <span className="t-label">0 zdarzeń</span>
              <p>Zdarzenia pojawią się, gdy uczestnik zacznie klikać.</p>
            </div>
          )}
        </section>
        <p className="t-meta research-hint">
          Ekrany produktu (oferty, panel kandydata i pracodawcy) działają jak dotąd:{" "}
          <Link to="/">strona główna</Link>.
        </p>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Rozpocząć nową sesję?"
        description="Dziennik zdarzeń i stan prototypów zostaną wyczyszczone. Najpierw wyeksportuj dane, jeśli są potrzebne."
        label="Wyczyść i zacznij"
        pending={false}
        onOpenChange={setConfirming}
        onConfirm={() => {
          newSession();
          setConfirming(false);
        }}
      />
    </>
  );
}

const taskColumns = {
  "--cols": "56px minmax(240px,1fr) 110px 200px",
  "--areas": '"nr who stat go"',
  "--areas-m": '"nr stat stat" "who who who" "go go go"',
} as React.CSSProperties;

const eventColumns = {
  "--cols": "80px 60px 200px minmax(0,1fr)",
  "--areas": '"a b c d"',
} as React.CSSProperties;

function TaskRow({
  nr,
  title,
  meta,
  view,
  to,
}: {
  nr: string;
  title: string;
  meta: string;
  view: string;
  to: string;
}) {
  return (
    <article className="row">
      <span className="nr">{nr}</span>
      <div className="who">
        <span className="t-name">{title}</span>
        <span className="t-meta">{meta}</span>
      </div>
      <span className="t-meta">{view}</span>
      <Link className={buttonVariants({ size: "sm" })} to={to}>
        Otwórz
      </Link>
    </article>
  );
}
