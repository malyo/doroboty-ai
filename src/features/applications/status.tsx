import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ASK_STATUS_AFTER_DAYS,
  ageDays,
  daysUntilStatusQuestion,
  isWaiting,
  pendingQuestion,
  type Application,
  type StatusUpdate,
} from "@/features/prototype/model";
import { usePrototype } from "@/features/prototype/store";
import type { Job } from "@/features/jobs/types";
import { plural } from "@/lib/plural";
import { ConditionsList, bandRanges } from "./conditions";

export const reasonSuggestions = [
  "Czekamy na wewnętrzne ustalenia.",
  "Czekamy na zatwierdzenie budżetu.",
  "Najpierw rozmawiamy z osobami, które zgłosiły się wcześniej.",
];

const fmtDate = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(new Date(value));
const fmtDateTime = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

/** The "rekrutacja trwa" message as the candidate reads it. */
export function statusMessageText(reason: string, nextContact: string, jobTitle?: string) {
  return `Dziękujemy za zgłoszenie${jobTitle ? ` na stanowisko ${jobTitle}` : ""}. Rekrutacja trwa. ${reason.trim()} Kolejny kontakt planujemy do ${fmtDate(nextContact)}.`;
}

function salaryText(job?: Job) {
  if (!job?.salaryMin || !job.salaryMax) return undefined;
  const fmt = new Intl.NumberFormat("pl-PL");
  return `${fmt.format(job.salaryMin)}–${fmt.format(job.salaryMax)} ${job.salaryCurrency === "EUR" ? "EUR" : "zł"}`;
}

