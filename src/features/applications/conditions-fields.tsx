import type { Job } from "@/features/jobs/types";
import {
  OptionGroup,
  availabilityLabels,
  bandLabels,
  bandRanges,
  responseTimeLabels,
  workModeLabels,
  type Availability,
  type ResponseTime,
  type SalaryBand,
  type WorkMode,
} from "./conditions";

export type ConditionsDraft = {
  minSalary?: string;
  workMode?: WorkMode | "";
  availability?: Availability | "";
  responseTime?: ResponseTime | "";
  band?: SalaryBand | "";
};

/** "Moje warunki" (EXP3) inside the application form. Every field is optional. */
export function ConditionsFields({
  job,
  value,
  disabled,
  onChange,
}: {
  job: Job;
  value: ConditionsDraft;
  disabled?: boolean;
  onChange: (value: ConditionsDraft) => void;
}) {
  const ranges = job.salaryMin && job.salaryMax ? bandRanges(job.salaryMin, job.salaryMax) : null;
  const set = <K extends keyof ConditionsDraft>(key: K, next: ConditionsDraft[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <fieldset
      className="application-form-section application-conditions"
      disabled={disabled}
      aria-labelledby="application-conditions-title"
    >
      <h3 id="application-conditions-title">Moje warunki (opcjonalnie)</h3>
      <p className="application-help">
        Pracodawca zobaczy je obok Twojej aplikacji. Możesz pominąć dowolne pole.
      </p>
      <div className="field">
        <label htmlFor="conditions-min">Minimalne wynagrodzenie (zł / mies.)</label>
        <input
          id="conditions-min"
          type="number"
          min={0}
          step={500}
          placeholder="np. 30 000"
          value={value.minSalary ?? ""}
          onChange={(e) => set("minSalary", e.target.value)}
        />
      </div>
      <OptionGroup
        legend="Tryb pracy"
        name="conditions-workMode"
        value={value.workMode ?? ""}
        onChange={(v) => set("workMode", v)}
        options={workModeLabels}
      />
      <div className="field">
        <label htmlFor="conditions-availability">Dostępność</label>
        <select
          id="conditions-availability"
          value={value.availability ?? ""}
          onChange={(e) => set("availability", e.target.value as Availability | "")}
        >
          <option value="">— nie podaję —</option>
          {Object.entries(availabilityLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <OptionGroup
        legend="Jak szybko oczekuję odpowiedzi"
        name="conditions-responseTime"
        value={value.responseTime ?? ""}
        onChange={(v) => set("responseTime", v)}
        options={responseTimeLabels}
      />
      {ranges ? (
        <OptionGroup
          legend="Która część widełek Cię interesuje"
          name="conditions-band"
          value={value.band ?? ""}
          onChange={(v) => set("band", v)}
          options={{
            low: `${bandLabels.low} · ${ranges.low}`,
            mid: `${bandLabels.mid} · ${ranges.mid}`,
            high: `${bandLabels.high} · ${ranges.high}`,
            none: bandLabels.none,
          }}
          stack
        />
      ) : (
        <p className="application-help">Ta oferta nie ma widełek, więc nie wskażesz ich części.</p>
      )}
    </fieldset>
  );
}
