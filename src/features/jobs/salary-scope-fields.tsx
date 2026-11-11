import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/plural";
import type { Job } from "./types";

export const processOptions = [
  "Rozmowa wstępna + rozmowa z zespołem",
  "Rozmowa + zadanie domowe (do 3 h) + rozmowa końcowa",
  "Rozmowa + case study na żywo",
];

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Salary hint from offers already in the marketplace (same category first). */
export function marketHint(jobs: Job[], category: Job["category"]) {
  const withSalary = jobs.filter(
    (x) =>
      x.publicationStatus === "published" &&
      x.salaryMin &&
      x.salaryMax &&
      (x.salaryCurrency ?? "PLN") === "PLN" &&
      (x.salaryPeriod ?? "month") === "month",
  );
  const pool = withSalary.filter((x) => x.category === category);
  const source = pool.length >= 2 ? pool : withSalary;
  if (!source.length) return undefined;
  const round = (n: number) => Math.round(n / 500) * 500;
  return {
    min: round(median(source.map((x) => x.salaryMin!))),
    max: round(median(source.map((x) => x.salaryMax!))),
    count: source.length,
    sameCategory: source === pool,
  };
}

export type SalaryScopeValue = {
  min: string;
  max: string;
  later: boolean;
  firstProject: string;
  mandate: string;
  processForm: string;
};

/**
 * EXP3 "Wynagrodzenie i zakres": salary fields with a market hint, the 18% vs 8% figure, a visible
 * warning, a deliberate "Dodam później" for skipping, and role scope fields.
 */
export function SalaryScopeFields({
  value,
  onChange,
  hint,
  askLater,
  onLaterAnswered,
}: {
  value: SalaryScopeValue;
  onChange: (value: SalaryScopeValue) => void;
  hint?: ReturnType<typeof marketHint>;
  /** True after a publish attempt without a salary range and without "Dodam później". */
  askLater: boolean;
  onLaterAnswered: () => void;
}) {
  const minRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof SalaryScopeValue>(key: K, next: SalaryScopeValue[K]) =>
    onChange({ ...value, [key]: next });
  const fmt = new Intl.NumberFormat("pl-PL");
  const hasSalary = Boolean(value.min && value.max);
  return (
    <section className="salary-scope" aria-labelledby="salary-scope-title">
      <h2 className="t-sec" id="salary-scope-title">
        Wynagrodzenie i zakres
      </h2>
      <div className="salary-step">
        <div className="panel">
          <div className="cap">
            <span>Widełki wynagrodzenia</span>
            <span>Zalecane</span>
          </div>
          <div className="salary-fields">
            <div className="field">
              <label htmlFor="salary-min">Wynagrodzenie od (PLN brutto / mies.)</label>
              <input
                id="salary-min"
                ref={minRef}
                name="salaryMin"
                type="number"
                min={0}
                value={value.min}
                onChange={(e) => onChange({ ...value, min: e.target.value, later: false })}
              />
            </div>
            <div className="field">
              <label htmlFor="salary-max">Wynagrodzenie do (PLN brutto / mies.)</label>
              <input
                id="salary-max"
                name="salaryMax"
                type="number"
                min={0}
                value={value.max}
                onChange={(e) => onChange({ ...value, max: e.target.value, later: false })}
              />
            </div>
          </div>
          {hint && (
            <div className="market-hint">
              <span className="t-label">
                Podpowiedź z rynku · {hint.count} {plural(hint.count, "oferta", "oferty", "ofert")}{" "}
                {hint.sameCategory ? "z tej kategorii" : "w serwisie"}
              </span>
              <p>
                Mediana widełek:{" "}
                <span className="t-data">
                  {fmt.format(hint.min)}–{fmt.format(hint.max)} zł
                </span>{" "}
                brutto / mies.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  onChange({ ...value, min: String(hint.min), max: String(hint.max), later: false })
                }
              >
                Użyj podpowiedzi
              </Button>
            </div>
          )}
          <p className="salary-warning">
            Ogłoszenie bez widełek wypadnie gorzej: trafi niżej na liście ofert i nie pojawi się w
            filtrze wynagrodzenia.
          </p>
          {askLater && !hasSalary && !value.later && (
            <div className="later-prompt" role="alert">
              <p>
                <b>Nie podano widełek.</b> Dodaj je teraz albo świadomie odłóż.
              </p>
              <div className="research-actions">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onLaterAnswered();
                    minRef.current?.focus();
                  }}
                >
                  Dodaj widełki
                </Button>
                <button
                  type="button"
                  className="tx"
                  onClick={() => {
                    onChange({ ...value, later: true });
                    onLaterAnswered();
                  }}
                >
                  Dodam później
                </button>
              </div>
            </div>
          )}
          {value.later && !hasSalary && (
            <p className="t-meta" role="status">
              Widełki odłożone („Dodam później”). Możesz je wpisać w każdej chwili.
            </p>
          )}
        </div>
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
        <div className="panel">
          <div className="cap">
            <span>Zakres roli</span>
            <span>Kandydaci pytają o to najczęściej</span>
          </div>
          <div className="field">
            <label htmlFor="scope-project">Pierwszy projekt</label>
            <textarea
              id="scope-project"
              rows={2}
              maxLength={2000}
              placeholder="Czym ta osoba zajmie się w pierwszych 3 miesiącach?"
              value={value.firstProject}
              onChange={(e) => set("firstProject", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="scope-mandate">Mandat</label>
            <textarea
              id="scope-mandate"
              rows={2}
              maxLength={2000}
              placeholder="O czym decyduje, za co odpowiada, jaki ma budżet i zespół?"
              value={value.mandate}
              onChange={(e) => set("mandate", e.target.value)}
            />
          </div>
          <fieldset className="field">
            <legend className="t-label">Forma procesu</legend>
            <div className="choice choice-stack">
              {processOptions.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="processForm"
                    checked={value.processForm === option}
                    onChange={() => set("processForm", option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
