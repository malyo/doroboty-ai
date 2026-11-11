import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { plural } from "@/lib/plural";
import { formatSalary, p2Job, p2Waiting, responseTimeDays } from "./data";
import {
  ConditionsList,
  Impatience,
  counter,
  formatDate,
  formatDateTime,
  useScreenOpen,
} from "./components";
import { useResearch, type ResearchState } from "./store";

const reasonSuggestions = [
  "Czekamy na wewnętrzne ustalenia.",
  "Czekamy na zatwierdzenie budżetu.",
  "Najpierw rozmawiamy z osobami, które zgłosiły się wcześniej.",
];

/** The candidate in EXP2 applied 7 days before the session. */
const CANDIDATE_AGE_DAYS = 7;

const waitingColumns = {
  "--cols": "minmax(220px,1fr) 190px minmax(240px,300px) 190px",
  "--areas": '"who wait cond act"',
  "--areas-m": '"who who who" "wait wait wait" "cond cond cond" "act act act"',
} as React.CSSProperties;

function statusMessageText(reason: string, nextContact: string) {
  return `Dziękujemy za zgłoszenie na stanowisko ${p2Job.title}. Rekrutacja trwa. ${reason.trim()} Kolejny kontakt planujemy do ${formatDate(nextContact)}.`;
}

function isOverdue(person: (typeof p2Waiting)[number]) {
  const expected = person.conditions.responseTime
    ? responseTimeDays[person.conditions.responseTime]
    : undefined;
  return expected !== undefined && person.ageDays > expected;
}

