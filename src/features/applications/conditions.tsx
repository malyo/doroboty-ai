import { plural } from "@/lib/plural";
import type { Conditions } from "@/features/prototype/model";

/** Candidate conditions (EXP3) shared by the product and the /badanie research prototypes. */
export type ResponseTime = NonNullable<Conditions["responseTime"]>;
export type WorkMode = NonNullable<Conditions["workMode"]>;
export type Availability = NonNullable<Conditions["availability"]>;
export type SalaryBand = NonNullable<Conditions["band"]>;
export type CandidateConditions = Conditions;

export const responseTimeLabels: Record<ResponseTime, string> = {
  "3d": "Do 3 dni",
  "7d": "Do tygodnia",
  "14d": "Do 2 tygodni",
  any: "Bez znaczenia",
};
export const responseTimeDays: Record<ResponseTime, number | undefined> = {
  "3d": 3,
  "7d": 7,
  "14d": 14,
  any: undefined,
};
export const workModeLabels: Record<WorkMode, string> = {
  remote: "Zdalnie",
  hybrid: "Hybrydowo",
  onsite: "Stacjonarnie",
  any: "Bez znaczenia",
};
export const availabilityLabels: Record<Availability, string> = {
  now: "Od zaraz",
  "2w": "Za 2 tygodnie",
  "1m": "Za miesiąc",
  "3m": "Za 3 miesiące",
};
export const bandLabels: Record<SalaryBand, string> = {
  low: "Dolna część",
  mid: "Środek",
  high: "Górna część",
  none: "Nie wskazuję",
};

/** Splits a salary range into thirds, so "lower / middle / upper part" has concrete numbers. */
export function bandRanges(min: number, max: number): Record<"low" | "mid" | "high", string> {
  const step = (max - min) / 3;
  const fmt = (n: number) => new Intl.NumberFormat("pl-PL").format(Math.round(n / 100) * 100);
  return {
    low: `${fmt(min)}–${fmt(min + step)} zł`,
    mid: `${fmt(min + step)}–${fmt(min + 2 * step)} zł`,
    high: `${fmt(min + 2 * step)}–${fmt(max)} zł`,
  };
}

/** True when the candidate waits longer than the response time they said they expect. */
export function isOverdue(conditions: Conditions | undefined, ageDays: number) {
  const expected = conditions?.responseTime ? responseTimeDays[conditions.responseTime] : undefined;
  return expected !== undefined && ageDays > expected;
}

/** How long the candidate waits compared with how fast they expect an answer. */
export function Impatience({ conditions, ageDays }: { conditions?: Conditions; ageDays: number }) {
  return (
    <span className="impatience">
      <span className="t-data">
        {ageDays} {plural(ageDays, "dzień", "dni", "dni")}
      </span>
      <span className="t-meta">
        {conditions?.responseTime
          ? `oczekuje: ${responseTimeLabels[conditions.responseTime].toLocaleLowerCase("pl")}`
          : "oczekiwanie: —"}
      </span>
      {isOverdue(conditions, ageDays) && <span className="badge warn">Czas minął</span>}
    </span>
  );
}

/** Key-value list of candidate conditions; missing values are shown as "—". */
export function ConditionsList({
  conditions,
  bandRange,
}: {
  conditions?: Conditions;
  bandRange?: Partial<Record<"low" | "mid" | "high", string>>;
}) {
  const fmt = new Intl.NumberFormat("pl-PL");
  const c = conditions ?? {};
  const band = c.band;
  return (
    <dl className="kv conditions">
      <dt>Min. wynagrodzenie</dt>
      <dd className="t-data">{c.minSalary ? `${fmt.format(c.minSalary)} zł` : "—"}</dd>
      <dt>Tryb pracy</dt>
      <dd>{c.workMode ? workModeLabels[c.workMode] : "—"}</dd>
      <dt>Dostępność</dt>
      <dd>{c.availability ? availabilityLabels[c.availability] : "—"}</dd>
      <dt>Odpowiedź do</dt>
      <dd>{c.responseTime ? responseTimeLabels[c.responseTime] : "—"}</dd>
      <dt>Część widełek</dt>
      <dd>
        {band ? bandLabels[band] : "—"}
        {band && band !== "none" && bandRange?.[band] && (
          <span className="t-data conditions-range"> {bandRange[band]}</span>
        )}
      </dd>
    </dl>
  );
}

/** Optional radio group with a "clear" link, used by the conditions forms. */
export function OptionGroup<T extends string>({
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