/** Message to all waiting candidates: a reason and a next-contact date are required. */
export function StatusMessageForm({
  count,
  jobTitle,
  onSend,
  onCancel,
}: {
  count: number;
  jobTitle?: string;
  onSend: (reason: string, nextContact: string) => boolean;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [nextContact, setNextContact] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const reasonError = errors.some((x) => x.startsWith("powód"));
  const dateError = errors.some((x) => x.startsWith("orientacyjna"));
  function submit(e: FormEvent) {
    e.preventDefault();
    const problems = [
      ...(reason.trim().length < 10 ? ["powód oczekiwania (co najmniej 10 znaków)"] : []),
      ...(!nextContact || nextContact < today ? ["orientacyjna data kolejnego kontaktu"] : []),
    ];
    setErrors(problems);
    if (problems.length) {
      reasonRef.current?.focus();
      return;
    }
    onSend(reason, nextContact);
  }
  return (
    <form className="panel status-compose" onSubmit={submit} noValidate>
      <div className="cap">
        <span>
          Wiadomość do {count} {plural(count, "oczekującej osoby", "oczekujących", "oczekujących")}
        </span>
        <span>Powód i data są wymagane</span>
      </div>
      {errors.length > 0 && (
        <div className="note-err" role="alert">
          <b>Uzupełnij:</b> {errors.join(", ")}.
        </div>
      )}
      <div className={reasonError ? "field err" : "field"}>
        <label htmlFor="status-reason">Powód oczekiwania</label>
        <textarea
          id="status-reason"
          ref={reasonRef}
          rows={3}
          maxLength={2000}
          value={reason}
          aria-invalid={reasonError || undefined}
          aria-describedby="status-reason-hint"
          onChange={(e) => setReason(e.target.value)}
        />
        <span className="hint" id="status-reason-hint">
          Napisz, na co czekacie. Kandydaci zobaczą to zdanie.
        </span>
        <div className="chips reason-chips">
          {reasonSuggestions.map((text) => (
            <button key={text} type="button" className="fpill" onClick={() => setReason(text)}>
              {text}
            </button>
          ))}
        </div>
      </div>
      <div className={dateError ? "field err" : "field"}>
        <label htmlFor="status-date">Orientacyjna data kolejnego kontaktu</label>
        <input
          id="status-date"
          type="date"
          min={today}
          value={nextContact}
          aria-invalid={dateError || undefined}
          onChange={(e) => setNextContact(e.target.value)}
        />
      </div>
      <figure className="fig message-preview">
        <span className="t-label">Podgląd</span>
        <p>
          {reason.trim() && nextContact
            ? statusMessageText(reason, nextContact, jobTitle)
            : "Podgląd pojawi się po wpisaniu powodu i daty."}
        </p>
      </figure>
      <div className="research-actions">
        <Button type="submit" variant="action">
          Wyślij do {count} {plural(count, "osoby", "osób", "osób")}
        </Button>
        <button type="button" className="tx" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}

function UpdateLine({ update, job }: { update: StatusUpdate; job?: Job }) {
  if (update.kind === "message")
    return <>{statusMessageText(update.reason ?? "", update.nextContact ?? "", job?.title)}</>;
  if (update.kind === "considering") return <>Pracodawca nadal rozważa Twoje zgłoszenie.</>;
  if (update.kind === "question") return <>Zapytano o status zgłoszenia.</>;
  return (
    <>
      {update.answer === "considering"
        ? "Pracodawca nadal rozważa Twoje zgłoszenie."
        : "Pracodawca zakończył rekrutację z Twoim udziałem."}
    </>
  );
}

const updateLabels: Record<StatusUpdate["kind"], string> = {
  message: "Wiadomość od pracodawcy",
  considering: "Nadal rozważane",
  question: "Pytanie o status",
  answer: "Odpowiedź pracodawcy",
};

/** Candidate side of EXP2: employer updates, salary/scope reminder and "Zapytaj o status". */
export function CandidateStatusPanel({
  application,
  job,
}: {
  application: Application;
  job?: Job;
}) {
  const { run } = usePrototype();
  const updates = application.updates ?? [];
  const age = ageDays(application);
  const waiting = isWaiting(application);
  const question = pendingQuestion(application);
  const lastMessage = updates.filter((x) => x.kind === "message").at(-1);
  const salary = salaryText(job);
  return (
    <section className="status-panel" aria-labelledby="status-panel-title">
      <h2 className="t-sec" id="status-panel-title">
        Status od pracodawcy
      </h2>
      {updates.length ? (
        <ol className="status-updates">
          {updates.map((update, index) => (
            <li key={`${update.at}-${index}`}>
              <span className="t-label">
                {updateLabels[update.kind]} · {fmtDateTime(update.at)}
              </span>
              <p>
                <UpdateLine update={update} job={job} />
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="t-meta">
          Pracodawca jeszcze się nie odezwał. Zgłoszenie wysłano{" "}
          {age === 0 ? "dziś" : `${age} ${plural(age, "dzień", "dni", "dni")} temu`}.
        </p>
      )}
      {lastMessage && (
        <dl className="kv status-facts">
          {salary && (
            <>
              <dt>Widełki z ogłoszenia</dt>
              <dd className="t-data">{salary}</dd>
            </>
          )}
          <dt>Zakres roli</dt>
          <dd>{job?.firstProject || job?.summary || "—"}</dd>
        </dl>
      )}
      {waiting && (
        <div className="candidate-next">
          {question ? (
            <p className="t-meta" role="status">
              Zapytano o status {fmtDateTime(question.at)}. Pracodawca jeszcze nie odpowiedział.
            </p>
          ) : daysUntilStatusQuestion(application) === 0 ? (
            <Button
              variant="action"
              onClick={() => run({ type: "ask_status", applicationId: application.id })}
            >
              Zapytaj o status
            </Button>
          ) : (
            <p className="t-meta">
              O status zapytasz po {ASK_STATUS_AFTER_DAYS} dniach od wysłania lub od poprzedniego
              pytania (za {daysUntilStatusQuestion(application)}{" "}
              {plural(daysUntilStatusQuestion(application), "dzień", "dni", "dni")}).
            </p>
          )}
          <Link className={buttonVariants()} to="/oferty">
            Przeglądaj inne oferty
          </Link>
        </div>
      )}
    </section>
  );
}

/** Employer side of EXP2/EXP3 on an application: conditions, status question and updates. */
export function EmployerStatusPanel({ application, job }: { application: Application; job?: Job }) {
  const { run } = usePrototype();
  const [notice, setNotice] = useState("");
  const updates = application.updates ?? [];
  const waiting = isWaiting(application);
  const question = waiting ? pendingQuestion(application) : undefined;
  const ranges =
    job?.salaryMin && job.salaryMax ? bandRanges(job.salaryMin, job.salaryMax) : undefined;
  return (
    <section className="status-panel" aria-labelledby="employer-status-title">
      <h2 className="t-sec" id="employer-status-title">
        Warunki i status
      </h2>
      <div className="status-columns">
        <div className="panel">
          <div className="cap">
            <span>Warunki kandydata</span>
            <span>{application.conditions ? "Podane przy zgłoszeniu" : "Nie podano"}</span>
          </div>
          <ConditionsList conditions={application.conditions} bandRange={ranges} />
        </div>
        <div className="panel">
          <div className="cap">
            <span>Kontakt z kandydatem</span>
            <span>
              Czeka {ageDays(application)} {plural(ageDays(application), "dzień", "dni", "dni")}
            </span>
          </div>
          {question && (
            <div className="status-question-box" role="group" aria-label="Pytanie o status">
              <p>
                <b>Kandydat pyta o status</b> ({fmtDateTime(question.at)}). Odpowiedz jednym
                kliknięciem.
              </p>
              <div className="research-actions">
                <Button
                  variant="action"
                  size="sm"
                  onClick={() => {
                    if (
                      run({
                        type: "answer_status",
                        applicationId: application.id,
                        answer: "considering",
                      })
                    )
                      setNotice("Kandydat zobaczy: „Pracodawca nadal rozważa Twoje zgłoszenie”.");
                  }}
                >
                  Nadal rozważam
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    run({
                      type: "answer_status",
                      applicationId: application.id,
                      answer: "rejected",
                    })
                  }
                >
                  Rezygnujemy
                </Button>
              </div>
            </div>
          )}
          {updates.length ? (
            <ol className="status-updates">
              {updates.map((update, index) => (
                <li key={`${update.at}-${index}`}>
                  <span className="t-label">
                    {updateLabels[update.kind]} · {fmtDateTime(update.at)}
                  </span>
                  {update.kind === "message" && (
                    <p>{statusMessageText(update.reason ?? "", update.nextContact ?? "")}</p>
                  )}
                  {update.kind === "answer" && (
                    <p>{update.answer === "considering" ? "Nadal rozważam" : "Rezygnujemy"}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="t-meta">Kandydat nie dostał jeszcze żadnej informacji o statusie.</p>
          )}
          {waiting && !question && (
            <Button
              size="sm"
              onClick={() => {
                if (run({ type: "still_considering", applicationId: application.id }))
                  setNotice("Kandydat zobaczy, że nadal rozważasz zgłoszenie.");
              }}
            >
              Nadal rozważam
            </Button>
          )}
          <p role="status" className={notice ? "t-meta" : "sr-only"}>
            {notice}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Company reminder settings (EXP2): preview only, nothing is sent. */
export function ReminderSettings() {
  const { state, run } = usePrototype();
  const person = state.people.find((x) => x.id === state.activePersonId);
  const company = state.companies.find((x) => x.id === person?.companyId);
  const [draft, setDraft] = useState(
    company?.reminder ?? {
      enabled: false,
      days: 7,
      audience: "preference" as const,
      reason: "Czekamy na wewnętrzne ustalenia.",
    },
  );
  const [saved, setSaved] = useState(false);
  const preview = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  return (
    <form
      id="przypomnienia"
      className="panel reminder-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (run({ type: "reminder", value: draft })) setSaved(true);
      }}
    >
      <div className="cap">
        <span>Przypomnienia dla kandydatów</span>
        <span>Podgląd, bez wysyłki</span>
      </div>
      <p className="t-meta">
        Gdy nie możesz jeszcze nikogo zaprosić, kandydaci dostaną informację, że rekrutacja trwa.
      </p>
      <label className="reminder-toggle">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
        />
        Wysyłaj przypomnienie automatycznie
      </label>
      <fieldset className="field" disabled={!draft.enabled}>
        <legend className="t-label">Do kogo</legend>
        <div className="choice">
          <label>
            <input
              type="radio"
              name="reminder-audience"
              checked={draft.audience === "preference"}
              onChange={() => set("audience", "preference")}
            />
            Według preferencji kandydata
          </label>
          <label>
            <input
              type="radio"
              name="reminder-audience"
              checked={draft.audience === "all"}
              onChange={() => set("audience", "all")}
            />
            Wszystkich oczekujących
          </label>
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="reminder-days">Po ilu dniach bez odpowiedzi</label>
        <select
          id="reminder-days"
          disabled={!draft.enabled}
          value={draft.days}
          onChange={(e) => set("days", Number(e.target.value))}
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
          maxLength={2000}
          disabled={!draft.enabled}
          value={draft.reason}
          onChange={(e) => set("reason", e.target.value)}
        />
      </div>
      <figure className="fig message-preview">
        <span className="t-label">Podgląd wiadomości</span>
        <p>{statusMessageText(draft.reason || "—", preview)}</p>
      </figure>
      <div className="research-actions">
        <Button type="submit">Zapisz ustawienia przypomnień</Button>
      </div>
      <p role="status" className={saved ? "prototype-notice" : "sr-only"}>
        {saved ? "Ustawienia przypomnień zapisane." : ""}
      </p>
    </form>
  );
}
