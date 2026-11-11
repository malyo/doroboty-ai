import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { MatchScore } from "@/features/prototype/match-score";
import { plural } from "@/lib/plural";
import {
  availabilityLabels,
  bandLabels,
  bandRanges,
  formatSalary,
  p3Applications,
  p3Defaults,
  responseTimeLabels,
  workModeLabels,
  type Availability,
  type CandidateConditions,
  type ResponseTime,
  type SalaryBand,
  type WorkMode,
} from "./data";
import { ConditionsList, formatDateTime, useScreenOpen } from "./components";
import { useResearch, type P3Job } from "./store";

const processOptions = [
  "Rozmowa wstępna + rozmowa z zespołem",
  "Rozmowa + zadanie domowe (do 3 h) + rozmowa końcowa",
  "Rozmowa + case study na żywo",
];

/** EXP3 recruiter: three-step job form; step 2 strongly encourages a salary range. */
export function JobSalaryFormPage() {
  useScreenOpen("P3", "job-form");
  const { state, update, log } = useResearch();
  const [step, setStep] = useState<1 | 2 | 3 | "done">(state.p3.job ? "done" : 1);
  const [title, setTitle] = useState(p3Defaults.title);
  const [location, setLocation] = useState(p3Defaults.location);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [contract, setContract] = useState("B2B");
  const [salaryLater, setSalaryLater] = useState(false);
  const [askingLater, setAskingLater] = useState(false);
  const [firstProject, setFirstProject] = useState("");
  const [mandate, setMandate] = useState("");
  const [process, setProcess] = useState("");
  const [error, setError] = useState("");
  const minRef = useRef<HTMLInputElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  // Each step starts at the top of the form, not where the previous step was scrolled.
  useEffect(() => {
    stepsRef.current?.scrollIntoView({ block: "start" });
  }, [step]);
  const salaryMin = Number(min.replace(/\s/g, "")) || undefined;
  const salaryMax = Number(max.replace(/\s/g, "")) || undefined;
  const hasSalary = Boolean(salaryMin && salaryMax);
  const { market } = p3Defaults;

  function next() {
    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      setError("Dolna granica widełek jest wyższa niż górna.");
      minRef.current?.focus();
      return;
    }
    setError("");
    if (!hasSalary && !salaryLater) {
      setAskingLater(true);
      log("P3", "salary_missing_prompt");
      return;
    }
    log("P3", "step2_done", {
      salary: hasSalary,
      salaryLater: !hasSalary && salaryLater,
      firstProject: Boolean(firstProject.trim()),
      mandate: Boolean(mandate.trim()),
      process: process || null,
    });
    setStep(3);
  }

  function publish() {
    const job: P3Job = {
      title: title.trim() || p3Defaults.title,
      location: location.trim() || p3Defaults.location,
      salaryMin: hasSalary ? salaryMin : undefined,
      salaryMax: hasSalary ? salaryMax : undefined,
      contract,
      salaryLater: !hasSalary,
      firstProject: firstProject.trim(),
      mandate: mandate.trim(),
      process,
      publishedAt: new Date().toISOString(),
    };
    update((s) => ({ ...s, p3: { ...s.p3, job } }));
    log("P3", "job_published", {
      salary: hasSalary,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      salaryLater: job.salaryLater,
      filled: {
        firstProject: Boolean(job.firstProject),
        mandate: Boolean(job.mandate),
        process: Boolean(job.process),
      },
    });
    setStep("done");
  }

  if (step === "done" && state.p3.job) {
    const job = state.p3.job;
    return (
      <div className="research-page">
        <div className="panel research-done">
          <span className="t-label">Zadanie P3.R1 · ogłoszenie opublikowane (prototyp)</span>
          <h1 className="t-sec">{job.title}</h1>
          <dl className="kv">
            <dt>Widełki</dt>
            <dd className="t-data">
              {job.salaryMin && job.salaryMax
                ? `${formatSalary(job.salaryMin, job.salaryMax)} · ${job.contract}`
                : "— (dodam później)"}
            </dd>
            <dt>Pierwszy projekt</dt>
            <dd>{job.firstProject || "—"}</dd>
            <dt>Mandat</dt>
            <dd>{job.mandate || "—"}</dd>
            <dt>Proces</dt>
            <dd>{job.process || "—"}</dd>
          </dl>
          <div className="research-actions">
            <Link className={buttonVariants()} to="/badanie">
              Wróć do panelu prowadzącego
            </Link>
            <button
              type="button"
              className="tx"
              onClick={() => {
                update((s) => ({ ...s, p3: { ...s.p3, job: undefined } }));
                log("P3", "job_form_restart");
                setStep(1);
              }}
            >
              Utwórz ogłoszenie od nowa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="research-page">
      <div className="page-heading">
        <h1>Nowe ogłoszenie</h1>
      </div>
      <ol className="form-steps" aria-label="Kroki formularza" ref={stepsRef}>
        {["Rola", "Wynagrodzenie i zakres", "Podgląd i publikacja"].map((label, index) => (
          <li key={label} aria-current={step === index + 1 ? "step" : undefined}>
            <span className="t-label">Krok {index + 1} / 3</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            log("P3", "step1_done", { title, location });
            setStep(2);
          }}
        >
          <div className="field">
            <label htmlFor="p3-title">Nazwa stanowiska</label>
            <input id="p3-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p3-location">Lokalizacja i tryb</label>
            <input
              id="p3-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="research-actions">
            <Button type="submit" variant="action">
              Dalej: wynagrodzenie i zakres
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="salary-step">
          <section className="panel">
            <div className="cap">
              <span>Widełki wynagrodzenia</span>
              <span>Zalecane</span>
            </div>
            {error && (
              <div className="note-err" role="alert">
                {error}
              </div>
            )}
            <div className="salary-fields">
              <div className="field">
                <label htmlFor="p3-min">Od (zł)</label>
                <input
                  id="p3-min"
                  ref={minRef}
                  inputMode="numeric"
                  value={min}
                  placeholder="np. 28 000"
                  onChange={(e) => {
                    setMin(e.target.value);
                    setSalaryLater(false);
                  }}
                />
              </div>
              <div className="field">
                <label htmlFor="p3-max">Do (zł)</label>
                <input
                  id="p3-max"
                  inputMode="numeric"
                  value={max}
                  placeholder="np. 36 000"
                  onChange={(e) => {
                    setMax(e.target.value);
                    setSalaryLater(false);
                  }}
                />
              </div>
              <div className="field">
                <label htmlFor="p3-contract">Forma</label>
                <select
                  id="p3-contract"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                >
                  <option>B2B</option>
                  <option>Umowa o pracę</option>
                </select>
              </div>
            </div>
            <div className="market-hint">
              <span className="t-label">Podpowiedź z rynku · dane przykładowe</span>
              <p>
                Podobne role „{p3Defaults.title}” ({p3Defaults.location}):{" "}
                <span className="t-data">{formatSalary(market.min, market.max)}</span>{" "}
                {market.contract} / {market.period}, mediana{" "}
                <span className="t-data">
                  {new Intl.NumberFormat("pl-PL").format(market.median)} zł
                </span>
                .
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setMin(String(market.min));
                  setMax(String(market.max));
                  setContract(market.contract);
                  setSalaryLater(false);
                  setAskingLater(false);
                  log("P3", "market_hint_used");
                }}
              >
                Użyj podpowiedzi
              </Button>
            </div>
            <p className="salary-warning">
              Ogłoszenie bez widełek wypadnie gorzej: trafi niżej na liście ofert i nie pojawi się w
              filtrze wynagrodzenia.
            </p>
            {askingLater && !hasSalary && (
              <div className="later-prompt" role="alert">
                <p>
                  <b>Nie podano widełek.</b> Dodaj je teraz albo świadomie odłóż.
                </p>
                <div className="research-actions">
                  <Button
                    size="sm"
                    onClick={() => {
                      setAskingLater(false);
                      log("P3", "salary_add_now");
                      minRef.current?.focus();
                    }}
                  >
                    Dodaj widełki
                  </Button>
                  <button
                    type="button"
                    className="tx"
                    onClick={() => {
                      setSalaryLater(true);
                      setAskingLater(false);
                      log("P3", "salary_later");
                    }}
                  >
                    Dodam później
                  </button>
                </div>
              </div>
            )}
            {salaryLater && !hasSalary && (
              <p className="t-meta" role="status">
                Widełki odłożone („Dodam później”). Możesz je wpisać w każdej chwili.
              </p>
            )}
          </section>
          <figure className="fig salary-fig">
            <div className="bars" aria-hidden="true">
              <div>
                <span className="t-label">Z widełkami</span>
                <span className="bar" style={{ width: "100%" }} />
                <span className="t-data">18%</span>
              </div>
              <div>
                <span className="t-label">Bez widełek</span>
                <span className="bar bar-muted" style={{ width: "44%" }} />
                <span className="t-data">8%</span>
              </div>
            </div>
            <figcaption>
              <span className="t-label">Fig. 1 — rozmowy po ogłoszeniu</span>
              Ogłoszenia z widełkami częściej kończą się rozmową: 18% wobec 8% (dane przykładowe).
            </figcaption>
          </figure>
          <section className="panel">
            <div className="cap">
              <span>Zakres roli</span>
              <span>Kandydaci pytają o to najczęściej</span>
            </div>
            <div className="field">
              <label htmlFor="p3-project">Pierwszy projekt</label>
              <textarea
                id="p3-project"
                rows={2}
                value={firstProject}
                placeholder="Czym ta osoba zajmie się w pierwszych 3 miesiącach?"
                onChange={(e) => setFirstProject(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="p3-mandate">Mandat</label>
              <textarea
                id="p3-mandate"
                rows={2}
                value={mandate}
                placeholder="O czym decyduje sama, za co odpowiada, jaki ma budżet i zespół?"
                onChange={(e) => setMandate(e.target.value)}
              />
            </div>
            <fieldset className="field">
              <legend className="t-label">Forma procesu</legend>
              <div className="choice choice-stack">
                {processOptions.map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="process"
                      checked={process === option}
                      onChange={() => setProcess(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
          <div className="actbar">
            <span className="t-label">Krok 2 / 3</span>
            <button type="button" className="tx" onClick={() => setStep(1)}>
              Wstecz
            </button>
            <Button variant="action" onClick={next}>
              Dalej: podgląd
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel job-preview">
          <div className="cap">
            <span>Podgląd ogłoszenia</span>
            <span>Tak zobaczą je kandydaci</span>
          </div>
          <h2 className="t-sec">{title}</h2>
          <p className="t-meta">
            {p3Defaults.company} · {location}
          </p>
          <dl className="kv">
            <dt>Widełki</dt>
            <dd className="t-data">
              {hasSalary ? `${formatSalary(salaryMin!, salaryMax!)} · ${contract}` : "—"}
            </dd>
            <dt>Pierwszy projekt</dt>
            <dd>{firstProject.trim() || "—"}</dd>
            <dt>Mandat</dt>
            <dd>{mandate.trim() || "—"}</dd>
            <dt>Proces</dt>
            <dd>{process || "—"}</dd>
          </dl>
          <div className="research-actions">
            <Button variant="action" onClick={publish}>
              Opublikuj ogłoszenie
            </Button>
            <button type="button" className="tx" onClick={() => setStep(2)}>
              Wróć do wynagrodzenia i zakresu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** EXP3 candidate: optional "Moje warunki" step when applying. */
export function CandidateConditionsPage() {
  useScreenOpen("P3", "candidate-conditions");
  const { state, update, log } = useResearch();
  const job = state.p3.job;
  const salary =
    job?.salaryMin && job.salaryMax
      ? { min: job.salaryMin, max: job.salaryMax, contract: job.contract }
      : job
        ? undefined
        : { min: p3Defaults.market.min, max: p3Defaults.market.max, contract: "B2B" };
  const ranges = salary ? bandRanges(salary.min, salary.max) : undefined;
  const [minSalary, setMinSalary] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode | "">("");
  const [availability, setAvailability] = useState<Availability | "">("");
  const [responseTime, setResponseTime] = useState<ResponseTime | "">("");
  const [band, setBand] = useState<SalaryBand | "">("");
  const submitted = state.p3.conditions;

  function submit(skipped: boolean) {
    const conditions: CandidateConditions = skipped
      ? {}
      : {
          minSalary: Number(minSalary.replace(/\s/g, "")) || undefined,
          workMode: workMode || undefined,
          availability: availability || undefined,
          responseTime: responseTime || undefined,
          band: band || undefined,
        };
    update((s) => ({
      ...s,
      p3: {
        ...s.p3,
        conditions: { ...conditions, submittedAt: new Date().toISOString(), skipped },
      },
    }));
    log("P3", "conditions_submitted", {
      skipped,
      filled: Object.fromEntries(
        (["minSalary", "workMode", "availability", "responseTime", "band"] as const).map((key) => [
          key,
          conditions[key] !== undefined,
        ]),
      ),
      values: conditions,
    });
  }

  const header = (
    <div className="panel applied-job">
      <span className="t-label">Zgłaszasz się na ogłoszenie</span>
      <h2 className="t-sec">{job?.title ?? p3Defaults.title}</h2>
      <p className="t-meta">
        {p3Defaults.company} · {job?.location ?? p3Defaults.location}
      </p>
      <dl className="kv">
        <dt>Widełki</dt>
        <dd className="t-data">
          {salary ? `${formatSalary(salary.min, salary.max)} · ${salary.contract}` : "—"}
        </dd>
        {job?.firstProject && (
          <>
            <dt>Pierwszy projekt</dt>
            <dd>{job.firstProject}</dd>
          </>
        )}
        {job?.mandate && (
          <>
            <dt>Mandat</dt>
            <dd>{job.mandate}</dd>
          </>
        )}
      </dl>
    </div>
  );

  if (submitted) {
    return (
      <div className="research-page">
        <div className="page-heading">
          <h1>Zgłoszenie wysłane</h1>
        </div>
        <div className="detail-columns">
          {header}
          <div className="panel">
            <span className="t-label">
              Moje warunki ·{" "}
              {submitted.skipped ? "pominięte" : formatDateTime(submitted.submittedAt)}
            </span>
            <ConditionsList conditions={submitted} bandRange={ranges} />
            <div className="research-actions">
              <Link className={buttonVariants()} to="/badanie">
                Wróć do panelu prowadzącego
              </Link>
              <button
                type="button"
                className="tx"
                onClick={() => {
                  update((s) => ({ ...s, p3: { ...s.p3, conditions: undefined } }));
                  log("P3", "conditions_restart");
                }}
              >
                Wypełnij od nowa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="research-page">
      <div className="page-heading">
        <h1>Moje warunki</h1>
      </div>
      <p className="t-meta research-hint">
        Wszystkie pola są opcjonalne. Pracodawca zobaczy je obok Twojego zgłoszenia.
      </p>
      <div className="detail-columns">
        {header}
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
        >
          <div className="field">
            <label htmlFor="c-min">Minimalne wynagrodzenie (zł / mies.)</label>
            <input
              id="c-min"
              inputMode="numeric"
              value={minSalary}
              placeholder="np. 30 000"
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>
          <OptionGroup
            legend="Tryb pracy"
            name="workMode"
            value={workMode}
            onChange={setWorkMode}
            options={workModeLabels}
          />
          <div className="field">
            <label htmlFor="c-availability">Dostępność</label>
            <select
              id="c-availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability | "")}
            >
              <option value="">— nie podaję —</option>
              {Object.entries(availabilityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <OptionGroup
            legend="Jak szybko oczekuję odpowiedzi"
            name="responseTime"
            value={responseTime}
            onChange={setResponseTime}
            options={responseTimeLabels}
          />
          {ranges ? (
            <OptionGroup
              legend="Która część widełek Cię interesuje (opcjonalnie)"
              name="band"
              value={band}
              onChange={setBand}
              options={{
                low: `${bandLabels.low} · ${ranges.low}`,
                mid: `${bandLabels.mid} · ${ranges.mid}`,
                high: `${bandLabels.high} · ${ranges.high}`,
                none: bandLabels.none,
              }}
              stack
            />
          ) : (
            <p className="t-meta">To ogłoszenie nie ma widełek, więc nie wskażesz ich części.</p>
          )}
          <div className="research-actions">
            <Button type="submit" variant="action">
              Wyślij zgłoszenie z warunkami
            </Button>
            <button type="button" className="tx" onClick={() => submit(true)}>
              Pomiń warunki i wyślij
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OptionGroup<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
  stack = false,
}: {
  legend: string;
  name: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: Record<T, string>;
  stack?: boolean;
}) {
  return (
    <fieldset className="field">
      <legend className="t-label">{legend}</legend>
      <div className={stack ? "choice choice-stack" : "choice"}>
        {(Object.entries(options) as [T, string][]).map(([key, label]) => (
          <label key={key}>
            <input
              type="radio"
              name={name}
              checked={value === key}
              onChange={() => onChange(key)}
            />
            {label}
          </label>
        ))}
      </div>
      {value && (
        <button type="button" className="tx option-clear" onClick={() => onChange("")}>
          Wyczyść wybór
        </button>
      )}
    </fieldset>
  );
}

const reviewColumns = {
  "--cols": "18px minmax(220px,1fr) 150px minmax(260px,320px)",
  "--areas": '"chk who score cond"',
  "--areas-m": '"chk score score" "who who who" "cond cond cond"',
} as React.CSSProperties;

/** EXP3 recruiter: three applications with candidate conditions shown beside them. */
export function ConditionsReviewPage() {
  useScreenOpen("P3", "review");
  const { state, log } = useResearch();
  const startedAt = useRef(Date.now());
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const job = state.p3.job;
  const salary =
    job?.salaryMin && job.salaryMax
      ? { min: job.salaryMin, max: job.salaryMax }
      : { min: p3Defaults.market.min, max: p3Defaults.market.max };
  const ranges = bandRanges(salary.min, salary.max);
  const chosen = p3Applications.filter((x) => selected.includes(x.id));

  if (done) {
    return (
      <div className="research-page">
        <div className="panel research-done">
          <span className="t-label">Zadanie P3.R2 · zakończone</span>
          <h1 className="t-sec">
            {chosen.length}{" "}
            {plural(chosen.length, "osoba zaproszona", "osoby zaproszone", "osób zaproszonych")}
          </h1>
          <ul className="research-done-list">
            {chosen.map((x) => (
              <li key={x.id}>
                <span className="t-name">{x.name}</span>{" "}
                <span className="t-meta">· {x.headline}</span>
              </li>
            ))}
          </ul>
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
    <div className="research-page">
      <div className="page-heading">
        <h1>Zgłoszenia: {job?.title ?? p3Defaults.title}</h1>
      </div>
      <p className="t-meta list-legend">
        Warunki kandydata stoją obok zgłoszenia. Część widełek liczona z{" "}
        {job?.salaryMin ? "Twojego ogłoszenia" : "podpowiedzi rynkowej"}:{" "}
        <span className="t-data">{formatSalary(salary.min, salary.max)}</span>. Ciemny wiersz to
        osoba wybrana do zaproszenia.
      </p>
      <div className="list review-list" style={reviewColumns}>
        <div className="thead" aria-hidden="true">
          <span />
          <span>Kandydat</span>
          <span>Match Score</span>
          <span>Warunki kandydata</span>
        </div>
        {p3Applications.map((person) => {
          const on = selected.includes(person.id);
          return (
            <article key={person.id} className={on ? "row sl" : "row"}>
              <input
                className="chk"
                type="checkbox"
                checked={on}
                aria-label={`Zaproś na rozmowę: ${person.name}`}
                onChange={() => {
                  setSelected((current) =>
                    on ? current.filter((x) => x !== person.id) : [...current, person.id],
                  );
                  log("P3", on ? "review_unselect" : "review_select", { id: person.id });
                }}
              />
              <div className="who">
                <span className="t-name">{person.name}</span>
                <span className="t-meta">{person.headline}</span>
                <span className="t-meta">{person.summary}</span>
                {on && <span className="t-label why">Do zaproszenia</span>}
              </div>
              <span className="score">
                <MatchScore score={person.score} />
              </span>
              <span className="cond">
                <ConditionsList conditions={person.conditions} bandRange={ranges} />
              </span>
            </article>
          );
        })}
      </div>
      <div className="actbar" hidden={selected.length === 0}>
        <span className="t-label">
          {selected.length} {plural(selected.length, "wybrana", "wybrane", "wybranych")}
        </span>
        <Button
          variant="action"
          onClick={() => {
            log("P3", "review_invite", {
              elapsedMs: Date.now() - startedAt.current,
              selected: chosen.map((x) => ({ id: x.id, name: x.name, conditions: x.conditions })),
            });
            setDone(true);
          }}
        >
          Zaproś {selected.length} {plural(selected.length, "osobę", "osoby", "osób")} na rozmowę
        </Button>
      </div>
    </div>
  );
}