/** EXP2 recruiter: waiting applications, "Nadal rozważam", status message to all and the question. */
export function RecruiterStatusPage() {
  useScreenOpen("P2", "recruiter-list");
  const { state, update, log } = useResearch();
  const [composing, setComposing] = useState(false);
  const [reason, setReason] = useState("");
  const [nextContact, setNextContact] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const question = state.p2.question;
  const pendingQuestion = question && !question.answer;
  const lastMessage = state.p2.statusMessages.at(-1);
  const overdue = p2Waiting.filter(isOverdue).length;
  const today = new Date().toISOString().slice(0, 10);

  function markConsidering(id: string) {
    const at = new Date().toISOString();
    update((s) => ({ ...s, p2: { ...s.p2, considering: { ...s.p2.considering, [id]: at } } }));
    log("P2", "still_considering", { id });
  }

  function answer(kind: "considering" | "rejected") {
    update((s) => ({
      ...s,
      p2: {
        ...s.p2,
        question: s.p2.question && {
          ...s.p2.question,
          answer: kind,
          answeredAt: new Date().toISOString(),
        },
      },
    }));
    log("P2", "question_answered", { answer: kind });
    setNotice(
      kind === "considering"
        ? "Kandydat zobaczy: „Pracodawca nadal rozważa Twoje zgłoszenie”."
        : "Kandydat zobaczy, że rekrutacja z jego udziałem została zakończona.",
    );
  }

  function send(e: FormEvent) {
    e.preventDefault();
    const problems = [
      ...(reason.trim().length < 10 ? ["powód oczekiwania (co najmniej 10 znaków)"] : []),
      ...(!nextContact || nextContact < today ? ["orientacyjna data kolejnego kontaktu"] : []),
    ];
    setErrors(problems);
    log("P2", "status_message_attempt", { valid: problems.length === 0, reason, nextContact });
    if (problems.length) {
      reasonRef.current?.focus();
      return;
    }
    const message = {
      reason: reason.trim(),
      nextContact,
      sentAt: new Date().toISOString(),
      to: p2Waiting.length,
    };
    update((s) => ({ ...s, p2: { ...s.p2, statusMessages: [...s.p2.statusMessages, message] } }));
    log("P2", "status_message_sent", message);
    setComposing(false);
    setNotice(`Wysłano informację do ${p2Waiting.length} osób.`);
  }

  return (
    <>
      <header className="console">
        <div className="c-head">
          <span>
            {p2Job.company} / Ogłoszenia / {p2Job.title}
          </span>
          <span>Rekruter</span>
        </div>
        <h1 className="c-title">
          {p2Waiting.length} osób czeka na odpowiedź, {overdue} dłużej, niż oczekuje.
        </h1>
        <div className="c-stats">
          <div className="c-stat">
            <b>{counter(p2Waiting.length)}</b>
            <small>Oczekujące</small>
          </div>
          <div className="c-stat">
            <b>{counter(overdue)}</b>
            <small>Czas minął</small>
          </div>
          <div className="c-stat">
            <b>{counter(pendingQuestion ? 1 : 0)}</b>
            <small>Pytania o status</small>
          </div>
        </div>
      </header>
      <div className="research-page">
        {notice && (
          <p className="prototype-notice" role="status">
            {notice}
          </p>
        )}
        {question && (
          <section className="status-question">
            <h2 className="t-sec">Pytanie o status</h2>
            <div className="list" style={waitingColumns}>
              <article className={pendingQuestion ? "row sl" : "row"}>
                <div className="who">
                  <span className="t-name">Kandydat · {p2Job.title}</span>
                  <span className="t-meta">„Czy moje zgłoszenie jest jeszcze rozważane?”</span>
                  <span className="t-label why">
                    {pendingQuestion
                      ? `Pyta o status · ${formatDateTime(question.askedAt)}`
                      : `Odpowiedziano: ${question.answer === "considering" ? "Nadal rozważam" : "Rezygnujemy"}`}
                  </span>
                </div>
                <span className="t-data" data-label="Czeka:">
                  {CANDIDATE_AGE_DAYS} dni
                </span>
                <span />
                <span className="row-actions">
                  {pendingQuestion && (
                    <>
                      <Button variant="action" size="sm" onClick={() => answer("considering")}>
                        Nadal rozważam
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => answer("rejected")}>
                        Rezygnujemy
                      </Button>
                    </>
                  )}
                </span>
              </article>
            </div>
          </section>
        )}
        <div className="sec-head">
          <div>
            <h2 className="t-sec">Oczekujące zgłoszenia</h2>
            <p className="t-meta">
              Ciemny wiersz: kandydat czeka dłużej, niż sam oczekuje odpowiedzi.
              {lastMessage &&
                ` Ostatnia informacja „rekrutacja trwa” wysłana ${formatDateTime(lastMessage.sentAt)}.`}
            </p>
          </div>
          <div className="research-actions">
            <Link className={buttonVariants({ variant: "outline" })} to="/badanie/p2/przypomnienia">
              Ustawienia przypomnień
            </Link>
            <Button
              variant={pendingQuestion ? "default" : "action"}
              aria-expanded={composing}
              onClick={() => {
                setComposing(true);
                log("P2", "status_message_open");
                setTimeout(() => reasonRef.current?.focus());
              }}
            >
              Wyślij wszystkim kandydatom informację, że rekrutacja trwa
            </Button>
          </div>
        </div>
        {composing && (
          <form className="panel status-compose" onSubmit={send} noValidate>
            <div className="cap">
              <span>Wiadomość do {p2Waiting.length} oczekujących</span>
              <span>Powód i data są wymagane</span>
            </div>
            {errors.length > 0 && (
              <div className="note-err" role="alert">
                <b>Uzupełnij:</b> {errors.join(", ")}.
              </div>
            )}
            <div className={errors.some((x) => x.startsWith("powód")) ? "field err" : "field"}>
              <label htmlFor="p2-reason">Powód oczekiwania</label>
              <textarea
                id="p2-reason"
                ref={reasonRef}
                rows={3}
                value={reason}
                aria-invalid={errors.some((x) => x.startsWith("powód")) || undefined}
                aria-describedby="p2-reason-hint"
                onChange={(e) => setReason(e.target.value)}
              />
              <span className="hint" id="p2-reason-hint">
                Napisz, na co czekacie. Kandydat zobaczy to zdanie.
              </span>
              <div className="chips reason-chips">
                {reasonSuggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    className="fpill"
                    onClick={() => {
                      setReason(text);
                      log("P2", "reason_suggestion", { text });
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={errors.some((x) => x.startsWith("orientacyjna")) ? "field err" : "field"}
            >
              <label htmlFor="p2-date">Orientacyjna data kolejnego kontaktu</label>
              <input
                id="p2-date"
                type="date"
                min={today}
                value={nextContact}
                aria-invalid={errors.some((x) => x.startsWith("orientacyjna")) || undefined}
                onChange={(e) => setNextContact(e.target.value)}
              />
            </div>
            <figure className="fig message-preview">
              <span className="t-label">Podgląd</span>
              <p>
                {reason.trim() && nextContact
                  ? statusMessageText(reason, nextContact)
                  : "Podgląd pojawi się po wpisaniu powodu i daty."}
              </p>
            </figure>
            <div className="research-actions">
              <Button type="submit" variant="action">
                Wyślij do {p2Waiting.length} osób
              </Button>
              <button type="button" className="tx" onClick={() => setComposing(false)}>
                Anuluj
              </button>
            </div>
          </form>
        )}
        <div className="list waiting-list" style={waitingColumns}>
          <div className="thead" aria-hidden="true">
            <span>Kandydat</span>
            <span>Czeka / oczekuje</span>
            <span>Warunki kandydata</span>
            <span />
          </div>
          {p2Waiting.map((person) => {
            const consideringAt = state.p2.considering[person.id];
            const over = isOverdue(person);
            return (
              <article key={person.id} className={over && !consideringAt ? "row sl" : "row"}>
                <div className="who">
                  <span className="t-name">{person.name}</span>
                  <span className="t-meta">
                    {person.headline} · {person.summary}
                  </span>
                  {over && !consideringAt && (
                    <span className="t-label why">Czeka dłużej, niż oczekuje</span>
                  )}
                  {consideringAt && (
                    <span className="t-label why">
                      Nadal rozważam · {formatDateTime(consideringAt)}
                    </span>
                  )}
                </div>
                <Impatience conditions={person.conditions} ageDays={person.ageDays} />
                <ConditionsList conditions={person.conditions} />
                <span className="row-actions">
                  <Button
                    size="sm"
                    aria-pressed={Boolean(consideringAt)}
                    aria-label={`Nadal rozważam: ${person.name}`}
                    disabled={Boolean(consideringAt)}
                    onClick={() => markConsidering(person.id)}
                  >
                    Nadal rozważam
                  </Button>
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

/** EXP2 recruiter: automatic reminder settings with a message preview (no real sending). */
export function ReminderSettingsPage() {
  useScreenOpen("P2", "reminder-settings");
  const { state, update, log } = useResearch();
  const [draft, setDraft] = useState(state.p2.reminder);
  const [saved, setSaved] = useState(false);
  const recipients =
    draft.audience === "all"
      ? p2Waiting.filter((x) => x.ageDays >= draft.days)
      : p2Waiting.filter((x) => {
          const expected = x.conditions.responseTime
            ? responseTimeDays[x.conditions.responseTime]
            : undefined;
          return x.ageDays >= (expected ?? draft.days);
        });
  const preview = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const setField = <K extends keyof ResearchState["p2"]["reminder"]>(
    key: K,
    value: ResearchState["p2"]["reminder"][K],
  ) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
    log("P2", "reminder_field", { field: key, value });
  };
  return (
    <div className="research-page">
      <div className="page-heading">
        <h1>Przypomnienia dla kandydatów</h1>
      </div>
      <p className="t-meta research-hint">
        Gdy nie możesz jeszcze nikogo zaprosić, kandydaci dostaną informację, że rekrutacja trwa.
        Prototyp pokazuje tylko ustawienia i podgląd; nic nie jest wysyłane.
      </p>
      <form
        className="panel reminder-form"
        onSubmit={(e) => {
          e.preventDefault();
          const reminder = { ...draft, savedAt: new Date().toISOString() };
          update((s) => ({ ...s, p2: { ...s.p2, reminder } }));
          log("P2", "reminder_saved", reminder);
          setSaved(true);
        }}
      >
        <label className="reminder-toggle">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setField("enabled", e.target.checked)}
          />
          Wysyłaj przypomnienie automatycznie
        </label>
        <fieldset className="field" disabled={!draft.enabled}>
          <legend className="t-label">Do kogo</legend>
          <div className="choice">
            <label>
              <input
                type="radio"
                name="audience"
                checked={draft.audience === "preference"}
                onChange={() => setField("audience", "preference")}
              />
              Według preferencji kandydata
            </label>
            <label>
              <input
                type="radio"
                name="audience"
                checked={draft.audience === "all"}
                onChange={() => setField("audience", "all")}
              />
              Wszystkich oczekujących
            </label>
          </div>
          <span className="hint">
            {draft.audience === "preference"
              ? "Wiadomość wyjdzie, gdy minie czas odpowiedzi, którego oczekuje kandydat. Bez preferencji: po liczbie dni poniżej."
              : "Wiadomość wyjdzie do każdego, kto czeka co najmniej tyle dni, ile ustawisz poniżej."}
          </span>
        </fieldset>
        <div className="field">
          <label htmlFor="reminder-days">Po ilu dniach bez odpowiedzi</label>
          <select
            id="reminder-days"
            disabled={!draft.enabled}
            value={draft.days}
            onChange={(e) => setField("days", Number(e.target.value))}
          >
            {[3, 5, 7, 10, 14].map((d) => (
              <option key={d} value={d}>
                {d} dni
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="reminder-reason">Powód oczekiwania</label>
          <textarea
            id="reminder-reason"
            rows={2}
            disabled={!draft.enabled}
            value={draft.reason}
            onChange={(e) => setField("reason", e.target.value)}
          />
        </div>
        <figure className="fig message-preview">
          <span className="t-label">
            Podgląd · teraz trafiłoby do {recipients.length}{" "}
            {plural(recipients.length, "osoby", "osób", "osób")}
          </span>
          <p>{statusMessageText(draft.reason || "—", preview)}</p>
          <figcaption className="t-meta">
            Data kolejnego kontaktu: 7 dni od wysłania (przykład).
          </figcaption>
        </figure>
        <div className="research-actions">
          <Button type="submit" variant="action">
            Zapisz ustawienia
          </Button>
          <Link className="tx" to="/badanie/p2/rekruter">
            Wróć do zgłoszeń
          </Link>
        </div>
        <p role="status" className={saved ? "prototype-notice" : "sr-only"}>
          {saved ? "Ustawienia przypomnień zapisane." : ""}
        </p>
      </form>
    </div>
  );
}

/** EXP2 candidate: "Moje zgłoszenia" with one application after 7 days and the chosen scenario. */
export function CandidateStatusPage() {
  const { state, update, log } = useResearch();
  const scenario = state.p2.scenario;
  useScreenOpen("P2", `candidate-${scenario}`);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const { question, askAfterDays, withdrawnAt } = state.p2;
  const canAsk = CANDIDATE_AGE_DAYS >= askAfterDays;
  const sentAt = new Date(Date.now() - CANDIDATE_AGE_DAYS * 864e5).toISOString();
  const message =
    state.p2.statusMessages.at(-1) ??
    ({
      reason: "Czekamy na wewnętrzne ustalenia budżetu zespołu.",
      nextContact: new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10),
      sentAt: new Date(Date.now() - 864e5).toISOString(),
      to: 1,
    } as const);
  const statusLabel = withdrawnAt
    ? "Wycofane"
    : question?.answer === "rejected"
      ? "Zakończone"
      : question?.answer === "considering"
        ? "Nadal rozważane"
        : scenario === "queue"
          ? "W kolejce"
          : scenario === "silence"
            ? "Wysłane"
            : "Rekrutacja trwa";

  return (
    <div className="research-page">
      <div className="page-heading">
        <h1>Moje zgłoszenia</h1>
      </div>
      <div className="list candidate-applications" style={candidateColumns}>
        <div className="thead" aria-hidden="true">
          <span>Oferta</span>
          <span>Wysłane</span>
          <span>Stan</span>
        </div>
        <article className="row">
          <div className="who">
            <span className="t-name">{p2Job.title}</span>
            <span className="t-meta">
              {p2Job.company} · {p2Job.location}
            </span>
          </div>
          <span className="t-data" data-label="Wysłane:">
            {CANDIDATE_AGE_DAYS} dni temu
          </span>
          <span className="stat">
            <span
              className={
                withdrawnAt || question?.answer === "rejected"
                  ? "badge off"
                  : scenario === "silence" && !question?.answer
                    ? "badge"
                    : "badge warn"
              }
            >
              {statusLabel}
            </span>
          </span>
        </article>
      </div>

      {!withdrawnAt && (
        <>
          {scenario === "queue" && !question?.answer && (
            <div className="panel candidate-status">
              <span className="t-label">Stan zgłoszenia · w kolejce</span>
              <p className="t-body">
                Firma najpierw rozmawia z osobami, które zgłosiły się wcześniej. Twoje zgłoszenie
                jest <b>4. w kolejce</b> do przeglądu.
              </p>
            </div>
          )}
          {(scenario === "message" || scenario === "message-no-salary") && (
            <div className="panel candidate-status">
              <div className="cap">
                <span>Wiadomość od pracodawcy</span>
                <span>{formatDateTime(message.sentAt)}</span>
              </div>
              <p className="t-body">{statusMessageText(message.reason, message.nextContact)}</p>
              <dl className="kv">
                {scenario === "message" && (
                  <>
                    <dt>Widełki z ogłoszenia</dt>
                    <dd className="t-data">
                      {formatSalary(p2Job.salary.min, p2Job.salary.max)} · {p2Job.salary.contract}
                    </dd>
                  </>
                )}
                <dt>Zakres roli</dt>
                <dd>{p2Job.scope}</dd>
              </dl>
            </div>
          )}
          {question?.answer && (
            <div className="panel candidate-status" role="status">
              <span className="t-label">
                Odpowiedź pracodawcy · {formatDateTime(question.answeredAt!)}
              </span>
              <p className="t-body">
                {question.answer === "considering"
                  ? "Pracodawca nadal rozważa Twoje zgłoszenie."
                  : "Pracodawca zakończył rekrutację z Twoim udziałem."}
              </p>
            </div>
          )}
          <div className="candidate-next">
            {question && !question.answer ? (
              <p className="t-meta" role="status">
                Zapytano o status {formatDateTime(question.askedAt)}. Pracodawca jeszcze nie
                odpowiedział.
              </p>
            ) : !question && canAsk ? (
              <Button
                variant="action"
                onClick={() => {
                  update((s) => ({
                    ...s,
                    p2: { ...s.p2, question: { askedAt: new Date().toISOString() } },
                  }));
                  log("P2", "ask_status", { scenario, ageDays: CANDIDATE_AGE_DAYS, askAfterDays });
                }}
              >
                Zapytaj o status
              </Button>
            ) : !question ? (
              <p className="t-meta">
                O status zapytasz po {askAfterDays} dniach od zgłoszenia (za{" "}
                {askAfterDays - CANDIDATE_AGE_DAYS}{" "}
                {plural(askAfterDays - CANDIDATE_AGE_DAYS, "dzień", "dni", "dni")}).
              </p>
            ) : null}
            <Link
              className={buttonVariants()}
              to="/oferty"
              onClick={() => log("P2", "browse_other_offers", { scenario })}
            >
              Przeglądaj inne oferty
            </Link>
            <button
              type="button"
              className="tx"
              onClick={() => {
                setConfirmWithdraw(true);
                log("P2", "withdraw_open", { scenario });
              }}
            >
              Wycofaj zgłoszenie
            </button>
          </div>
        </>
      )}
      {withdrawnAt && (
        <div className="panel candidate-status" role="status">
          <span className="t-label">Wycofane · {formatDateTime(withdrawnAt)}</span>
          <p className="t-body">Wycofałeś zgłoszenie. Pracodawca zobaczy je jako wycofane.</p>
        </div>
      )}
      <p className="t-meta research-hint">
        Zgłoszenie wysłane {formatDate(sentAt)}. Wiadomości od pracodawcy pojawiają się tylko po
        jego działaniu.
      </p>
      <ConfirmDialog
        open={confirmWithdraw}
        onOpenChange={setConfirmWithdraw}
        title="Wycofać zgłoszenie?"
        description="Pracodawca zobaczy, że wycofałeś zgłoszenie. Tego nie można cofnąć w prototypie."
        label="Wycofaj"
        pending={false}
        onConfirm={() => {
          const at = new Date().toISOString();
          update((s) => ({ ...s, p2: { ...s.p2, withdrawnAt: at } }));
          log("P2", "withdraw", { scenario });
          setConfirmWithdraw(false);
        }}
      />
    </div>
  );
}

const candidateColumns = {
  "--cols": "minmax(220px,1fr) 140px 170px",
  "--areas": '"who upd stat"',
  "--areas-m": '"who who who" "upd upd stat"',
} as React.CSSProperties;
